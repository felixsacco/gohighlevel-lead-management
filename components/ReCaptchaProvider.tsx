"use client";

import {
  createContext,
  useContext,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

interface ReCaptchaContextValue {
  execute: (action: string) => Promise<string | null>;
  siteKey: string | undefined;
}

const ReCaptchaContext = createContext<ReCaptchaContextValue>({
  execute: () => Promise.resolve(null),
  siteKey: undefined,
});

export function useReCaptcha() {
  return useContext(ReCaptchaContext);
}

interface ReCaptchaProviderProps {
  children: ReactNode;
}

export function ReCaptchaProvider({ children }: ReCaptchaProviderProps) {
  const loadedRef = useRef(false);

  const loadScript = useCallback(() => {
    if (loadedRef.current || !SITE_KEY) return;
    loadedRef.current = true;

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${SITE_KEY}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  const execute = useCallback(
    async (action: string): Promise<string | null> => {
      if (!SITE_KEY) return null;
      loadScript();

      try {
        // Wait for grecaptcha to be ready
        await waitForGrecaptcha();
        const token = await (window as any).grecaptcha.enterprise.execute(
          SITE_KEY,
          { action }
        );
        return token;
      } catch {
        return null;
      }
    },
    [loadScript]
  );

  return (
    <ReCaptchaContext.Provider value={{ execute, siteKey: SITE_KEY }}>
      {children}
    </ReCaptchaContext.Provider>
  );
}

function waitForGrecaptcha(timeoutMs = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).grecaptcha?.enterprise?.execute) {
      resolve();
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      if ((window as any).grecaptcha?.enterprise?.execute) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        reject(new Error("reCAPTCHA script timed out"));
      }
    }, 200);
  });
}
