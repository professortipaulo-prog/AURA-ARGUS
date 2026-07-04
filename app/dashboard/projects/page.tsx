'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';

type ProjectSummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  memoryCount: number;
  sessionCount: number;
  lastActivityAt: string | null;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadProjects() {
    setLoading(true);
    try {
      const response = await fetch('/api/projects', { cache: 'no-store' });
      const data = await response.json();
      setProjects(Array.isArray(data.projects) ? data.projects : []);
    } finally {
      setLoading(false);
    }
  }

  async function createProject() {
    const name = window.prompt('Nome do novo projeto');
    if (!name?.trim()) return;

    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() })
    });
    const data = await response.json();
    if (!response.ok) {
      window.alert(data.error ?? 'Não foi possível criar o projeto.');
      return;
    }
    await loadProjects();
  }

  useEffect(() => {
    void loadProjects();
  }, []);

  return (
    <>
      <Header title="Projetos" subtitle="Memória, conversas e decisões organizadas por contexto." />
      <section className="projects-memory-page">
        <div className="projects-memory-actions">
          <button type="button" onClick={createProject}>+ Novo projeto</button>
          <Link href="/dashboard/chat">Abrir chat com memória de projeto</Link>
        </div>

        <div className="projects-memory-grid">
          {loading ? (
            <article className="project-memory-card">
              <strong>Carregando projetos...</strong>
              <p>Buscando seus contextos ativos.</p>
            </article>
          ) : null}

          {!loading && !projects.length ? (
            <article className="project-memory-card">
              <strong>Nenhum projeto encontrado</strong>
              <p>Crie um projeto para separar conversas, documentos e decisões.</p>
            </article>
          ) : null}

          {projects.map((project) => (
            <article className="project-memory-card" key={project.id}>
              <strong>{project.name}</strong>
              <p>{project.description ?? 'Projeto ativo para conversas, documentos, decisões e memória contextual.'}</p>
              <footer>
                <span>{project.memoryCount} memórias</span>
                <span>{project.sessionCount} conversas</span>
                {project.lastActivityAt ? <span>última atividade registrada</span> : <span>aguardando uso</span>}
              </footer>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
