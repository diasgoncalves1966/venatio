import { CreateListingForm } from '@/components/create-listing-form';

export default function NovoAnuncioPage() {
  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Novo anúncio</h1>
        <p className="mt-2 text-stone-600">Publica equipamento de caça.</p>
      </div>
      <CreateListingForm />
    </main>
  );
}
