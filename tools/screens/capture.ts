/**
 * CDP screenshot capture for docs/screens/<batch>/.  Dev-only.
 *
 *   bun tools/screens/capture.ts --out docs/screens/BR-11 \
 *     --shot home-1280=http://localhost:3000/ \
 *     --shot 'home-390=http://localhost:3000/@390'
 *
 * A shot is `<name>=<url>` with an optional `@<width>` suffix; width defaults to
 * 1280. 390 and 1280 are the two viewports the batches use, both at DSF 2.
 *
 * Chrome clamps `--window-size`, so the viewport is set through
 * Emulation.setDeviceMetricsOverride rather than by sizing the window. Full-page
 * captures are tiled and stitched, which is where every trap this file guards
 * against was found (all recorded in docs/role-audit.md):
 *
 *  1. Tile 0 must be taken on a page that has NEVER been scrolled — priming the
 *     scroll range ghosts a stale tile over the hero.
 *  2. Anything whose COMPUTED position is `sticky` or `fixed` repaints in every
 *     tile and gets stitched in once per tile: the header, the cart drawer, the
 *     age gate, the checkout's lg:sticky summary. They are hidden by computed
 *     position after tile 0 — not by tag name, which only ever covered the one
 *     that had already been discovered.
 *
 * Rebuilt in BR-11; BR-9b/BR-10 left it in a scratchpad and it was lost.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join } from "node:path";

const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const DEBUG_PORT = Number(process.env.CDP_PORT ?? 9222);
const DSF = 2;

type Shot = { name: string; url: string; width: number; fullPage: boolean };

function parseArgs(argv: string[]) {
  let out = "docs/screens/tmp";
  const shots: Shot[] = [];
  let reducedMotion = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--out") out = argv[++i];
    else if (argv[i] === "--reduced-motion") reducedMotion = true;
    else if (argv[i] === "--shot") {
      const raw = argv[++i];
      const eq = raw.indexOf("=");
      const name = raw.slice(0, eq);
      let url = raw.slice(eq + 1);
      let width = 1280;
      let fullPage = true;
      const at = url.lastIndexOf("@");
      if (at > url.lastIndexOf("/")) {
        const suffix = url.slice(at + 1);
        const m = /^(\d+)(!)?$/.exec(suffix);
        if (m) {
          width = Number(m[1]);
          // `@390!` = viewport-only, for fixed overlays that must not be tiled.
          fullPage = !m[2];
          url = url.slice(0, at);
        }
      }
      shots.push({ name, url, width, fullPage });
    }
  }
  return { out, shots, reducedMotion };
}

async function cdp() {
  const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
  const { webSocketDebuggerUrl } = (await res.json()) as { webSocketDebuggerUrl: string };
  const ws = new WebSocket(webSocketDebuggerUrl);
  await new Promise((r, j) => {
    ws.onopen = () => r(null);
    ws.onerror = j;
  });
  let id = 0;
  const pending = new Map<number, (v: any) => void>();
  ws.onmessage = (e) => {
    const msg = JSON.parse(String(e.data));
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)!(msg.result);
      pending.delete(msg.id);
    }
  };
  const send = (method: string, params: any = {}, sessionId?: string) =>
    new Promise<any>((resolve) => {
      const n = ++id;
      pending.set(n, resolve);
      ws.send(JSON.stringify({ id: n, method, params, sessionId }));
    });
  return { send, close: () => ws.close() };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const { out, shots, reducedMotion } = parseArgs(process.argv.slice(2));
  await mkdir(out, { recursive: true });

  const chrome = spawn(
    CHROME,
    [
      `--remote-debugging-port=${DEBUG_PORT}`,
      "--headless=new",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      `--user-data-dir=${process.env.TMPDIR ?? "/tmp"}/br-capture-profile`,
      ...(reducedMotion ? ["--force-prefers-reduced-motion"] : []),
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  await sleep(1500);

  const { send, close } = await cdp();
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const S = (m: string, p: any = {}) => send(m, p, sessionId);

  await S("Page.enable");
  await S("Runtime.enable");
  await S("Emulation.setEmulatedMedia", {
    features: reducedMotion ? [{ name: "prefers-reduced-motion", value: "reduce" }] : [],
  });

  for (const shot of shots) {
    await S("Emulation.setDeviceMetricsOverride", {
      width: shot.width,
      height: shot.width < 500 ? 844 : 900,
      deviceScaleFactor: DSF,
      mobile: shot.width < 500,
    });
    await S("Page.navigate", { url: shot.url });
    await sleep(3500); // fonts, images, the splash's own timeline

    if (!shot.fullPage) {
      const { data } = await S("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      await writeFile(join(out, `${shot.name}.png`), Buffer.from(data, "base64"));
      console.log(`[capture] ${shot.name} (viewport ${shot.width})`);
      continue;
    }

    // Trap 1: tile 0 on a page that has never been scrolled.
    const metrics = await S("Page.getLayoutMetrics");
    const pageHeight = Math.ceil(metrics.cssContentSize.height);
    const viewH = shot.width < 500 ? 844 : 900;
    const tiles: Buffer[] = [];
    for (let y = 0, tile = 0; y < pageHeight; y += viewH, tile++) {
      if (tile === 1) {
        // Trap 2: hide by COMPUTED position, not by tag name.
        await S("Runtime.evaluate", {
          expression: `
            document.querySelectorAll('body *').forEach((el) => {
              const p = getComputedStyle(el).position;
              if (p === 'fixed' || p === 'sticky') el.style.visibility = 'hidden';
            });
          `,
        });
      }
      await S("Runtime.evaluate", { expression: `window.scrollTo(0, ${y})` });
      await sleep(350);
      const { data } = await S("Page.captureScreenshot", {
        format: "png",
        clip: {
          x: 0,
          y,
          width: shot.width,
          height: Math.min(viewH, pageHeight - y),
          scale: DSF,
        },
        captureBeyondViewport: true,
      });
      tiles.push(Buffer.from(data, "base64"));
    }

    if (tiles.length === 1) {
      await writeFile(join(out, `${shot.name}.png`), tiles[0]);
    } else {
      await writeFile(join(out, `${shot.name}.png`), await stitch(tiles, shot.width * DSF));
    }
    console.log(`[capture] ${shot.name} (${tiles.length} tile${tiles.length > 1 ? "s" : ""})`);
  }

  close();
  chrome.kill();
}

/** Vertical stitch through `sips`-free canvas in a throwaway Chrome page. */
async function stitch(tiles: Buffer[], width: number): Promise<Buffer> {
  const { send, close } = await cdp();
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const S = (m: string, p: any = {}) => send(m, p, sessionId);
  await S("Runtime.enable");
  const dataUrls = tiles.map((t) => `data:image/png;base64,${t.toString("base64")}`);
  const { result } = await S("Runtime.evaluate", {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      const urls = ${JSON.stringify(dataUrls)};
      const imgs = await Promise.all(urls.map((u) => new Promise((res) => {
        const i = new Image(); i.onload = () => res(i); i.src = u;
      })));
      const c = document.createElement('canvas');
      c.width = ${width};
      c.height = imgs.reduce((s, i) => s + i.height, 0);
      const ctx = c.getContext('2d');
      let y = 0;
      for (const i of imgs) { ctx.drawImage(i, 0, y); y += i.height; }
      return c.toDataURL('image/png').split(',')[1];
    })()`,
  });
  close();
  return Buffer.from(result.value, "base64");
}

main();
