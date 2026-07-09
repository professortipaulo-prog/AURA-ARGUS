/**
 * modules/faceid/index.ts
 * Status: parcialmente implementado (PATCH_096). Cadastro de rosto
 * (consentimento + captura + descritor de 128 numeros salvo no servidor,
 * nunca a foto) ja funciona de verdade, via components/face-enrollment.tsx,
 * lib/face/server.ts e app/api/face/enroll -- ainda nao migrados para
 * viver fisicamente dentro deste modulo.
 *
 * PENDENTE: uso do reconhecimento facial no login (verificacao 1:1 do
 * rosto para autenticar sem senha) -- adiado deliberadamente por exigir
 * cuidado extra em fluxo de autenticacao (area de alto risco de
 * seguranca). Login por senha continua sendo o metodo principal e
 * sempre funcional.
 */
export const MODULE_STATUS = 'partial' as const;
