const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');
const { writeFileSync, mkdirSync, existsSync } = require('fs');
const { join } = require('path');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const uploadDir = join(process.cwd(), 'uploads');
const PUBLIC = process.env.PUBLIC_API_URL || 'http://localhost:3001';

function makePng(seed) {
  const base = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC',
    'base64',
  );
  return Buffer.concat([base, Buffer.from(String(seed))]);
}

function saveImage(seed) {
  if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
  const name = `${randomUUID()}.png`;
  writeFileSync(join(uploadDir, name), makePng(seed));
  return `${PUBLIC}/uploads/${name}`;
}

const sampleListings = [
  {
    title: 'Carabina de ar comprimido',
    description: 'Carabina em bom estado, ideal para treino e iniciação. Inclui mira.',
    priceCents: 12000,
    condition: 'GOOD',
    category: 'HUNTING',
    city: 'Lisboa',
    country: 'PT',
  },
  {
    title: 'Cana de spinning 2.40m',
    description: 'Cana leve para spinning em água doce e costa. Pouco uso.',
    priceCents: 4500,
    condition: 'LIKE_NEW',
    category: 'OTHER',
    city: 'Porto',
    country: 'PT',
  },
  {
    title: 'Mala de pesca impermeável',
    description: 'Mala com vários compartimentos, impermeável, perfeita para saídas longas.',
    priceCents: 3500,
    condition: 'GOOD',
    category: 'ACCESSORIES',
    city: 'Faro',
    country: 'PT',
  },
  {
    title: 'Casaco impermeável de caça',
    description: 'Casaco resistente à água, tamanho L, cor verde caqui.',
    priceCents: 5500,
    condition: 'GOOD',
    category: 'CLOTHING',
    city: 'Braga',
    country: 'PT',
  },
  {
    title: 'Binóculos 10x42',
    description: 'Binóculos claros e estáveis, ótimos para observação no campo.',
    priceCents: 8900,
    condition: 'LIKE_NEW',
    category: 'ACCESSORIES',
    city: 'Coimbra',
    country: 'PT',
  },
  {
    title: 'Rede de desembolsar',
    description: 'Rede com cabo telescópico, pouco uso, sem furos.',
    priceCents: 1800,
    condition: 'GOOD',
    category: 'OTHER',
    city: 'Aveiro',
    country: 'PT',
  },
  {
    title: 'Cinto de cartuchos',
    description: 'Cinto em pele, capacidade média, em bom estado geral.',
    priceCents: 2200,
    condition: 'FAIR',
    category: 'HUNTING',
    city: 'Évora',
    country: 'PT',
  },
  {
    title: 'Botas de pesca nº 43',
    description: 'Botas impermeáveis até ao joelho, sola aderente.',
    priceCents: 4000,
    condition: 'GOOD',
    category: 'CLOTHING',
    city: 'Setúbal',
    country: 'PT',
  },
  {
    title: 'Caixa de iscos artificial',
    description: 'Conjunto de iscos artificiais variados com caixa organizada.',
    priceCents: 2700,
    condition: 'NEW',
    category: 'OTHER',
    city: 'Leiria',
    country: 'PT',
  },
  {
    title: 'Mira telescópica 3-9x40',
    description: 'Mira robusta, ajustes suaves, pronta a montar.',
    priceCents: 9500,
    condition: 'GOOD',
    category: 'HUNTING',
    city: 'Viseu',
    country: 'PT',
  },
];

const categorySlugByLegacy = {
  HUNTING: 'hunting',
  ACCESSORIES: 'accessories',
  CLOTHING: 'clothing',
  OTHER: 'other',
};

async function main() {
  const email = 'seed@venatio.pt';
  const passwordHash = await bcrypt.hash('password1', 12);
  const generalGroup = await prisma.group.findUnique({ where: { slug: 'general' } });
  if (!generalGroup) throw new Error('Missing general group');

  const categories = await prisma.category.findMany();
  const categoryIdBySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  const seller = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      displayName: 'Loja Seed',
      city: 'Lisboa',
      country: 'PT',
      groupId: generalGroup.id,
    },
  });

  const existing = await prisma.listing.findMany({
    include: { images: true },
    orderBy: { createdAt: 'asc' },
  });

  for (const listing of existing) {
    if (listing.images.length === 0) {
      const url = saveImage(listing.id);
      await prisma.listingImage.create({
        data: { listingId: listing.id, url, sortOrder: 0 },
      });
      console.log('added image to', listing.title);
    } else {
      console.log('already has image', listing.title);
    }
  }

  let total = await prisma.listing.count();
  let i = 0;
  while (total < 10 && i < sampleListings.length) {
    const sample = sampleListings[i++];
    const existsTitle = await prisma.listing.findFirst({ where: { title: sample.title } });
    if (existsTitle) continue;

    const slug = categorySlugByLegacy[sample.category];
    const categoryId = categoryIdBySlug[slug];
    if (!categoryId) throw new Error(`Missing category ${slug}`);

    const url = saveImage(`new-${i}`);
    const { category: _legacyCategory, ...rest } = sample;
    await prisma.listing.create({
      data: {
        ...rest,
        categoryId,
        currency: 'EUR',
        status: 'ACTIVE',
        sellerId: seller.id,
        images: { create: [{ url, sortOrder: 0 }] },
      },
    });
    total += 1;
    console.log('created', sample.title);
  }

  while (total < 10) {
    const idx = total + 1;
    const sample = sampleListings[(idx - 1) % sampleListings.length];
    const slug = categorySlugByLegacy[sample.category];
    const categoryId = categoryIdBySlug[slug];
    const url = saveImage(`extra-${idx}`);
    const { category: _legacyCategory, ...rest } = sample;
    await prisma.listing.create({
      data: {
        ...rest,
        title: `${sample.title} #${idx}`,
        categoryId,
        currency: 'EUR',
        status: 'ACTIVE',
        sellerId: seller.id,
        images: { create: [{ url, sortOrder: 0 }] },
      },
    });
    total += 1;
    console.log('created extra', `${sample.title} #${idx}`);
  }

  const finalListings = await prisma.listing.findMany({
    include: { images: true },
    orderBy: { createdAt: 'asc' },
  });
  console.log('TOTAL', finalListings.length);
  for (const listing of finalListings) {
    console.log(`${listing.title} | imgs=${listing.images.length} | ${listing.status}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
