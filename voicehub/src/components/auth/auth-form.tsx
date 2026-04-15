"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      setError(result?.error ?? "Unable to continue.");
      return;
    }

    startTransition(() => {
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <Card className="max-w-md rounded-[2rem] p-6 sm:p-8">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          {mode === "login" ? "Sign in to VoiceHub" : "Launch your audio workspace"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          One account for transcription, speech synthesis, shared history, and usage tracking.
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {mode === "register" ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
            <Input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Avery Morgan"
              required
            />
          </div>
        ) : null}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
          <Input
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            type="email"
            placeholder="you@voicehub.ai"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
          <Input
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            type="password"
            placeholder="Minimum 8 characters"
            required
          />
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button type="submit" className="w-full py-3" disabled={isPending}>
          {isPending ? "Working..." : mode === "login" ? "Sign In" : "Create Account"}
        </Button>
      </form>
    </Card>
  );
}
