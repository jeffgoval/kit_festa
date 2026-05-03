import { cn } from '@/lib/utils'
import type { Category } from '@/core/types'

interface CategoryFilterProps {
  categories: Category[]
  selected: string | null
  onChange: (categoryId: string | null) => void
}

export function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] sm:flex-wrap sm:overflow-visible sm:pb-0">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          'shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium transition-all duration-200 sm:px-5 sm:text-sm',
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
          type="button"
          onClick={() => onChange(cat.id)}
          className={cn(
            'shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium transition-all duration-200 sm:px-5 sm:text-sm',
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
