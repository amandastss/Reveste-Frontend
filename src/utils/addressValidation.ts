export interface DeliveryAddress {
  zip_code: string
  street_name: string
  street_number: string
  neighborhood: string
  city: string
  federal_unit: string
}

export function normalizeCep(value: string): string {
  return value.replace(/\D/g, '').slice(0, 8)
}

export function validateDeliveryAddress(address: DeliveryAddress): string | null {
  const zipCode = normalizeCep(address.zip_code)
  if (zipCode.length !== 8) return 'Informe um CEP válido com 8 números.'
  if (!address.street_name.trim()) return 'Informe a rua do endereço.'
  if (!address.street_number.trim()) return 'Informe o número do endereço.'
  if (!address.neighborhood.trim()) return 'Informe o bairro.'
  if (!address.city.trim()) return 'Informe a cidade.'

  const federalUnit = address.federal_unit.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(federalUnit)) return 'Informe uma UF válida com duas letras.'
  return null
}
