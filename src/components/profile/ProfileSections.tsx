import { Calendar, FileStack, FolderOpen, Mail } from "lucide-react";

import type { ProfileStats } from "@/lib/db/profile";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { TypeIcon } from "@/components/dashboard/TypeIcon";

export function ProfileHeader({
  name,
  email,
  image,
}: {
  name: string | null;
  email: string | null;
  image: string | null;
}) {
  return (
    <div className="flex items-center gap-4">
      <UserAvatar name={name} image={image} className="size-16" />
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold tracking-tight">
          {name?.trim() || "User"}
        </h1>
        {email ? (
          <p className="truncate text-sm text-muted-foreground">{email}</p>
        ) : null}
      </div>
    </div>
  );
}

export function AccountInfo({
  email,
  memberSince,
}: {
  email: string | null;
  memberSince: string;
}) {
  const info = [
    { icon: Mail, label: "Email", value: email ?? "—" },
    { icon: Calendar, label: "Member since", value: memberSince },
  ];

  return (
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
  );
}

export function UsageStats({ stats }: { stats: ProfileStats }) {
  const usage = [
    { icon: FileStack, label: "Total Items", value: stats.totalItems },
    { icon: FolderOpen, label: "Collections", value: stats.totalCollections },
  ];

  return (
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
  );
}
