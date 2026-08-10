'use client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <div style={{ maxWidth: 500, margin: '100px auto', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
          <h1 style={{ fontSize: 24, marginBottom: 16 }}>Something went wrong</h1>
          <p style={{ color: '#666', marginBottom: 24 }}>
            We have been notified and are looking into the issue.
          </p>
          <button
            onClick={reset}
            style={{ padding: '10px 24px', backgroundColor: '#002FA7', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
