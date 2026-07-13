"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDropdownMenu } from "@/hooks/use-dropdown-menu";

export function NavDropdown({
  label,
  active,
  children,
}: {
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  const { open, setOpen, containerRef } = useDropdownMenu();
  const panelId = useId();

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1 whitespace-nowrap text-xs font-semibold tracking-wide uppercase transition-colors hover:text-primary",
          active ? "text-primary" : "text-muted-foreground",
        )}
      >
        {label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>
      <div
        id={panelId}
        onClick={() => setOpen(false)}
        className={cn(
          "absolute top-full left-0 pt-2 z-50",
          open ? "block" : "hidden",
        )}
      >
        <div className="bg-background border border-border rounded-md shadow-md py-1 min-w-44">
          {children}
        </div>
      </div>
    </div>
  );
}
