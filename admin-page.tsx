import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { getSession, isAdmin } from '@/lib/auth/session';
const rows=['Usuários e papéis','Agentes e provedores','Logs e auditoria','Custos e tokens','Integrações externas'];
export default async function Page(){
  const session = await getSession();
  if (!isAdmin(session)) redirect('/dashboard');
  return <><Header title="Admin" subtitle="Governança e operação da plataforma."/><section className="p-5 lg:p-8"><Card><div className="divide-y divide-white/10">{rows.map(r=><div key={r} className="flex items-center justify-between py-4 text-sm"><span className="text-slate-300">{r}</span><span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs text-indigo-200">preparado</span></div>)}</div></Card></section></>
}
