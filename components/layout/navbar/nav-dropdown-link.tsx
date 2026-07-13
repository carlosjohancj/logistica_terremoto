import Link from "next/link";
import { cn } from "@/lib/utils";

export function NavDropdownLink({
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
        active ? "text-primary font-medium" : "text-muted-foreground",
      )}
    >
      {children}
    </Link>
  );
}
