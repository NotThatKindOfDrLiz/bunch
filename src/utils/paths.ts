/**
 * Get the base URL for the application
 * This handles both GitHub Pages (/bunch/) and root deployments (/)
 */
export function getBaseUrl(): string {
  const base = import.meta.env.BASE_URL
  // For relative base like './', return empty string
  if (base === './' || base === '.') {
    return ''
  }
  // Ensure base ends with / but not double //
  return base.endsWith('/') ? base.slice(0, -1) : base
}

/**
 * Get an absolute path for a public asset
 */
export function getAssetPath(path: string): string {
  const base = getBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}

/**
 * Get an absolute path for a route
 */
export function getRoutePath(path: string): string {
  const base = getBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}
