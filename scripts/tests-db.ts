import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Add it to your .env file.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Connecting to the database...");

  // Connectivity check.
  await prisma.$queryRaw`SELECT 1`;
  console.log("✅ Connection successful.\n");

  // Demo user.
  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
  });
  if (!user) {
    console.warn("⚠️  Demo user not found. Run `npx prisma db seed` first.\n");
  } else {
    console.log("👤 Demo user");
    console.table({
      name: user.name,
      email: user.email,
      isPro: user.isPro,
      emailVerified: user.emailVerified?.toISOString() ?? null,
      hasPassword: Boolean(user.hashedPassword),
    });
  }

  // System item types.
  const types = await prisma.itemType.findMany({ orderBy: { name: "asc" } });
  console.log(`\n🏷️  Item types (${types.length})`);
  console.log("   " + types.map((t) => `${t.name} ${t.color}`).join("  ·  "));

  // Collections with their items (via the ItemCollection join).
  const collections = await prisma.collection.findMany({
    orderBy: { name: "asc" },
    include: {
      items: {
        include: { item: { include: { itemType: true } } },
      },
    },
  });

  console.log(`\n📚 Collections (${collections.length})`);
  for (const collection of collections) {
    console.log(
      `\n📦 ${collection.name} — ${collection.description ?? ""} (${collection.items.length} items)`,
    );
    for (const { item } of collection.items) {
      const preview =
        item.url ?? item.content?.split("\n")[0]?.slice(0, 60) ?? "";
      console.log(
        `   • [${item.itemType.name}] ${item.title}${preview ? `  →  ${preview}` : ""}`,
      );
    }
  }

  // Totals.
  const [users, itemTypes, items, collectionCount, tags] = await Promise.all([
    prisma.user.count(),
    prisma.itemType.count(),
    prisma.item.count(),
    prisma.collection.count(),
    prisma.tag.count(),
  ]);
  console.log("\n📊 Totals");
  console.table({ users, itemTypes, items, collections: collectionCount, tags });
  console.log("\n✅ Database test complete.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Database test failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
