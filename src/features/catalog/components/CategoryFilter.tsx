import { cn } from '@/lib/utils'
import type { Category } from '@/core/types'

interface CategoryFilterProps {
  categories: Category[]
  selected: string | null
  onChange: (categoryId: string | null) => void
}

export function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={cn(
          'rounded-full border px-5 py-2 text-sm font-medium transition-all duration-200',
          selected === null
            ? 'border-primary bg-primary text-primary-foreground shadow-md'
            : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground hover:shadow-sm',
        )}
      >
        Todos
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={cn(
            'rounded-full border px-5 py-2 text-sm font-medium transition-all duration-200',
            selected === cat.id
              ? 'border-primary bg-primary text-primary-foreground shadow-md'
              : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground hover:shadow-sm',
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
