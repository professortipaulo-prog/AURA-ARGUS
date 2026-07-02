/**
 * modules/conversation/controller.ts
 * Camada fina de orquestração, pronta para expor rota de API futura.
 */
import { ConversationService } from './service';
import type { AppendMessageInput, CreateConversationInput } from './types';

const service = new ConversationService();

export async function createConversationHandler(input: CreateConversationInput) {
  return service.createConversation(input);
}

export async function appendMessageHandler(input: AppendMessageInput) {
  return service.appendMessage(input);
}

export function getConversationService(): ConversationService {
  return service;
}
