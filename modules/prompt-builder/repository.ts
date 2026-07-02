/**
 * modules/prompt-builder/repository.ts
 * O Prompt Builder é majoritariamente stateless (função pura de
 * montagem). Este repositório fica reservado para armazenar templates
 * de prompt versionados no futuro (ex: templates por persona/tarefa).
 */
export interface PromptTemplateRecord {
  id: string;
  persona: 'aura' | 'argus';
  template: string;
  version: string;
}

export class InMemoryPromptTemplateRepository {
  private templates: PromptTemplateRecord[] = [];

  async save(template: PromptTemplateRecord): Promise<void> {
    this.templates.push(template);
  }

  async findByPersona(persona: 'aura' | 'argus'): Promise<PromptTemplateRecord[]> {
    return this.templates.filter((t) => t.persona === persona);
  }
}
