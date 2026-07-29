/**
 * Input sanitization utilities for preventing XSS.
 * 
 * WHY: Even with Zod validation (which limits input length),
 * user-generated content like mission titles, reflections,
 * and coach messages could contain HTML/JS that gets rendered.
 * These utilities strip dangerous content before storage/display.
 */

/**
 * Strip HTML tags and dangerous content from a string.
 * Preserves safe characters, removes <script>, <iframe>, etc.
 */
export function sanitizeText(input: string): string {
  if (!input) return input;
  
  // Remove HTML tags (basic prevention)
  return input
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')   // Remove script blocks
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')    // Remove iframe blocks
    .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')    // Remove object blocks
    .replace(/<embed[^>]*>/gi, '')                        // Remove embed tags
    .replace(/<link[^>]*>/gi, '')                         // Remove link tags
    .replace(/<meta[^>]*>/gi, '')                         // Remove meta tags
    .replace(/on\w+="[^"]*"/gi, '')                      // Remove event handlers
    .replace(/on\w+='[^']*'/gi, '')                      // Remove event handlers (single quotes)
    .replace(/javascript:/gi, '')                        // Remove javascript: URLs
    .replace(/vbscript:/gi, '')                          // Remove vbscript: URLs
    .replace(/data:/gi, '')                              // Remove data: URLs (for src attrs)
    .trim();
}

/**
 * Sanitize a URL — only allow safe protocols.
 */
export function sanitizeUrl(url: string): string {
  if (!url) return url;
  const safeProtocols = ['http://', 'https://', 'mailto:', 'tel:', '/'];
  const isSafe = safeProtocols.some(p => url.toLowerCase().startsWith(p));
  return isSafe ? url : '';
}

/**
 * Escape HTML entities for safe display in text nodes.
 * Use this when rendering user content as plain text (not HTML).
 */
export function escapeHtml(text: string): string {
  if (!text) return text;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
