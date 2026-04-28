"use client";

import { useState } from "react";
import { CheckCircle, ArrowRight } from "@phosphor-icons/react/dist/ssr";

type State = "idle" | "submitting" | "success";

const fieldClass =
  "w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none transition-colors focus:border-white/40 focus:bg-white/10";

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
    if (!values.message.trim()) return setError("Tell us a bit about what you're building.");
    setState("submitting");
    setTimeout(() => setState("success"), 600);
  };

  return (
    <section id="contact" className="border-b border-white/10">
      <div className="mx-auto max-w-[1360px] border-x border-white/10 px-10 py-28">
        <div className="grid grid-cols-2 gap-16">
          <div>
            <p className="mb-5 font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase">
              06 &nbsp;/&nbsp; Your Move
            </p>
            <h2 className="font-display text-[64px] leading-[1.05] tracking-[-0.02em]">
              It&rsquo;s your{" "}
              <span className="italic text-white/75">turn</span>
              <br />
              to build.
            </h2>
            <p className="mt-6 max-w-md text-base text-white/60">
              Tell us what you&rsquo;re working on. We&rsquo;ll set you up with
              a workspace, sample data, and a 30-minute walkthrough with our
              team.
            </p>
            <ul className="mt-10 space-y-3 text-sm text-white/70">
              {[
                "Free 14-day trial, no credit card required",
                "White-glove onboarding from a solutions engineer",
                "Cancel anytime — keep what you've built",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-white/80" weight="fill" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8">
            {state === "success" ? (
              <div className="flex h-full flex-col items-start justify-center py-8">
                <CheckCircle className="h-10 w-10 text-emerald-400" weight="fill" />
                <h3 className="mt-4 font-display text-3xl tracking-tight">
                  Thanks — we&rsquo;ll be{" "}
                  <span className="italic">in touch</span>.
                </h3>
                <p className="mt-2 max-w-sm text-sm text-white/60">
                  A member of our team will reach out at{" "}
                  <span className="text-white">{values.email}</span> within one
                  business day.
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
                    placeholder="Acme Inc."
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

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={state === "submitting"}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:opacity-60"
                >
                  {state === "submitting" ? "Sending…" : "Request a workspace"}
                  {state !== "submitting" && (
                    <ArrowRight className="h-3.5 w-3.5" weight="bold" />
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
      <span className="mb-1.5 block text-[12px] font-medium text-white/70">
        {label}
      </span>
      {children}
    </label>
  );
}
