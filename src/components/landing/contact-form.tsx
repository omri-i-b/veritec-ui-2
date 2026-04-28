"use client";

import { useState } from "react";
import { CheckCircle, ArrowRight } from "@phosphor-icons/react/dist/ssr";

type State = "idle" | "submitting" | "success";

const fieldClass =
  "w-full border border-white/15 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/40 focus:bg-white/[0.06]";

export function ContactForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const update =
    (key: keyof typeof values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!values.name.trim()) return setError("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      return setError("Please enter a valid email address.");
    if (!values.message.trim())
      return setError("Tell us a bit about what you're building.");
    setState("submitting");
    setTimeout(() => setState("success"), 600);
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden border-b border-white/10 bg-black"
    >
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1521405924368-64c5b84bec60?w=2400&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/85 to-black" />

      <div className="relative mx-auto max-w-[1680px] px-6 py-28">
        <div className="grid grid-cols-2 gap-16">
          <div>
            <p className="font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase">
              06 &nbsp;/&nbsp; Your Move
            </p>
            <h2 className="mt-4 font-display text-[80px] leading-[0.92] font-bold tracking-[-0.02em] uppercase">
              It&rsquo;s your turn
              <br />
              to build.
            </h2>
            <p className="mt-8 max-w-md text-base text-white/60">
              Tell us what you&rsquo;re working on. We&rsquo;ll set you up
              with a workspace, sample data, and a 30-minute walkthrough
              with our team.
            </p>
            <ul className="mt-10 space-y-3 text-sm text-white/70">
              {[
                "Free 14-day trial, no credit card required",
                "White-glove onboarding from a solutions engineer",
                "Cancel anytime — keep what you've built",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-white/80"
                    weight="fill"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-white/10 bg-black/60 p-8 backdrop-blur">
            {state === "success" ? (
              <div className="flex h-full flex-col items-start justify-center py-8">
                <CheckCircle
                  className="h-10 w-10 text-emerald-400"
                  weight="fill"
                />
                <h3 className="mt-4 font-display text-3xl font-bold tracking-tight uppercase">
                  Thanks — we&rsquo;ll be in touch.
                </h3>
                <p className="mt-2 max-w-sm text-sm text-white/60">
                  A member of our team will reach out at{" "}
                  <span className="text-white">{values.email}</span> within
                  one business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Name" htmlFor="name">
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      value={values.name}
                      onChange={update("name")}
                      className={fieldClass}
                      placeholder="Jane Cooper"
                    />
                  </Field>
                  <Field label="Email" htmlFor="email">
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={values.email}
                      onChange={update("email")}
                      className={fieldClass}
                      placeholder="jane@company.com"
                    />
                  </Field>
                </div>
                <Field label="Company" htmlFor="company">
                  <input
                    id="company"
                    type="text"
                    autoComplete="organization"
                    value={values.company}
                    onChange={update("company")}
                    className={fieldClass}
                    placeholder="Acme Corp."
                  />
                </Field>
                <Field label="What are you building?" htmlFor="message">
                  <textarea
                    id="message"
                    rows={4}
                    value={values.message}
                    onChange={update("message")}
                    className={fieldClass + " resize-none"}
                    placeholder="A few sentences about your team, your stack, and what you'd like to ship first."
                  />
                </Field>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={state === "submitting"}
                  className="inline-flex w-full items-center justify-center gap-1.5 bg-white px-4 py-3 font-mono text-[11px] tracking-[0.25em] text-black uppercase transition-colors hover:bg-white/90 disabled:opacity-60"
                >
                  {state === "submitting"
                    ? "Sending…"
                    : "Request a Workspace"}
                  {state !== "submitting" && (
                    <ArrowRight className="h-3 w-3" weight="bold" />
                  )}
                </button>
                <p className="text-center text-xs text-white/40">
                  By submitting, you agree to our terms and privacy policy.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1.5 block font-mono text-[10px] tracking-[0.25em] text-white/60 uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}
