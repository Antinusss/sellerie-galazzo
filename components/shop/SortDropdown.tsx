'use client'

interface SortDropdownProps {
  value: string
  onChange: (v: string) => void
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="border border-gray-200 rounded-full px-4 py-2 text-sm font-medium bg-white focus:outline-none focus:border-sand"
    >
      <option value="newest">Più recenti</option>
      <option value="price-asc">Prezzo crescente</option>
      <option value="price-desc">Prezzo decrescente</option>
      <option value="sale">In offerta</option>
    </select>
  )
}
