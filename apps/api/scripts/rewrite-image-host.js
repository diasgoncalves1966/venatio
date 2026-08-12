const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const images = await prisma.listingImage.findMany();
  let updated = 0;

  for (const image of images) {
    const url = image.url.replace('http://localhost:3001', 'http://192.168.1.81:3001');
    if (url !== image.url) {
      await prisma.listingImage.update({
        where: { id: image.id },
        data: { url },
      });
      updated += 1;
    }
  }

  console.log(`updated ${updated} images`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
