import { redirect } from "next/navigation"

export default function EmpresasDashboardRedirect() {
  redirect("/perfil?tab=empresa")
}
