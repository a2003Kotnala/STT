import Link from "next/link";
import { AudioLines, LogOut, Waves } from "lucide-react";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export function AppShell({
  userName,
  userEmail,
  children,
}: {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen py-4 sm:py-6">
      <div className="page-shell">
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="glass-panel rounded-[2rem] p-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Waves className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-950">VoiceHub</p>
                <p className="text-sm text-slate-500">Unified AI audio workspace</p>
              </div>
            </Link>

            <div className="mt-6 rounded-[1.75rem] border border-white/70 bg-white/70 p-4">
              <p className="text-sm text-slate-500">Signed in as</p>
              <p className="mt-1 font-semibold text-slate-950">{userName}</p>
              <p className="text-sm text-slate-500">{userEmail}</p>
            </div>

            <div className="mt-6">
              <SidebarNav />
            </div>

            <div className="mt-6 rounded-[1.75rem] bg-slate-950 p-4 text-white">
              <div className="flex items-start gap-3">
                <AudioLines className="mt-1 h-5 w-5 text-teal-300" />
                <div>
                  <p className="font-medium">SaaS-ready foundation</p>
                  <p className="mt-1 text-sm text-white/70">
                    Jobs, usage logs, assets, and provider adapters are already separated for scale.
                  </p>
                </div>
              </div>
            </div>

            <form action="/api/auth/logout" method="post" className="mt-6">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-slate-600 transition hover:bg-white/70 hover:text-slate-950"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </form>
          </aside>

          <main className="space-y-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
