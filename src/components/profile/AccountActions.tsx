import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";

export function SecuritySection({ hasPassword }: { hasPassword: boolean }) {
  return (
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
  );
}

export function DangerZone() {
  return (
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
  );
}
