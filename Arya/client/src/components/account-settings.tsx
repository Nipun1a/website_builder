"use client"

import { useAuth } from "@better-auth-ui/react"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import { ChangePassword } from "./change-password"
import { UserProfile } from "./user-profile"

export type AccountSettingsProps = {
  className?: string
}

/**
 * Renders the account settings layout.
 *
 * Uses `emailAndPassword` from `useAuth()` to conditionally show the password
 * section while keeping profile details visible.
 */
export function AccountSettings({
  className,
  ...props
}: AccountSettingsProps & ComponentProps<"div">) {
  const { emailAndPassword } = useAuth()

  return (
    <div
      className={cn("flex w-full flex-col gap-4 md:gap-6", className)}
      {...props}
    >
      <UserProfile />
      {emailAndPassword?.enabled && <ChangePassword />}
    </div>
  )
}
