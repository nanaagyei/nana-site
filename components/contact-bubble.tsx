"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

const RATE_LIMIT_KEY = "contact_submissions";
const MAX_SUBMISSIONS = 3;
const WINDOW_MS = 60_000;

function isClientRateLimited(): boolean {
  try {
    const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
    const entries: number[] = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    const recent = entries.filter((t) => now - t < WINDOW_MS);

    if (recent.length >= MAX_SUBMISSIONS) return true;

    recent.push(now);
    sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recent));
    return false;
  } catch {
    return false;
  }
}

function getErrorMessage(context: "network" | "api" | "validation", detail?: string): string {
  switch (context) {
    case "network":
      return "Unable to reach the server. Check your internet connection and try again.";
    case "api":
      return detail ?? "Your message couldn't be delivered right now. Please try again in a moment.";
    case "validation":
      return detail ?? "Please check your input and try again.";
  }
}

// Web3Forms access keys are designed to be public (embedded in HTML forms)
const WEB3FORMS_KEY = "e20154dc-c1ee-46f0-a0eb-dde0dd9135c0";

export function ContactBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Clear any pending timeout on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Focus name input when panel opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to allow the panel animation to start
      const id = setTimeout(() => nameInputRef.current?.focus(), 150);
      return () => clearTimeout(id);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const setTimedState = useCallback(
    (state: FormState, message: string, duration: number, then?: () => void) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setFormState(state);
      setStatusMessage(message);
      timerRef.current = setTimeout(() => {
        setFormState("idle");
        setStatusMessage("");
        then?.();
      }, duration);
    },
    []
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;

    // Honeypot — silently succeed for bots
    const botcheck = (form.elements.namedItem("botcheck") as HTMLInputElement).checked;
    if (botcheck) {
      setTimedState("success", "Message sent!", 3000);
      return;
    }

    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim();

    // Validation
    if (!name || !email || !message) {
      const missing = [!name && "name", !email && "email", !message && "message"].filter(Boolean);
      setTimedState(
        "error",
        getErrorMessage("validation", `Please enter your ${missing.join(" and ")}.`),
        4000
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setTimedState(
        "error",
        getErrorMessage("validation", "That email address doesn't look right. Please check it."),
        4000
      );
      return;
    }

    if (message.length < 10) {
      setTimedState(
        "error",
        getErrorMessage("validation", "Please write a bit more so I have some context."),
        4000
      );
      return;
    }

    // Rate limiting
    if (isClientRateLimited()) {
      setTimedState(
        "error",
        "You've sent a few messages already. Please wait a minute before sending another.",
        5000
      );
      return;
    }

    setFormState("submitting");
    setStatusMessage("");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          name,
          email,
          message,
          subject: `New message from ${name} via princeagyeituffour.com`,
          from_name: "Portfolio Contact",
          replyto: email,
        }),
      });

      if (!res.ok) {
        setTimedState("error", getErrorMessage("api"), 5000);
        return;
      }

      const result = await res.json();

      if (result.success) {
        formRef.current?.reset();
        setTimedState("success", "Message sent! I'll get back to you soon.", 3000, () => {
          setIsOpen(false);
        });
      } else {
        setTimedState("error", getErrorMessage("api"), 5000);
      }
    } catch {
      setTimedState("error", getErrorMessage("network"), 5000);
    }
  }

  return (
    <>
      {/* Overlay — mobile only */}
      <div
        className={`fixed inset-0 z-40 bg-ink/10 backdrop-blur-[2px] transition-opacity duration-300 sm:pointer-events-none sm:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Chat panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Contact form"
        aria-hidden={!isOpen}
        className={`fixed bottom-20 right-4 z-50 w-[calc(100vw-2rem)] max-w-[360px] origin-bottom-right transition-all duration-300 ease-out sm:right-6 ${
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0"
        }`}
      >
        <div className="overflow-hidden rounded-lg border border-paper-edge bg-paper shadow-xl shadow-ink/5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-paper-edge bg-paper-deep px-4 py-3">
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-ink">Send a message</h3>
              <p className="text-xs text-ink-faded">
                I&apos;ll reply to your email
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="-mr-1 shrink-0 rounded-sm p-1.5 text-ink-faded transition-colors duration-150 hover:bg-paper-edge/50 hover:text-ink"
              aria-label="Close contact form"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="h-4 w-4"
              >
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="p-4" noValidate>
            {/* Honeypot — invisible to real users */}
            <div className="absolute left-[-9999px] opacity-0" aria-hidden="true">
              <input
                type="checkbox"
                name="botcheck"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="contact-name" className="sr-only">
                  Name
                </label>
                <input
                  ref={nameInputRef}
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  maxLength={100}
                  placeholder="Your name"
                  disabled={formState === "submitting"}
                  className="w-full rounded-sm border border-paper-edge bg-paper-deep px-3 py-2.5 text-sm text-ink placeholder:text-ink-faded/60 transition-colors duration-150 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta/30 disabled:opacity-60"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="sr-only">
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  placeholder="Your email"
                  disabled={formState === "submitting"}
                  className="w-full rounded-sm border border-paper-edge bg-paper-deep px-3 py-2.5 text-sm text-ink placeholder:text-ink-faded/60 transition-colors duration-150 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta/30 disabled:opacity-60"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="sr-only">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  maxLength={2000}
                  rows={4}
                  placeholder="Your message..."
                  disabled={formState === "submitting"}
                  className="w-full resize-none rounded-sm border border-paper-edge bg-paper-deep px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-faded/60 transition-colors duration-150 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta/30 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Status message */}
            {statusMessage && (
              <div
                role={formState === "error" ? "alert" : "status"}
                className={`mt-3 rounded-sm px-3 py-2 text-xs leading-relaxed ${
                  formState === "error"
                    ? "border border-terracotta/30 bg-terracotta/5 text-terracotta"
                    : "border border-moss/20 bg-moss/5 text-moss"
                }`}
              >
                {statusMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={formState === "submitting" || formState === "success"}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-sm bg-terracotta px-4 py-2.5 text-sm font-medium text-ink-on-accent transition-all duration-200 hover:bg-terracotta/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {formState === "submitting" && (
                <svg
                  className="h-3.5 w-3.5 animate-spin"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.3"
                  />
                  <path
                    d="M14 8a6 6 0 0 0-6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {formState === "submitting"
                ? "Sending..."
                : formState === "success"
                  ? "Sent!"
                  : "Send message"}
            </button>
          </form>
        </div>
      </div>

      {/* Floating button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed bottom-6 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:shadow-xl sm:right-6 ${
          isOpen
            ? "bg-ink text-paper"
            : "bg-terracotta text-ink-on-accent hover:bg-terracotta/90"
        }`}
        aria-label={isOpen ? "Close contact form" : "Open contact form"}
        aria-expanded={isOpen}
        aria-controls="contact-panel"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={isOpen ? 2 : 1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-5 w-5 transition-transform duration-300 ${isOpen ? "rotate-90" : "rotate-0"}`}
        >
          {isOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          )}
        </svg>
      </button>
    </>
  );
}
