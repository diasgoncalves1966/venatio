const { PrismaClient } = require('@prisma/client');
const { existsSync } = require('fs');
const { join } = require('path');

const prisma = new PrismaClient();
const PUBLIC = process.env.PUBLIC_API_URL || 'http://localhost:3001';
const uploadDir = join(process.cwd(), 'uploads');

const photos = [
  'forest-hunt.jpg',
  'fisherman.jpg',
  'camp-gear.jpg',
  'mountain.jpg',
  'woods.jpg',
  'fishing-boat.jpg',
  'fishing-reels.jpg',
  'outdoor-jacket.jpg',
  'binocular-view.jpg',
  'hiking-boots.jpg',
  'river.jpg',
];

async function main() {
  for (const file of photos) {
    if (!existsSync(join(uploadDir, file))) {
      throw new Error(`Missing photo file: ${file}`);
    }
  }

  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: 'asc' },
  });

  for (let i = 0; i < listings.length; i += 1) {
    const listing = listings[i];
    const file = photos[i % photos.length];
    const url = `${PUBLIC}/uploads/${file}`;

    await prisma.listingImage.deleteMany({ where: { listingId: listing.id } });
    await prisma.listingImage.create({
      data: {
        listingId: listing.id,
        url,
        sortOrder: 0,
      },
    });

    console.log(`${i + 1}. ${listing.title} -> ${file}`);
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
