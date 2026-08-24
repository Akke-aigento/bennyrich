/**
 * Last-resort SSR error page.
 *
 * Rendered when SSR itself fails, so it cannot import anything from the app —
 * no React, no tokens.css, no fonts. Everything is inlined by hand, which is
 * why the brand values appear here as literals rather than as var(--br-*).
 * Keep them in sync with src/styles/tokens.css if the palette moves.
 */
export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load — BennyRich</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#050505" />
    <meta name="robots" content="noindex" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <style>
      :root { --black:#050505; --white:#F4F4F6; --mute:#8A8A94; --line:#1C1C22; --blue:#1E5BFF; --blue-text:#4A7DFF; }
      * { box-sizing: border-box; }
      body {
        margin: 0; min-height: 100vh; padding: 1.5rem;
        display: grid; place-items: center;
        background: var(--black); color: var(--white);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
        font-size: 15px; line-height: 1.7;
      }
      .card { max-width: 34rem; width: 100%; text-align: center; }
      .eyebrow {
        font-size: 11px; font-weight: 500; text-transform: uppercase;
        letter-spacing: .28em; color: var(--mute); margin: 0 0 1.25rem;
      }
      h1 {
        font-family: "Bodoni Moda", Georgia, "Times New Roman", serif;
        font-weight: 500; text-transform: uppercase; letter-spacing: .06em;
        font-size: clamp(26px, 4.2vw, 46px); line-height: 1.2; margin: 0;
        color: var(--white); text-shadow: 0 0 1px var(--blue), 0 0 10px rgba(30,91,255,.38);
      }
      p.lede { color: var(--mute); margin: 1.5rem auto 0; max-width: 42ch; }
      .actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 2.75rem; }
      a, button {
        display: inline-flex; align-items: center; gap: .85rem;
        background: transparent; border: 1px solid var(--blue); border-radius: 2px;
        color: var(--blue-text); font: inherit; font-size: .7rem; font-weight: 500;
        letter-spacing: .22em; text-transform: uppercase; padding: 1rem 1.75rem;
        cursor: pointer; text-decoration: none;
        transition: opacity 200ms ease;
      }
      .quiet { border-color: var(--line); color: var(--mute); }
      a:hover, button:hover { opacity: .75; }
      @media (prefers-reduced-motion: reduce) { * { transition-duration: .001ms !important; } }
    </style>
  </head>
  <body>
    <div class="card">
      <p class="eyebrow">BennyRich</p>
      <h1>This page didn't load</h1>
      <p class="lede">Something went wrong on our end. Try again, or head back to the collection.</p>
      <div class="actions">
        <button onclick="location.reload()">Try again</button>
        <a class="quiet" href="/">Home</a>
      </div>
    </div>
  </body>
</html>`;
}
