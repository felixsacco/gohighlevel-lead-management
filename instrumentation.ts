export async function register() {
  if (process.env.NODE_ENV === "production") {
    const missing: string[] = [];
    if (!process.env.POSTMARK_SERVER_TOKEN?.trim()) {
      missing.push("POSTMARK_SERVER_TOKEN");
    }
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables in production: ${missing.join(", ")}. ` +
          "The app cannot start without these."
      );
    }
  }
}
