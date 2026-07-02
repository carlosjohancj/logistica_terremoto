# Rutas sin enlace en la navegación

## Navbar (escritorio)

### Dropdown "Ofrecer" — falta una opción

```diff
const ofrecerPaths = [
  `/${locale}/ofrecer-transporte`,
  `/${locale}/ofrecer-hospedaje`,
  `/${locale}/donaciones-fisicas`,
+ `/${locale}/ofrecer-insumos`,
];
```

Agregar también el `<DropdownLink>` correspondiente en el JSX del dropdown.

## Menú móvil (`mobile-menu.tsx`)

Falta en la lista de `links`:

```diff
{ href: `/${locale}/donaciones-fisicas`, label: t("donacionesFisicas") },
+ { href: `/${locale}/ofrecer-insumos`, label: t("ofrecerInsumos") },
```

## Footer

Los enlaces de "Enlaces" están incompletos. Faltan:

| Ruta | Label |
|---|---|
| `/donaciones-fisicas` | Donaciones Físicas |
| `/ofrecer-insumos` | Ofrecer Insumos |
| `/empleos` | Empleos |
| `/explorar` | Explorar |

## Navbar (logueado con empresa)

Cuando el usuario tiene empresas registradas, no hay forma de llegar al tab "Empresa" del perfil desde la navegación. Opción:

```tsx
// En navbar, junto a "Conexiones" y "Perfil", cuando isLoggedIn
{hasCompanies && (
  <Link href={`/${locale}/perfil?tab=empresa`}>
    <Button variant="ghost" size="sm">Empresa</Button>
  </Link>
)}
```

> Nota: `hasCompanies` requiere un fetch a `supabase.from(TABLES.COMPANIES).select("id").eq("user_id", user.id)` en el navbar.
