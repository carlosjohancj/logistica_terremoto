import Link from "next/link"

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-2">Página no encontrada</p>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        La página que buscas no existe o ha sido movida.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
