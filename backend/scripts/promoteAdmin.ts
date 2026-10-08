import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteAdmin(email: string) {
  try {
    const user = await prisma.profile.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    if (user.role === 'ADMIN') {
      console.log(`User ${email} is already an ADMIN.`);
      process.exit(0);
    }

    await prisma.profile.update({
      where: { email },
      data: { role: 'ADMIN' }
    });

    console.log(`Successfully promoted ${email} to ADMIN.`);
  } catch (error) {
    console.error('Error promoting admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const emailArgs = process.argv.slice(2);
if (emailArgs.length !== 1) {
  console.log('Usage: npx ts-node scripts/promoteAdmin.ts <email>');
  process.exit(1);
}

promoteAdmin(emailArgs[0]);
