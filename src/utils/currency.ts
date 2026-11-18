const formatBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatCurrencyBRL(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'

  const amount = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(amount)) return '—'

  return formatBRL.format(amount)
}
