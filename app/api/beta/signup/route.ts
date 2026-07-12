import { NextRequest, NextResponse } from 'next/server';
import { signupBetaUser } from '@/lib/beta/signup';

export const dynamic = 'force-dynamic';

function calculateAge(dateOfBirth: string): number | null {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age -= 1;
  return age;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const fullName = typeof body?.fullName === 'string' ? body.fullName.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const dateOfBirth = typeof body?.dateOfBirth === 'string' ? body.dateOfBirth : '';
  const guardianName = typeof body?.guardianName === 'string' ? body.guardianName.trim() : undefined;
  const guardianEmail = typeof body?.guardianEmail === 'string' ? body.guardianEmail.trim() : undefined;
  const lgpdConsent = Boolean(body?.lgpdConsent);

  if (!lgpdConsent) {
    return NextResponse.json({ ok: false, error: 'É necessário aceitar os termos de uso de dados (LGPD) para continuar.' }, { status: 400 });
  }
  if (!dateOfBirth) {
    return NextResponse.json({ ok: false, error: 'Data de nascimento é obrigatória.' }, { status: 400 });
  }

  const age = calculateAge(dateOfBirth);
  if (age === null) {
    return NextResponse.json({ ok: false, error: 'Data de nascimento inválida.' }, { status: 400 });
  }
  const isMinor = age < 18;

  const result = await signupBetaUser({ isMinor, fullName, email, password, dateOfBirth, guardianName, guardianEmail });
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });

  return NextResponse.json({ ok: true, isMinor });
}
