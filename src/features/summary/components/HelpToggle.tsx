import { useId, useState, type ReactNode } from 'react'
import { Info } from 'lucide-react'
import { Alert, Button } from '@/components/ui'

interface HelpToggleProps {
  /** The button's words: «Cómo se cobra». */
  label: string
  title?: string
  children: ReactNode
}

/** Contextual help: a quiet button that opens the explanation right where it is needed (`aria-expanded`), and closes again. */
export function HelpToggle({ label, title, children }: HelpToggleProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  return (
    <div className="flex flex-col items-start gap-3">
      <Button variant="ghost" size="sm" icon={Info} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((value) => !value)}>
        {label}
      </Button>
      <div id={panelId} hidden={!open} className="w-full">
        {open && (
          <Alert type="info" title={title}>
            {children}
          </Alert>
        )}
      </div>
    </div>
  )
}
