/**
 * Safe browser utilities for iframes and sandboxed environments
 */

export async function safeCopyText(text: string): Promise<boolean> {
  if (!text) return false;

  // Try modern navigator.clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback to legacy execCommand
    }
  }

  // Fallback for sandboxed iframes without clipboard permissions
  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      textarea.setAttribute('readonly', '');
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (err) {
      console.warn('Could not copy to clipboard:', err);
    }
  }

  return false;
}

export function safePushState(url: string): void {
  if (typeof window !== 'undefined' && window.history && typeof window.history.pushState === 'function') {
    try {
      window.history.pushState(null, '', url);
    } catch (err) {
      // In sandboxed iframes or opaque origins, pushState may throw SecurityError / pattern error
      console.warn('History pushState suppressed in sandboxed environment:', err);
    }
  }
}
