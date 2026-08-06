import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Calendar, FileStack, FolderOpen, Mail } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getProfileStats } from "@/lib/db/profile";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { TypeIcon } from "@/components/dashboard/TypeIcon";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";

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

  const displayName = user.name?.trim() || "User";
  const hasPassword = !!user.hashedPassword;
  const memberSince = user.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const info = [
    { icon: Mail, label: "Email", value: user.email ?? "—" },
    { icon: Calendar, label: "Member since", value: memberSince },
  ];
  const usage = [
    { icon: FileStack, label: "Total Items", value: stats.totalItems },
    { icon: FolderOpen, label: "Collections", value: stats.totalCollections },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 p-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>

      <div className="flex items-center gap-4">
        <UserAvatar name={user.name} image={user.image} className="size-16" />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight">
            {displayName}
          </h1>
          {user.email ? (
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          ) : null}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Account</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          {info.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border bg-card p-4">
              <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="size-4" />
                {label}
              </dt>
              <dd className="mt-1 truncate font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Usage</h2>
        <div className="grid grid-cols-2 gap-4">
          {usage.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <div className="mt-2 text-2xl font-semibold tabular-nums">
                {value}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            Items by type
          </h3>
          <ul className="grid gap-1 sm:grid-cols-2">
            {stats.breakdown.map((type) => (
              <li
                key={type.id}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5"
              >
                <span className="flex items-center gap-2">
                  <TypeIcon icon={type.icon} color={type.color} />
                  <span className="text-sm capitalize">{type.name}</span>
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {type.count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Security</h2>
        {hasPassword ? (
          <div className="rounded-xl border bg-card p-4">
            <h3 className="mb-3 text-sm font-medium">Change password</h3>
            <ChangePasswordForm />
          </div>
        ) : (
          <p className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
            You signed in with GitHub, so there&apos;s no password to change.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-destructive">Danger zone</h2>
        <div className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Delete account</p>
            <p className="text-sm text-muted-foreground">
              Permanently remove your account and all your data.
            </p>
          </div>
          <DeleteAccountDialog />
        </div>
      </section>
    </div>
  );
}
