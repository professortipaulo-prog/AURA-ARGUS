export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold">AURA / ARGUS</h1>
      <p className="max-w-md text-sm opacity-70">
        Sprint 004 — Núcleo de Inteligência (Core Intelligence). Esta tela é um
        placeholder herdado das sprints anteriores. Os módulos AI Router,
        Conversation Manager, Context Builder, Prompt Builder, Memory
        Retrieval, Personality Engine e Workflow Engine estão disponíveis em
        <code className="mx-1 rounded bg-black/5 px-1 py-0.5">/modules</code>
        prontos para integração futura com Gemini e Anthropic.
      </p>
    </main>
  );
}
