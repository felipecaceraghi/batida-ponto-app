import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Helper to hash a password using SHA-256. While not as strong as bcrypt,
 * this avoids pulling in additional dependencies and simplifies seeding
 * in environments without network access. Production systems should use
 * a strong password hashing algorithm like bcrypt or argon2.
 */
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  // Predefined user accounts. These can be adjusted as needed.
  const users = [
    { email: 'usuario1@empresa.com', password: 'senha1' },
    { email: 'usuario2@empresa.com', password: 'senha2' },
    { email: 'usuario3@empresa.com', password: 'senha3' }
  ];

  for (const u of users) {
    const hashed = hashPassword(u.password);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hashed },
      create: {
        email: u.email,
        password: hashed
      }
    });
  }
  console.log('Database seeded with predefined users');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
