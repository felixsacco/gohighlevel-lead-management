/** Default admin inbox for platform alerts (job posts, signups, etc.). */
export const DEFAULT_ADMIN_EMAIL = "khamareclarke@gmail.com";

/** Admin notification recipient — override with ADMIN_EMAIL in Vercel if needed. */
export function getAdminEmail(): string {
  const configured = process.env.ADMIN_EMAIL?.trim();
  return configured || DEFAULT_ADMIN_EMAIL;
}
