/** Default admin inbox for platform alerts (job posts, signups, etc.). */
export const DEFAULT_ADMIN_EMAIL = "";

/** Admin notification recipient — set ADMIN_EMAIL in Vercel/.env.local. */
export function getAdminEmail(): string {
  const configured = process.env.ADMIN_EMAIL?.trim();
  return configured || DEFAULT_ADMIN_EMAIL;
}
