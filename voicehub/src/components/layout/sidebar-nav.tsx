"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto lg:flex-col">
      {navigationItems.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 text-sm transition",
              active
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:bg-white/70 hover:text-slate-950",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
