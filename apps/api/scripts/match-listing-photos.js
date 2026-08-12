const { PrismaClient } = require('@prisma/client');
const { existsSync } = require('fs');
const { join } = require('path');

const prisma = new PrismaClient();
const PUBLIC = process.env.PUBLIC_API_URL || 'http://192.168.1.81:3001';
const uploadDir = join(process.cwd(), 'uploads');

/** Exact title → product-matching photo */
const byTitle = {
  'Carabina de teste': 'fit-air-rifle.jpg',
  'Carabina de ar comprimido': 'match-forest.jpg',
  'Cana de pesca Porto': 'fit-reel.jpg',
  'Cana de spinning 2.40m': 'px-fishing-3.jpg',
  'Mala de pesca impermeável': 'product-bag.jpg',
  'Casaco impermeável de caça': 'match-parka.jpg',
  'Binóculos 10x42': 'fit-binoculars.jpg',
  'Rede de desembolsar': 'fit-landing-net.jpg',
};

const byCategoryFallback = {
  hunting: 'fit-air-rifle.jpg',
  accessories: 'match-camp.jpg',
  clothing: 'match-parka.jpg',
  other: 'match-camp.jpg',
};

const accessoriesExtras = ['match-camp.jpg', 'fit-fishing-rod.jpg'];

async function main() {
  const listings = await prisma.listing.findMany({
    include: { category: true },
    orderBy: { createdAt: 'asc' },
  });

  let accessoriesIndex = 0;

  for (const listing of listings) {
    let file = byTitle[listing.title];

    if (!file && listing.title.toLowerCase().includes('anuncio com foto')) {
      file = accessoriesExtras[accessoriesIndex % accessoriesExtras.length];
      accessoriesIndex += 1;
    }

    if (!file) {
      file = byCategoryFallback[listing.category?.slug] || 'match-camp.jpg';
    }

    const fullPath = join(uploadDir, file);
    if (!existsSync(fullPath)) {
      throw new Error(`Missing file ${file} for listing ${listing.title}`);
    }

    const url = `${PUBLIC}/uploads/${file}`;
    await prisma.listingImage.deleteMany({ where: { listingId: listing.id } });
    await prisma.listingImage.create({
      data: { listingId: listing.id, url, sortOrder: 0 },
    });

    console.log(`${listing.title} [${listing.category}] -> ${file}`);
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
