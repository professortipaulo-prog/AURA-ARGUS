import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FaceEnrollmentPanel } from '@/components/face-enrollment';

export default function Page() {
  return (
    <>
      <Header title="Configurações" subtitle="Perfil, integrações e preferências." />
      <section className="p-5 lg:p-8 grid gap-6">
        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Nome" />
            <Input placeholder="E-mail" />
            <Input placeholder="Empresa" />
            <Input placeholder="Perfil DISC" />
          </div>
        </Card>
        <FaceEnrollmentPanel />
      </section>
    </>
  );
}
