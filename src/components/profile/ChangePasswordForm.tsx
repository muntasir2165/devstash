"use client";

import { useActionState } from "react";

import {
  changePassword,
  type ChangePasswordState,
} from "@/lib/profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ChangePasswordState = {};

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePassword,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-3">
      <div className="grid gap-1.5">
        <label htmlFor="currentPassword" className="text-sm font-medium">
          Current password
        </label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="newPassword" className="text-sm font-medium">
          New password
        </label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm new password
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p
          role="status"
          className="rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400"
        >
          Password updated.
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
