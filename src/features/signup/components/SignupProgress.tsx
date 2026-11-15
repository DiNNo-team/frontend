import { cn } from '@/lib/cn'
import { SIGNUP_TEXT } from '../messages'

/**
 * Two-step progress of the public registration. Never only color: each step has its words, the current one is
 * `aria-current="step"`, and the bar of the steps already reached is orange (action / "now", manual 3).
 */
export function SignupProgress({ step }: { step: 1 | 2 }) {
  return (
    <nav aria-label={SIGNUP_TEXT.progressLabel}>
      <ol className="flex gap-3">
        {SIGNUP_TEXT.steps.map((label, index) => {
          const number = index + 1
          const current = number === step
          return (
            <li key={label} aria-current={current ? 'step' : undefined} className="flex flex-1 flex-col gap-2">
              <span aria-hidden="true" className={cn('h-1 rounded-full', number <= step ? 'bg-accent' : 'bg-line')} />
              <span className={cn('flex flex-col text-label', current ? 'text-fg' : 'text-fg-2')}>
                <span>{SIGNUP_TEXT.step(number)}</span>
                <span className="font-bold">{label}</span>
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
