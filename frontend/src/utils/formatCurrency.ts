const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(amount: number | string | null | undefined): string {
  const value = typeof amount === 'number' ? amount : Number(amount)
  if (!Number.isFinite(value)) return '—'
  return formatter.format(value)
}
