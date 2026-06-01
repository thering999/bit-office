
/**
 * Resolves a path relative to the base path of the application.
 * Useful for assets and internal links when the app is hosted on a subpath (e.g. GitHub Pages).
 */
export function resolveAssetPath(path: string): string {
  if (typeof window === 'undefined') return path;
  
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  
  // If path already starts with basePath, don't prepend it again
  if (basePath && path.startsWith(basePath)) {
    return path;
  }
  
  // Ensure path starts with / if it's an absolute-style path
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${basePath}${normalizedPath}`;
}
