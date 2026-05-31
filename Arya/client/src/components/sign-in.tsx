import { authMutationKeys } from "@better-auth-ui/core"
import {
  useAuth,
  useFetchOptions,
  useSendVerificationEmail,
  useSignInEmail
} from "@better-auth-ui/react"
import { useIsMutating } from "@tanstack/react-query"
import { type SyntheticEvent, useState } from "react"
import { ArrowRight } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { AuthShell } from "./auth-shell"
import type { SocialLayout } from "./provider-buttons"

export type SignInProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
}

/**
 * Render the sign-in form UI with email/password, magic link, and social provider options.
 *
 * @param className - Optional additional container class names
 * @param socialLayout - Layout style for social provider buttons
 * @param socialPosition - Position of social provider buttons; `"top"` or `"bottom"`. Defaults to `"bottom"`.
 * @returns The rendered sign-in UI as a JSX element
 */
export function SignIn({
  className,
  socialLayout,
  socialPosition = "bottom"
}: SignInProps) {
  void socialLayout
  void socialPosition

  const {
    authClient,
    basePaths,
    baseURL,
    emailAndPassword,
    localization,
    plugins,
    redirectTo,
    viewPaths,
    Link
  } = useAuth()

  const { fetchOptions, resetFetchOptions } = useFetchOptions()

  const [password, setPassword] = useState("")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { mutate: sendVerificationEmail } = useSendVerificationEmail(
    authClient,
    {
      onSuccess: () => toast.success(localization.auth.verificationEmailSent)
    }
  )

  const { mutate: signInEmail, isPending: signInEmailPending } = useSignInEmail(
    authClient,
    {
      onError: (error, { email }) => {
        setPassword("")
        setSuccessMessage(null)

        if (error.error?.code === "EMAIL_NOT_VERIFIED") {
          toast.error(error.error?.message || error.message, {
            action: {
              label: localization.auth.resend,
              onClick: () =>
                sendVerificationEmail({
                  email,
                  callbackURL: `${baseURL}${redirectTo}`
                })
            }
          })
        } else {
          toast.error(error.error?.message || error.message)
        }

        resetFetchOptions()
      },
      onSuccess: () => {
        setSuccessMessage("Sign in successful. Redirecting to home...")
        window.setTimeout(() => {
          window.location.assign(redirectTo)
        }, 900)
      }
    }
  )

  const signInMutating = useIsMutating({
    mutationKey: authMutationKeys.signIn.all
  })
  const signUpMutating = useIsMutating({
    mutationKey: authMutationKeys.signUp.all
  })
  const isPending = signInMutating + signUpMutating > 0

  const Captcha = plugins.find(
    (plugin) => plugin.captchaComponent
  )?.captchaComponent

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const rememberMe = formData.get("rememberMe") === "on"

    signInEmail({
      email,
      password,
      ...(emailAndPassword?.rememberMe ? { rememberMe } : {}),
      fetchOptions
    })
  }

  return (
    <AuthShell
      eyebrow="Authentication module"
      title="Welcome back"
      description="Sign in to continue building with your projects and workspace."
      className={cn(className)}
      footer={
        emailAndPassword?.enabled ? (
          <FieldDescription className="text-center text-sm text-slate-400">
            Need an account?{" "}
            <Link
              href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
              className="font-medium text-sky-300 transition hover:text-sky-200"
            >
              {localization.auth.signUp}
            </Link>
          </FieldDescription>
        ) : null
      }
    >
      <div className="flex flex-col gap-6">
        {emailAndPassword?.enabled && (
          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-5">
              <Field data-invalid={!!fieldErrors.email} className="gap-2">
                <Label
                  htmlFor="email"
                  className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-300"
                >
                  {localization.auth.email}
                </Label>

                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={localization.auth.emailPlaceholder}
                  required
                  disabled={isPending}
                  className="h-12 border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500 focus-visible:ring-sky-400"
                  onChange={() => {
                    setFieldErrors((prev) => ({
                      ...prev,
                      email: undefined
                    }))
                  }}
                  onInvalid={(e) => {
                    e.preventDefault()

                    setFieldErrors((prev) => ({
                      ...prev,
                      email: (e.target as HTMLInputElement).validationMessage
                    }))
                  }}
                  aria-invalid={!!fieldErrors.email}
                />

                <FieldError className="text-xs text-rose-300">
                  {fieldErrors.email}
                </FieldError>
              </Field>

              <Field data-invalid={!!fieldErrors.password} className="gap-2">
                <div className="flex items-center justify-between gap-3">
                  <Label
                    htmlFor="password"
                    className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-300"
                  >
                    {localization.auth.password}
                  </Label>

                  {emailAndPassword?.forgotPassword && (
                    <Link
                      href={`${basePaths.auth}/${viewPaths.auth.forgotPassword}`}
                      className="text-xs font-medium text-sky-300 transition hover:text-sky-200"
                    >
                      {localization.auth.forgotPasswordLink}
                    </Link>
                  )}
                </div>

                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)

                    setFieldErrors((prev) => ({
                      ...prev,
                      password: undefined
                    }))
                  }}
                  placeholder={localization.auth.passwordPlaceholder}
                  required
                  minLength={emailAndPassword?.minPasswordLength}
                  maxLength={emailAndPassword?.maxPasswordLength}
                  disabled={isPending}
                  className="h-12 border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500 focus-visible:ring-sky-400"
                  onInvalid={(e) => {
                    e.preventDefault()

                    setFieldErrors((prev) => ({
                      ...prev,
                      password: (e.target as HTMLInputElement).validationMessage
                    }))
                  }}
                  aria-invalid={!!fieldErrors.password}
                />

                <FieldError className="text-xs text-rose-300">
                  {fieldErrors.password}
                </FieldError>
              </Field>

              {emailAndPassword.rememberMe && (
                <Field className="my-1">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="rememberMe"
                      name="rememberMe"
                      disabled={isPending}
                      className="border-white/20 data-[state=checked]:bg-sky-400 data-[state=checked]:text-slate-950"
                    />

                    <Label
                      htmlFor="rememberMe"
                      className="cursor-pointer text-sm font-normal text-slate-300"
                    >
                      {localization.auth.rememberMe}
                    </Label>
                  </div>
                </Field>
              )}

              {Captcha && <div className="flex justify-center">{Captcha}</div>}

              <div className="flex flex-col gap-3 pt-1">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-12 bg-sky-400 font-semibold text-slate-950 transition hover:bg-sky-300"
                >
                  {signInEmailPending && <Spinner />}
                  {localization.auth.signIn}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </FieldGroup>
          </form>
        )}

        {successMessage && (
          <p className="text-center text-sm font-medium text-emerald-300">
            {successMessage}
          </p>
        )}
      </div>
    </AuthShell>
  )
}
