const STATE_FLAG_FILES: Record<string, string> = {
  "Amazonas": "Flag of Amazonas Indigenous State.svg",
  "Anzoátegui": "Flag of Anzoátegui State.svg",
  "Apure": "Flag of Apure State.svg",
  "Aragua": "Flag of Aragua State.svg",
  "Barinas": "Flag of Barinas State.svg",
  "Bolívar": "Flag of Bolívar State.svg",
  "Carabobo": "Flag of Carabobo State.svg",
  "Cojedes": "Flag of Cojedes State.svg",
  "Delta Amacuro": "Flag of Delta Amacuro State.svg",
  "Distrito Capital": "Flag of Caracas.svg",
  "Falcón": "Flag of Falcón.svg",
  "Guárico": "Flag of Guárico State.svg",
  "La Guaira": "Flag of La Guaira State.svg",
  "Lara": "Flag of Lara State.svg",
  "Mérida": "Flag of Mérida State.svg",
  "Miranda": "Flag of Miranda state.svg",
  "Monagas": "Flag of Monagas State.svg",
  "Nueva Esparta": "Flag of Nueva Esparta.svg",
  "Portuguesa": "Flag of Portuguesa.svg",
  "Sucre": "Flag of Sucre State.svg",
  "Táchira": "Flag of Táchira State.svg",
  "Trujillo": "Flag of Trujillo State.svg",
  "Vargas": "Flag of La Guaira State.svg",
  "Yaracuy": "Flag of Yaracuy State.svg",
  "Zulia": "Flag of Zulia State.svg",
}

export function getStateFlagUrl(stateName: string): string | undefined {
  const file = STATE_FLAG_FILES[stateName]
  if (!file) return undefined
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}`
}
