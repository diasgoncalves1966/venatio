import { ListingDetail } from '@/components/listing-detail';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AnuncioPage({ params }: Props) {
  const { id } = await params;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <ListingDetail id={id} />
    </main>
  );
}
