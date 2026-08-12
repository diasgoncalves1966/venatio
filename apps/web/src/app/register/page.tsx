import { RegisterForm } from '@/components/register-form';

export default function RegisterPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Criar conta</h1>
        <p className="mt-2 text-stone-600">Junta-te ao marketplace de caça.</p>
      </div>
      <RegisterForm />
    </main>
  );
}
