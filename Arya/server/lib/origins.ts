const normalizeOrigin = (origin: string) => origin.trim().replace(/\/$/, "");

const wildcardToRegExp = (pattern: string) => {
  const escapedPattern = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const wildcardPattern = escapedPattern.replace(/\*/g, ".*").replace(/\?/g, ".");

  return new RegExp(`^${wildcardPattern}$`);
};

export const getTrustedOrigins = () => [
  ...(process.env.TRUSTED_ORIGINS?.split(",") ?? []),
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
]
  .filter((origin): origin is string => Boolean(origin?.trim()))
  .map(normalizeOrigin);

export const isTrustedOrigin = (origin: string | undefined) => {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = normalizeOrigin(origin);

  return getTrustedOrigins().some((trustedOrigin) => {
    if (trustedOrigin.includes("*") || trustedOrigin.includes("?")) {
      return wildcardToRegExp(trustedOrigin).test(normalizedOrigin);
    }

    return trustedOrigin === normalizedOrigin;
  });
};

export { normalizeOrigin };
