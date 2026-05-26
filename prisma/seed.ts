import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_ADMIN = {
  name: "Humberto",
  email: "hto.montenegro@gmail.com",
  password: "mucSC1993@@",
};

async function main() {
  const name = process.env.SEED_ADMIN_NAME ?? DEFAULT_ADMIN.name;
  const email = (process.env.SEED_ADMIN_EMAIL ?? DEFAULT_ADMIN.email).toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? DEFAULT_ADMIN.password;

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    create: { email, name, passwordHash },
    update: { name, passwordHash },
  });

  console.log(`Seeded admin user: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
