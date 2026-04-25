export type ActionResult<T = void> = T extends void
  ? { success: true } | { success: false; error: string; code?: string; field?: string }
  : { success: true; data: T } | { success: false; error: string; code?: string; field?: string };
