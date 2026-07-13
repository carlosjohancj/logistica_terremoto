import Link from "next/link";

export function NavLogo({ locale }: { locale: string }) {
  return (
    <Link href={`/${locale}`} className="flex items-center shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://backend.desdecerovenezuela.org/storage/v1/object/public/general/logos/only-logo.png"
        alt="Desde Cero"
        className="h-12 w-auto"
      />
    </Link>
  );
}
