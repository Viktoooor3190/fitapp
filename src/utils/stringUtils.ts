/**
 * Convert a string to a URL-safe slug
 * @param str The string to convert
 * @returns A URL-safe slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a random string of specified length
 * @param length Length of the string to generate
 * @returns A random string
 */
export function generateRandomString(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Ensure a string is unique by appending a random suffix if needed
 * @param baseStr The base string
 * @param existingStrings Array of existing strings to check against
 * @returns A unique string
 */
export function ensureUniqueString(baseStr: string, existingStrings: string[]): string {
  if (!existingStrings.includes(baseStr)) {
    return baseStr;
  }
  
  // Add a random suffix
  const randomSuffix = generateRandomString(4);
  return `${baseStr}-${randomSuffix}`;
} 