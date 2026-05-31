"use client"

import {
  authMutationKeys,
  parseAdditionalFieldValue
} from "@better-auth-ui/core"
import { useAuth, useFetchOptions, useSignUpEmail } from "@better-auth-ui/react"
import { useIsMutating } from "@tanstack/react-query"
import { Eye, EyeOff } from "lucide-react"
import { type SyntheticEvent, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { AuthShell } from "./auth-shell"
import { AdditionalField } from "./additional-field"
import type { SocialLayout } from "./provider-buttons"

export type SignUpProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
}

/**
 * Renders a sign-up form with name, email, and password fields, optional social provider buttons, and submission handling.
 *
 * Submits credentials to the configured auth client and handles the response:
 * - If email verification is required, shows a notification and navigates to sign-in
 * - On success, refreshes the session and navigates to the configured redirect path
 * - On failure, displays error toasts
 * - Manages a pending state while the request is in-flight
 *
 * @param className - Additional CSS classes applied to the outer container
 * @param socialLayout - Social layout to apply to the component
 * @param socialPosition - Social position to apply to the component
 * @returns The sign-up form React element.
 */
export function SignUp({
  className,
  socialLayout,
  socialPosition = "bottom"
}: SignUpProps) {
  void socialLayout
  void socialPosition

  const {
    additionalFields,
    authClient,
    basePaths,
    emailAndPassword,
    localization,
    plugins,
    redirectTo,
    viewPaths,
    Link
  } = useAuth()

  const { fetchOptions, resetFetchOptions } = useFetchOptions()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { mutate: signUpEmail, isPending: signUpEmailPending } = useSignUpEmail(
    authClient,
    {
      onError: (error) => {
        setPassword("")
        setConfirmPassword("")
        setSuccessMessage(null)
        toast.error(error.error?.message || error.message)
        resetFetchOptions()
      },
      onSuccess: () => {
        setSuccessMessage("Sign up successful. Redirecting to home...")
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

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    // `emailAndPassword.name === false` hides the name field and submits "".
    const name = (formData.get("name") as string | null) ?? ""
    const email = formData.get("email") as string

    if (emailAndPassword?.confirmPassword && password !== confirmPassword) {
      toast.error(localization.auth.passwordsDoNotMatch)
      setPassword("")
      setConfirmPassword("")
      return
    }

    const additionalFieldValues: Record<string, unknown> = {}

    for (const field of additionalFields ?? []) {
      if (!field.signUp || field.readOnly) continue
      const value = parseAdditionalFieldValue(
        field,
        formData.get(field.name) as string | null
      )

      if (field.validate) {
        try {
          await field.validate(value)
        } catch (error) {
          toast.error(error instanceof Error ? error.message : String(error))
          return
        }
      }

      if (value !== undefined) {
        additionalFieldValues[field.name] = value
      }
    }

    signUpEmail({
      name,
      email,
      password,
      ...additionalFieldValues,
      fetchOptions
    })
  }

  return (
    <AuthShell
      eyebrow="Create account"
      title="Get started"
      description="Create your Buildify account and pick up right where your ideas are waiting."
      className={cn(className)}
      footer={
        emailAndPassword?.enabled ? (
          <FieldDescription className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
              className="font-medium text-sky-300 transition hover:text-sky-200"
            >
              {localization.auth.signIn}
            </Link>
          </FieldDescription>
        ) : null
      }
    >
      <div className="flex flex-col gap-6">
        {emailAndPassword?.enabled && (
          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-5">
              {emailAndPassword.name !== false && (
                <Field data-invalid={!!fieldErrors.name} className="gap-2">
                  <Label
                    htmlFor="name"
                    className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-300"
                  >
                    {localization.auth.name}
                  </Label>

                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder={localization.auth.namePlaceholder}
                    required
                    disabled={isPending}
                    className="h-12 border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500 focus-visible:ring-sky-400"
                    onChange={() => {
                      setFieldErrors((prev) => ({
                        ...prev,
                        name: undefined
                      }))
                    }}
                    onInvalid={(e) => {
                      e.preventDefault()

                      setFieldErrors((prev) => ({
                        ...prev,
                        name: (e.target as HTMLInputElement).validationMessage
                      }))
                    }}
                    aria-invalid={!!fieldErrors.name}
                  />

                  <FieldError className="text-xs text-rose-300">
                    {fieldErrors.name}
                  </FieldError>
                </Field>
              )}

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

              {additionalFields?.map(
                (field) =>
                  field.signUp === "above" && (
                    <AdditionalField
                      key={field.name}
                      name={field.name}
                      field={field}
                      isPending={isPending}
                    />
                  )
              )}

              <Field data-invalid={!!fieldErrors.password} className="gap-2">
                <Label
                  htmlFor="password"
                  className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-300"
                >
                  {localization.auth.password}
                </Label>

                <InputGroup>
                  <InputGroupInput
                    id="password"
                    name="password"
                    type={isPasswordVisible ? "text" : "password"}
                    autoComplete="new-password"
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
                        password: (e.target as HTMLInputElement)
                          .validationMessage
                      }))
                    }}
                    aria-invalid={!!fieldErrors.password}
                  />

                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      aria-label={
                        isPasswordVisible
                          ? localization.auth.hidePassword
                          : localization.auth.showPassword
                      }
                      title={
                        isPasswordVisible
                          ? localization.auth.hidePassword
                          : localization.auth.showPassword
                      }
                      onClick={() => {
                        setIsPasswordVisible(!isPasswordVisible)
                      }}
                    >
                      {isPasswordVisible ? <EyeOff /> : <Eye />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>

                <FieldError className="text-xs text-rose-300">
                  {fieldErrors.password}
                </FieldError>
              </Field>

              {emailAndPassword?.confirmPassword && (
                <Field
                  data-invalid={!!fieldErrors.confirmPassword}
                  className="gap-2"
                >
                  <Label
                    htmlFor="confirmPassword"
                    className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-300"
                  >
                    {localization.auth.confirmPassword}
                  </Label>

                  <InputGroup>
                    <InputGroupInput
                      id="confirmPassword"
                      name="confirmPassword"
                      type={isConfirmPasswordVisible ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)

                        setFieldErrors((prev) => ({
                          ...prev,
                          confirmPassword: undefined
                        }))
                      }}
                      placeholder={localization.auth.confirmPasswordPlaceholder}
                      required
                      minLength={emailAndPassword?.minPasswordLength}
                      maxLength={emailAndPassword?.maxPasswordLength}
                      disabled={isPending}
                      className="h-12 border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500 focus-visible:ring-sky-400"
                      onInvalid={(e) => {
                        e.preventDefault()

                        setFieldErrors((prev) => ({
                          ...prev,
                          confirmPassword: (e.target as HTMLInputElement)
                            .validationMessage
                        }))
                      }}
                      aria-invalid={!!fieldErrors.confirmPassword}
                    />

                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label={
                          isConfirmPasswordVisible
                            ? localization.auth.hidePassword
                            : localization.auth.showPassword
                        }
                        title={
                          isConfirmPasswordVisible
                            ? localization.auth.hidePassword
                            : localization.auth.showPassword
                        }
                        onClick={() =>
                          setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                        }
                      >
                        {isConfirmPasswordVisible ? <EyeOff /> : <Eye />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>

                  <FieldError className="text-xs text-rose-300">
                    {fieldErrors.confirmPassword}
                  </FieldError>
                </Field>
              )}

              {additionalFields?.map(
                (field) =>
                  field.signUp &&
                  field.signUp !== "above" && (
                    <AdditionalField
                      key={field.name}
                      name={field.name}
                      field={field}
                      isPending={isPending}
                    />
                  )
              )}

              {Captcha && <div className="flex justify-center">{Captcha}</div>}

              <div className="flex flex-col gap-3 pt-1">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-12 bg-sky-400 font-semibold text-slate-950 transition hover:bg-sky-300"
                >
                  {signUpEmailPending && <Spinner />}
                  {localization.auth.signUp}
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
