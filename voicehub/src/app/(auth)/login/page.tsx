import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="page-shell flex min-h-screen items-center py-6">
      <div className="grid w-full gap-6 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">VoiceHub</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Return to your unified AI audio workspace.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Sign in to continue managing transcripts, generated voice files, and usage history from one premium interface.
          </p>
          <p className="mt-6 text-sm text-slate-600">
            New here?{" "}
            <Link href="/register" className="font-medium text-accent-strong hover:underline">
              Create an account
            </Link>
          </p>
        </div>
        <AuthForm mode="login" />
      </div>
    </main>
  );
}
