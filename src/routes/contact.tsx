import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeading } from "@/components/site/PageShell";
import { sellqoFetch } from "@/lib/sellqo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — BennyRich" },
      {
        name: "description",
        content: "Questions about an order, a drop or a collaboration? Talk to BennyRich.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      // Routed through sellqoProxy, which maps POST /contact → submit_contact.
      await sellqoFetch("/contact", {
        method: "POST",
        body: { name, email, message },
      });
      setSent(true);
      toast.success("Message sent. We'll come back to you.");
    } catch (e) {
      const m = e instanceof Error ? e.message : "Could not send your message.";
      setErr(m);
      toast.error(m);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <PageHeading
        eyebrow="Say less"
        title="Contact"
        lede="Questions about an order, a drop, or a collaboration? Send it over."
      />

      <div className="br-shell br-section-b grid gap-14 md:grid-cols-[1.2fr_1fr]">
        <div>
          {sent ? (
            <div
              className="neon-line-blue border p-8"
              style={{ background: "var(--br-ink)", borderRadius: "var(--radius)" }}
            >
              <h2 className="br-display neon-text-blue text-[19px]">Message sent</h2>
              <p className="mt-4 text-[14px]" style={{ color: "var(--br-white)", lineHeight: 1.7 }}>
                Thanks {name || "—"}. We read everything and usually reply within two business days.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="max-w-[52ch] space-y-5">
              <div>
                <label
                  htmlFor="c-name"
                  className="br-label block"
                  style={{ color: "var(--br-mute)" }}
                >
                  Name
                </label>
                <input
                  id="c-name"
                  className="br-input mt-2.5"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
              <div>
                <label
                  htmlFor="c-email"
                  className="br-label block"
                  style={{ color: "var(--br-mute)" }}
                >
                  Email
                </label>
                <input
                  id="c-email"
                  type="email"
                  className="br-input mt-2.5"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label
                  htmlFor="c-message"
                  className="br-label block"
                  style={{ color: "var(--br-mute)" }}
                >
                  Message
                </label>
                <textarea
                  id="c-message"
                  className="br-input mt-2.5 min-h-[150px] resize-y"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={busy} className="neon-btn">
                {busy ? "Sending…" : "Send message"} <span aria-hidden>→</span>
              </button>
              {err && (
                <p className="text-[13px]" style={{ color: "var(--br-pink)" }}>
                  {err} You can also email{" "}
                  <a
                    href="mailto:hello@bennyrich.com"
                    className="underline underline-offset-4"
                    style={{ color: "var(--br-pink)" }}
                  >
                    hello@bennyrich.com
                  </a>
                  .
                </p>
              )}
            </form>
          )}
        </div>

        <aside
          className="border p-7"
          style={{
            background: "var(--br-ink)",
            borderColor: "var(--br-line)",
            borderRadius: "var(--radius)",
          }}
        >
          <h2 className="br-label" style={{ color: "var(--br-white)" }}>
            Direct
          </h2>
          <a
            href="mailto:hello@bennyrich.com"
            className="mt-3 block text-[14px] transition-colors duration-200 hover:text-[var(--br-blue)]"
            style={{ color: "var(--br-mute)" }}
          >
            hello@bennyrich.com
          </a>

          <h2 className="br-label mt-8" style={{ color: "var(--br-white)" }}>
            Social
          </h2>
          <ul className="mt-3 space-y-2 text-[14px]" style={{ color: "var(--br-mute)" }}>
            <li>
              <a
                href="https://instagram.com/bennyrich"
                target="_blank"
                rel="noreferrer noopener"
                className="transition-colors duration-200 hover:text-[var(--br-blue)]"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://tiktok.com/@bennyrich"
                target="_blank"
                rel="noreferrer noopener"
                className="transition-colors duration-200 hover:text-[var(--br-blue)]"
              >
                TikTok
              </a>
            </li>
          </ul>

          <h2 className="br-label mt-8" style={{ color: "var(--br-white)" }}>
            Orders
          </h2>
          <p className="mt-3 text-[14px]" style={{ color: "var(--br-mute)", lineHeight: 1.7 }}>
            Include your order number and we will get to it faster.
          </p>
        </aside>
      </div>
    </SiteLayout>
  );
}
