import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getProfileStats } from "@/lib/db/profile";
import { formatDate } from "@/lib/utils";
import {
  DangerZone,
  SecuritySection,
} from "@/components/profile/AccountActions";
import {
  AccountInfo,
  ProfileHeader,
  UsageStats,
} from "@/components/profile/ProfileSections";

export const metadata: Metadata = {
  title: "Profile | DevStash",
};

// Reads the session + database on each request.
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/profile");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      createdAt: true,
      hashedPassword: true,
    },
  });
  if (!user) redirect("/sign-in");

  const stats = await getProfileStats(session.user.id);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 p-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>

      <ProfileHeader name={user.name} email={user.email} image={user.image} />
      <AccountInfo
        email={user.email}
        memberSince={formatDate(user.createdAt, "long")}
      />
      <UsageStats stats={stats} />
      <SecuritySection hasPassword={!!user.hashedPassword} />
      <DangerZone />
    </div>
  );
}
