import type { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";

export function NavMobileToggle({
  t,
  open,
  onToggle,
}: {
  t: ReturnType<typeof useTranslations>;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="lg:hidden p-2"
      onClick={onToggle}
      aria-label={open ? t("closeMenu") : t("openMenu")}
      aria-expanded={open}
      aria-controls="mobile-nav-menu"
    >
      {open ? (
        <X className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Menu className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
