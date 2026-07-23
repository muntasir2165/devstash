/**
 * Mock data for the DevStash dashboard UI.
 *
 * Single source of truth for display data until the database is wired up.
 * Shapes mirror the Prisma models in context/project-overview.md, simplified
 * for rendering the dashboard. Relationships are referenced by id
 * (e.g. `Collection.typeIds`, `Item.typeId`, `Item.collectionIds`).
 */

export type ContentType = "TEXT" | "URL" | "FILE";

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isPro: boolean;
}

export interface ItemType {
  id: string;
  name: string;
  /** URL segment, e.g. "snippets" for /items/snippets */
  slug: string;
  /** Lucide icon name */
  icon: string;
  /** Hex color, e.g. "#3b82f6" */
  color: string;
  contentType: ContentType;
  isSystem: boolean;
  /** Number shown next to the type in the sidebar */
  count: number;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  isFavorite: boolean;
  /** ItemType ids present in this collection; the first is the dominant type (drives card color) */
  typeIds: string[];
}

export interface Item {
  id: string;
  title: string;
  description: string;
  typeId: string;
  contentType: ContentType;
  /** Text body for TEXT items, otherwise null */
  content: string | null;
  /** Target for URL items, otherwise null */
  url: string | null;
  /** Language for code snippets, otherwise null */
  language: string | null;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  /** ISO date string */
  createdAt: string;
  collectionIds: string[];
}

export const currentUser: User = {
  id: "user-1",
  name: "John Doe",
  email: "john@example.com",
  image: null,
  isPro: true,
};

export const itemTypes: ItemType[] = [
  {
    id: "type-snippet",
    name: "Snippets",
    slug: "snippets",
    icon: "Code",
    color: "#3b82f6",
    contentType: "TEXT",
    isSystem: true,
    count: 24,
  },
  {
    id: "type-prompt",
    name: "Prompts",
    slug: "prompts",
    icon: "Sparkles",
    color: "#8b5cf6",
    contentType: "TEXT",
    isSystem: true,
    count: 18,
  },
  {
    id: "type-command",
    name: "Commands",
    slug: "commands",
    icon: "Terminal",
    color: "#f97316",
    contentType: "TEXT",
    isSystem: true,
    count: 15,
  },
  {
    id: "type-note",
    name: "Notes",
    slug: "notes",
    icon: "StickyNote",
    color: "#fde047",
    contentType: "TEXT",
    isSystem: true,
    count: 12,
  },
  {
    id: "type-file",
    name: "Files",
    slug: "files",
    icon: "File",
    color: "#6b7280",
    contentType: "FILE",
    isSystem: true,
    count: 5,
  },
  {
    id: "type-image",
    name: "Images",
    slug: "images",
    icon: "Image",
    color: "#ec4899",
    contentType: "FILE",
    isSystem: true,
    count: 3,
  },
  {
    id: "type-link",
    name: "Links",
    slug: "links",
    icon: "Link",
    color: "#10b981",
    contentType: "URL",
    isSystem: true,
    count: 8,
  },
];

export const collections: Collection[] = [
  {
    id: "col-react-patterns",
    name: "React Patterns",
    description: "Common React patterns and hooks",
    itemCount: 12,
    isFavorite: true,
    typeIds: ["type-snippet", "type-note", "type-link"],
  },
  {
    id: "col-python-snippets",
    name: "Python Snippets",
    description: "Useful Python code snippets",
    itemCount: 8,
    isFavorite: false,
    typeIds: ["type-snippet", "type-note"],
  },
  {
    id: "col-context-files",
    name: "Context Files",
    description: "AI context files for projects",
    itemCount: 5,
    isFavorite: true,
    typeIds: ["type-file", "type-note"],
  },
  {
    id: "col-interview-prep",
    name: "Interview Prep",
    description: "Technical interview preparation",
    itemCount: 24,
    isFavorite: false,
    typeIds: ["type-note", "type-snippet", "type-link", "type-prompt"],
  },
  {
    id: "col-git-commands",
    name: "Git Commands",
    description: "Frequently used git commands",
    itemCount: 15,
    isFavorite: true,
    typeIds: ["type-command", "type-note"],
  },
  {
    id: "col-ai-prompts",
    name: "AI Prompts",
    description: "Curated AI prompts for coding",
    itemCount: 18,
    isFavorite: false,
    typeIds: ["type-prompt", "type-snippet", "type-note"],
  },
];

export const items: Item[] = [
  {
    id: "item-use-auth",
    title: "useAuth Hook",
    description: "Custom authentication hook for React applications",
    typeId: "type-snippet",
    contentType: "TEXT",
    content:
      "export function useAuth() {\n  const { data: session, status } = useSession();\n  return { user: session?.user, isLoading: status === \"loading\" };\n}",
    url: null,
    language: "typescript",
    tags: ["react", "auth", "hooks"],
    isPinned: true,
    isFavorite: true,
    createdAt: "2026-01-15",
    collectionIds: ["col-react-patterns", "col-interview-prep"],
  },
  {
    id: "item-api-error-handling",
    title: "API Error Handling Pattern",
    description: "Fetch wrapper with exponential backoff retry logic",
    typeId: "type-snippet",
    contentType: "TEXT",
    content:
      "async function fetchWithRetry(url, options, retries = 3) {\n  for (let i = 0; i < retries; i++) {\n    try {\n      return await fetch(url, options);\n    } catch (err) {\n      await new Promise((r) => setTimeout(r, 2 ** i * 100));\n    }\n  }\n  throw new Error(\"Request failed after retries\");\n}",
    url: null,
    language: "typescript",
    tags: ["fetch", "error-handling", "api"],
    isPinned: true,
    isFavorite: false,
    createdAt: "2026-01-12",
    collectionIds: ["col-react-patterns"],
  },
  {
    id: "item-git-interactive-rebase",
    title: "Interactive Rebase",
    description: "Squash the last few commits into one",
    typeId: "type-command",
    contentType: "TEXT",
    content: "git rebase -i HEAD~3",
    url: null,
    language: "bash",
    tags: ["git", "rebase"],
    isPinned: false,
    isFavorite: false,
    createdAt: "2026-01-10",
    collectionIds: ["col-git-commands"],
  },
  {
    id: "item-refactor-prompt",
    title: "Refactor to Clean Code",
    description: "Prompt that refactors code for readability and clarity",
    typeId: "type-prompt",
    contentType: "TEXT",
    content:
      "Refactor the following code for readability. Keep behavior identical, add clear names, and remove duplication. Explain each change briefly.",
    url: null,
    language: null,
    tags: ["refactor", "ai", "clean-code"],
    isPinned: false,
    isFavorite: true,
    createdAt: "2026-01-08",
    collectionIds: ["col-ai-prompts"],
  },
  {
    id: "item-timing-decorator",
    title: "Timing Decorator",
    description: "Measure how long a Python function takes to run",
    typeId: "type-snippet",
    contentType: "TEXT",
    content:
      "import time\n\ndef timed(fn):\n    def wrapper(*args, **kwargs):\n        start = time.perf_counter()\n        result = fn(*args, **kwargs)\n        print(f\"{fn.__name__} took {time.perf_counter() - start:.4f}s\")\n        return result\n    return wrapper",
    url: null,
    language: "python",
    tags: ["python", "decorator", "performance"],
    isPinned: false,
    isFavorite: false,
    createdAt: "2026-01-06",
    collectionIds: ["col-python-snippets"],
  },
  {
    id: "item-nextjs-docs",
    title: "Next.js App Router Docs",
    description: "Official documentation for the App Router",
    typeId: "type-link",
    contentType: "URL",
    content: null,
    url: "https://nextjs.org/docs/app",
    language: null,
    tags: ["nextjs", "docs", "react"],
    isPinned: false,
    isFavorite: false,
    createdAt: "2026-01-04",
    collectionIds: ["col-react-patterns"],
  },
  {
    id: "item-project-context",
    title: "Project Context",
    description: "Base context file describing the project for AI tools",
    typeId: "type-note",
    contentType: "TEXT",
    content:
      "DevStash is a searchable, AI-enhanced hub for snippets, prompts, notes, commands, files, images, and links.",
    url: null,
    language: null,
    tags: ["context", "ai", "notes"],
    isPinned: false,
    isFavorite: false,
    createdAt: "2026-01-02",
    collectionIds: ["col-context-files"],
  },
];
