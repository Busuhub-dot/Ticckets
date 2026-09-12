import bcrypt from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaNeon({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const categories = [
  {
    name: "Biology",
    code: "B" as const,
    email: "biology@eventtickets.local",
    password: "Bio@2026!K7x",
  },
  {
    name: "Mathematics",
    code: "M" as const,
    email: "math@eventtickets.local",
    password: "Math@2026!P4q",
  },
  {
    name: "Art",
    code: "A" as const,
    email: "art@eventtickets.local",
    password: "Art@2026!R8m",
  },
  {
    name: "Commerce",
    code: "C" as const,
    email: "commerce@eventtickets.local",
    password: "Com@2026!T6v",
  },
  {
    name: "Technology",
    code: "T" as const,
    email: "technology@eventtickets.local",
    password: "Tech@2026!N3z",
  },
  {
    name: "OL",
    code: "O" as const,
    email: "ol@eventtickets.local",
    password: "OL@2026!W9k",
  },
];

async function main() {
  console.log("Starting database seed...");

  // ============================================================
  // ADMIN ACCOUNT
  // ============================================================

  const adminPasswordHash = await bcrypt.hash("Admin@2026!X9p", 12);

  await prisma.user.upsert({
    where: {
      email: "admin@eventtickets.local",
    },
    update: {
      name: "System Administrator",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      categoryId: null,
    },
    create: {
      name: "System Administrator",
      email: "admin@eventtickets.local",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      categoryId: null,
    },
  });

  console.log("Created/updated admin account");

  // ============================================================
  // CATEGORIES + CATEGORY STAFF
  // ============================================================

  console.log("Creating categories and category staff...");

  for (const item of categories) {
    // ----------------------------------------------------------
    // Create/update category
    // ----------------------------------------------------------

    const category = await prisma.category.upsert({
      where: {
        code: item.code,
      },
      update: {
        name: item.name,
      },
      create: {
        name: item.name,
        code: item.code,
      },
    });

    // ----------------------------------------------------------
    // Create ticket sequence
    // ----------------------------------------------------------

    await prisma.ticketSequence.upsert({
      where: {
        categoryId: category.id,
      },
      update: {},
      create: {
        categoryId: category.id,
        nextNumber: 1,
      },
    });

    // ----------------------------------------------------------
    // Hash staff password
    // ----------------------------------------------------------

    const passwordHash = await bcrypt.hash(item.password, 12);

    // ----------------------------------------------------------
    // Create/update category staff
    // ----------------------------------------------------------

    await prisma.user.upsert({
      where: {
        email: item.email,
      },
      update: {
        name: `${item.name} Leader`,
        passwordHash,
        role: "CATEGORY_STAFF",
        categoryId: category.id,
      },
      create: {
        name: `${item.name} Leader`,
        email: item.email,
        passwordHash,
        role: "CATEGORY_STAFF",
        categoryId: category.id,
      },
    });

    console.log(`Created/updated ${item.name} staff account`);
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
