"use client"

import { useMemo, useState } from "react"
import { useLocale } from "next-intl"
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FIELD_CLASS, SELECT_TRIGGER_CLASS } from "@/components/shared/field-styles"
import { cn } from "@/lib/utils"

const ALL_COUNTRIES = getCountries()

function flagEmoji(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
}

function countryName(code: string, locale: string) {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code
  } catch {
    return code
  }
}

export type PhoneInputProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  defaultCountry?: CountryCode
  placeholder?: string
  className?: string
  "aria-invalid"?: boolean
  "aria-describedby"?: string
  "aria-required"?: boolean
}

export function PhoneInput({
  id,
  value,
  onChange,
  onBlur,
  defaultCountry = "VE",
  placeholder,
  className,
  ...aria
}: PhoneInputProps) {
  const locale = useLocale()
  // Parse an externally-provided initial value (e.g. editing an existing
  // profile) once, on mount, via lazy initializers rather than an effect.
  const initialParsed = useState(() => (value ? parsePhoneNumberFromString(value) : undefined))[0]
  const [country, setCountry] = useState<CountryCode>(initialParsed?.country ?? defaultCountry)
  const [national, setNational] = useState(initialParsed?.nationalNumber ?? "")

  const sortedCountries = useMemo(() => {
    return [...ALL_COUNTRIES].sort((a, b) => countryName(a, locale).localeCompare(countryName(b, locale)))
  }, [locale])

  function emit(nextCountry: CountryCode, nextNational: string) {
    const digits = nextNational.replace(/\D/g, "")
    if (!digits) {
      onChange("")
      return
    }
    onChange(`+${getCountryCallingCode(nextCountry)}${digits}`)
  }

  return (
    <div className="flex gap-2">
      <Select
        value={country}
        onValueChange={(next) => {
          if (!next) return
          const nextCountry = next as CountryCode
          setCountry(nextCountry)
          emit(nextCountry, national)
        }}
      >
        <SelectTrigger className={cn(SELECT_TRIGGER_CLASS, "w-28 shrink-0")} aria-label="País">
          <SelectValue>
            {flagEmoji(country)} +{getCountryCallingCode(country)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {sortedCountries.map((code) => (
            <SelectItem key={code} value={code}>
              {flagEmoji(code)} {countryName(code, locale)} (+{getCountryCallingCode(code)})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={national}
        onChange={(e) => {
          setNational(e.target.value)
          emit(country, e.target.value)
        }}
        onBlur={onBlur}
        placeholder={placeholder}
        className={cn(FIELD_CLASS, "flex-1", className)}
        {...aria}
      />
    </div>
  )
}
