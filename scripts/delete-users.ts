/**
 * Delete every user (and their content) EXCEPT demo@devstash.io.
 *
 * System item types (`userId = null`) and the demo user's data are preserved.
 * Dry-run by default — pass `--yes` (or `--force`) to actually delete.
 *
 *   npx tsx scripts/delete-users.ts          # preview what would be deleted
 *   npx tsx scripts/delete-users.ts --yes    # apply
 *
 * Targets whatever DATABASE_URL points to (the dev branch by default).
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

const KEEP_EMAIL = "demo@devstash.io";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Add it to your .env file.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const apply =
    process.argv.includes("--yes") || process.argv.includes("--force");

  console.log(`Target DB host: ${new URL(connectionString!).host}`);
  console.log(`Keeping user:   ${KEEP_EMAIL}\n`);

  // Safety: refuse to run if the user we must keep doesn't exist.
  const keep = await prisma.user.findUnique({
    where: { email: KEEP_EMAIL },
    select: { id: true },
  });
  if (!keep) {
    throw new Error(
      `Safety check failed: "${KEEP_EMAIL}" not found in this database. ` +
        `Aborting so we don't delete every user by mistake.`,
    );
  }

  const doomed = await prisma.user.findMany({
    where: { email: { not: KEEP_EMAIL } },
    select: { id: true, email: true },
  });

  console.log(`Users to delete: ${doomed.length}`);
  for (const u of doomed) {
    console.log(`  - ${u.email ?? "(no email)"} (${u.id})`);
  }

  if (doomed.length === 0) {
    console.log("\nNothing to delete.");
    return;
  }

  if (!apply) {
    console.log("\nDRY RUN — no changes made. Re-run with --yes to apply.");
    return;
  }

  const ids = doomed.map((u) => u.id);

  // FK-safe order: items before item types (Item.itemTypeId is restrict, not
  // cascade). Everything else cascades from userId, but we delete explicitly so
  // the run is deterministic and reportable.
  const deleted = await prisma.$transaction(async (tx) => {
    const items = await tx.item.deleteMany({ where: { userId: { in: ids } } });
    const collections = await tx.collection.deleteMany({
      where: { userId: { in: ids } },
    });
    const itemTypes = await tx.itemType.deleteMany({
      where: { userId: { in: ids } },
    });
    const tags = await tx.tag.deleteMany({ where: { userId: { in: ids } } });
    const sessions = await tx.session.deleteMany({
      where: { userId: { in: ids } },
    });
    const accounts = await tx.account.deleteMany({
      where: { userId: { in: ids } },
    });
    const users = await tx.user.deleteMany({ where: { id: { in: ids } } });
    // Orphaned email-verification tokens for anyone other than the demo user.
    const tokens = await tx.verificationToken.deleteMany({
      where: { identifier: { not: KEEP_EMAIL } },
    });

    return {
      items,
      collections,
      itemTypes,
      tags,
      sessions,
      accounts,
      users,
      tokens,
    };
  });

  console.log("\nDeleted:");
  console.log(`  items:               ${deleted.items.count}`);
  console.log(`  collections:         ${deleted.collections.count}`);
  console.log(`  custom item types:   ${deleted.itemTypes.count}`);
  console.log(`  tags:                ${deleted.tags.count}`);
  console.log(`  sessions:            ${deleted.sessions.count}`);
  console.log(`  accounts:            ${deleted.accounts.count}`);
  console.log(`  users:               ${deleted.users.count}`);
  console.log(`  verification tokens: ${deleted.tokens.count}`);
  console.log("\n✅ Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
