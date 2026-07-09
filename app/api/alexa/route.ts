import { NextRequest, NextResponse } from 'next/server';
import { sendChat } from '@/lib/ai/ai-router';
import { getIdentityForUserId } from '@/lib/identity/server';
import { buildMemoryPrompt, getMemoryContext, getOrCreateActiveProject } from '@/lib/memory/server';
import { buildPersonaSystemPrompt } from '@/lib/identity/prompt-builder';
import { getKnowledgeContext } from '@/lib/knowledge/server';
import { findUserIdByEmail } from '@/lib/face/server';

export const dynamic = 'force-dynamic';

const SKILL_NAME = 'AURA ARGUS';

function sanitizeForSpeech(raw: string): string {
  return raw
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\uFE0F]/gu, '')
    .replace(/[*_`~#]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function speechResponse(text: string, endSession: boolean) {
  return NextResponse.json({
    version: '1.0',
    response: {
      outputSpeech: { type: 'PlainText', text: sanitizeForSpeech(text) },
      reprompt: endSession
        ? undefined
        : { outputSpeech: { type: 'PlainText', text: 'Você ainda está aí? Pode perguntar algo para AURA ou ARGUS.' } },
      shouldEndSession: endSession
    }
  });
}

async function resolveOwnerUserId(): Promise<{ userId: string | null; email: string | null }> {
  const email = process.env.ALEXA_OWNER_EMAIL ?? null;
  if (!email) return { userId: null, email: null };
  const userId = await findUserIdByEmail(email);
  return { userId, email };
}

async function askPersona(persona: 'aura' | 'argus', query: string): Promise<string> {
  const { userId, email } = await resolveOwnerUserId();

  if (!userId || !email) {
    return 'A skill ainda não está configurada com uma conta. Verifique a variável ALEXA_OWNER_EMAIL no servidor.';
  }

  const { identity } = await getIdentityForUserId(userId, email);
  const activeProject = await getOrCreateActiveProject(userId);
  const memory = await getMemoryContext(userId, 10, query, activeProject.projectId);
  const memoryPrompt = buildMemoryPrompt(memory.context, query);
  const knowledgeContext = await getKnowledgeContext(userId, query);

  const systemPrompt = buildPersonaSystemPrompt({
    persona,
    identity,
    memoryPrompt: knowledgeContext ? `${memoryPrompt}\n\n${knowledgeContext}` : memoryPrompt,
    extraSystemPrompt: 'Você está respondendo por voz, através de um dispositivo Alexa. Seja direto e objetivo — evite listas longas, markdown ou formatação, já que a resposta será lida em voz alta.'
  });

  const result = await sendChat({ message: query, persona, systemPrompt });
  return result.response;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.request) {
    return NextResponse.json({ version: '1.0', response: { shouldEndSession: true } }, { status: 400 });
  }

  // Checagem minima: confirma que a requisicao alega ser para esta skill
  // especifica. Isto NAO substitui verificacao de assinatura criptografica
  // (SignatureCertChainUrl) que a Alexa recomenda oficialmente -- ver
  // ressalva de seguranca no patch. Suficiente para uso pessoal atras de
  // uma URL nao divulgada, nao para producao com varios usuarios.
  const expectedSkillId = process.env.ALEXA_SKILL_ID;
  const requestSkillId = body?.session?.application?.applicationId ?? body?.context?.System?.application?.applicationId;
  if (expectedSkillId && requestSkillId && requestSkillId !== expectedSkillId) {
    return NextResponse.json({ version: '1.0', response: { shouldEndSession: true } }, { status: 403 });
  }

  const requestType = body.request.type;

  try {
    if (requestType === 'LaunchRequest') {
      return speechResponse(
        `${SKILL_NAME} online. Você pode perguntar algo para AURA ou para ARGUS. Por exemplo: pergunte à AURA sobre meus projetos.`,
        false
      );
    }

    if (requestType === 'SessionEndedRequest') {
      return NextResponse.json({ version: '1.0', response: {} });
    }

    if (requestType === 'IntentRequest') {
      const intentName = body.request.intent?.name;
      const querySlot = body.request.intent?.slots?.query?.value as string | undefined;

      if (intentName === 'AskAuraIntent' || intentName === 'AskArgusIntent') {
        const persona = intentName === 'AskArgusIntent' ? 'argus' : 'aura';
        if (!querySlot) {
          return speechResponse('O que você quer perguntar?', false);
        }
        const answer = await askPersona(persona, querySlot);
        return speechResponse(answer, true);
      }

      if (intentName === 'AMAZON.HelpIntent') {
        return speechResponse('Você pode dizer, por exemplo: pergunte à AURA sobre meus projetos, ou pergunte ao ARGUS sobre o status do sistema.', false);
      }

      if (intentName === 'AMAZON.CancelIntent' || intentName === 'AMAZON.StopIntent') {
        return speechResponse('Até logo.', true);
      }

      return speechResponse('Não entendi. Você pode perguntar algo para AURA ou para ARGUS.', false);
    }

    return NextResponse.json({ version: '1.0', response: { shouldEndSession: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido.';
    return speechResponse(`Ocorreu um erro ao consultar o sistema: ${sanitizeForSpeech(message)}`, true);
  }
}
