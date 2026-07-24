import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { ContentType, PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Add it to your .env file.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ─── System item types ──────────────────────────────────
const SYSTEM_TYPES = [
  { name: "snippet", icon: "Code", color: "#3b82f6" },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
  { name: "command", icon: "Terminal", color: "#f97316" },
  { name: "note", icon: "StickyNote", color: "#fde047" },
  { name: "file", icon: "File", color: "#6b7280" },
  { name: "image", icon: "Image", color: "#ec4899" },
  { name: "link", icon: "Link", color: "#10b981" },
];

type SeedItem = {
  type: string; // system item-type name
  title: string;
  description?: string;
  language?: string;
  content?: string;
  url?: string;
};

// ─── Collections + their items ──────────────────────────
const COLLECTIONS: {
  name: string;
  description: string;
  items: SeedItem[];
}[] = [
  {
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    items: [
      {
        type: "snippet",
        title: "useDebounce",
        description: "Debounce a rapidly changing value.",
        language: "typescript",
        content: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}`,
      },
      {
        type: "snippet",
        title: "ThemeProvider (context pattern)",
        description: "Compound context provider for theming.",
        language: "typescript",
        content: `import { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}`,
      },
      {
        type: "snippet",
        title: "cn() classname utility",
        description: "Merge Tailwind classes safely.",
        language: "typescript",
        content: `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`,
      },
    ],
  },
  {
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    items: [
      {
        type: "prompt",
        title: "Code review",
        description: "Thorough pull-request review prompt.",
        content:
          "You are a senior engineer reviewing a pull request. Identify bugs, security issues, and performance concerns. Suggest concrete improvements with code examples, and prioritize your feedback by severity. Be concise.",
      },
      {
        type: "prompt",
        title: "Generate documentation",
        description: "Docstring and README generator.",
        content:
          "Given the following code, generate clear documentation: a one-line summary, a description of parameters and return values, and a short usage example. Match the project's existing documentation style.",
      },
      {
        type: "prompt",
        title: "Refactoring assistant",
        description: "Behavior-preserving refactor prompt.",
        content:
          "Refactor the following code for readability and maintainability without changing its behavior. Keep the public API stable and briefly explain each change you make.",
      },
    ],
  },
  {
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    items: [
      {
        type: "snippet",
        title: "Multi-stage Dockerfile",
        description: "Production Node.js image for a Next.js app.",
        language: "dockerfile",
        content: `FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]`,
      },
      {
        type: "command",
        title: "Deploy to production (Vercel)",
        description: "Build and deploy a prebuilt output.",
        content: "npm run build && npx vercel deploy --prebuilt --prod",
      },
      {
        type: "link",
        title: "GitHub Actions documentation",
        description: "CI/CD workflow reference.",
        url: "https://docs.github.com/actions",
      },
      {
        type: "link",
        title: "Docker documentation",
        description: "Official Docker docs.",
        url: "https://docs.docker.com/",
      },
    ],
  },
  {
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
    items: [
      {
        type: "command",
        title: "Undo last commit (keep changes)",
        description: "Move HEAD back one commit, keeping staged changes.",
        content: "git reset --soft HEAD~1",
      },
      {
        type: "command",
        title: "Prune stopped containers",
        description: "Remove all stopped Docker containers.",
        content: "docker container prune -f",
      },
      {
        type: "command",
        title: "Find process on a port",
        description: "Show the process listening on port 3000.",
        content: "lsof -i :3000",
      },
      {
        type: "command",
        title: "Clean reinstall dependencies",
        description: "Remove modules and lockfile, then reinstall.",
        content: "rm -rf node_modules package-lock.json && npm install",
      },
    ],
  },
  {
    name: "Design Resources",
    description: "UI/UX resources and references",
    items: [
      {
        type: "link",
        title: "Tailwind CSS",
        description: "Utility-first CSS framework docs.",
        url: "https://tailwindcss.com/docs",
      },
      {
        type: "link",
        title: "shadcn/ui",
        description: "Composable React component library.",
        url: "https://ui.shadcn.com",
      },
      {
        type: "link",
        title: "GitHub Primer",
        description: "GitHub's open-source design system.",
        url: "https://primer.style",
      },
      {
        type: "link",
        title: "Lucide Icons",
        description: "Open-source icon library.",
        url: "https://lucide.dev",
      },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Reset existing data (idempotent) — FK-safe order.
  await prisma.itemCollection.deleteMany();
  await prisma.item.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.itemType.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // 2. Demo user.
  const hashedPassword = await bcrypt.hash("12345678", 12);
  const user = await prisma.user.create({
    data: {
      email: "demo@devstash.io",
      name: "Demo User",
      hashedPassword,
      isPro: false,
      emailVerified: new Date(),
    },
  });
  console.log(`👤 Created user ${user.email}`);

  // 3. System item types.
  await prisma.itemType.createMany({
    data: SYSTEM_TYPES.map((t) => ({ ...t, isSystem: true })),
  });
  const types = await prisma.itemType.findMany();
  const typeId = (name: string) => {
    const type = types.find((t) => t.name === name);
    if (!type) throw new Error(`Missing system item type: ${name}`);
    return type.id;
  };
  console.log(`🏷️  Created ${types.length} system item types`);

  // 4. Collections + items (items linked through the ItemCollection join).
  for (const collection of COLLECTIONS) {
    await prisma.collection.create({
      data: {
        name: collection.name,
        description: collection.description,
        userId: user.id,
        items: {
          create: collection.items.map((it) => ({
            item: {
              create: {
                title: it.title,
                description: it.description,
                language: it.language,
                content: it.content ?? null,
                url: it.url ?? null,
                contentType: it.url ? ContentType.URL : ContentType.TEXT,
                userId: user.id,
                itemTypeId: typeId(it.type),
              },
            },
          })),
        },
      },
    });
    console.log(
      `📦 Created collection "${collection.name}" with ${collection.items.length} items`,
    );
  }

  console.log("✅ Seeding complete.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
