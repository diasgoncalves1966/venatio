import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Entrar</h1>
        <p className="mt-2 text-stone-600">Acede à tua conta Venatio.</p>
      </div>
      <LoginForm />
    </main>
  );
}
