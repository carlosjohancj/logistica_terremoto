"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavDropdown({
  label,
  active,
  children,
}: {
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative group">
      <button
        className={cn(
          "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
          active ? "text-primary" : "text-muted-foreground"
        )}
      >
        {label}
        <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
      </button>
      <div className="absolute hidden group-hover:block top-full left-0 pt-2 z-50">
        <div className="bg-background border border-border rounded-md shadow-md py-1 min-w-44">
          {children}
        </div>
      </div>
    </div>
  );
}

export function DropdownLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block px-4 py-2 text-sm transition-colors hover:bg-muted hover:text-primary",
        active ? "text-primary font-medium" : "text-muted-foreground"
      )}
    >
      {children}
    </Link>
  );
}
