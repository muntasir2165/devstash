"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ChangePasswordState = { error?: string; success?: boolean };

/** Change the signed-in credentials user's password after verifying the current one. */
export async function changePassword(
  _prev: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be signed in." };

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { hashedPassword: true },
  });
  // GitHub-only accounts have no password to change.
  if (!user?.hashedPassword) {
    return { error: "Password change isn't available for this account." };
  }

  const currentValid = await bcrypt.compare(currentPassword, user.hashedPassword);
  if (!currentValid) {
    return { error: "Your current password is incorrect." };
  }

  const sameAsOld = await bcrypt.compare(newPassword, user.hashedPassword);
  if (sameAsOld) {
    return { error: "New password must be different from your current one." };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { hashedPassword },
  });

  return { success: true };
}

/** Permanently delete the signed-in user and all their data, then sign out. */
export async function deleteAccount(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId = session.user.id;
  const email = session.user.email ?? undefined;

  // FK-safe order: items before item types (Item.itemTypeId is restrict), then
  // the rest. Custom item types have this userId; system types (null) are safe.
  await prisma.$transaction(async (tx) => {
    await tx.item.deleteMany({ where: { userId } });
    await tx.collection.deleteMany({ where: { userId } });
    await tx.itemType.deleteMany({ where: { userId } });
    await tx.tag.deleteMany({ where: { userId } });
    await tx.session.deleteMany({ where: { userId } });
    await tx.account.deleteMany({ where: { userId } });
    await tx.user.delete({ where: { id: userId } });
    if (email) {
      await tx.verificationToken.deleteMany({
        where: { identifier: { in: [email, `password-reset:${email}`] } },
      });
    }
  });

  await signOut({ redirectTo: "/sign-in?deleted=1" });
}
