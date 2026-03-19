import { TestStatus } from '../types'

const ICONS: Record<TestStatus, string> = {
  passed: '✓',
  failed: '✗',
  skipped: '–',
  timedOut: '⏱',
}

export default function StatusBadge({ status }: { status: TestStatus }) {
  return (
    <span className={`badge ${status}`}>
      {ICONS[status]} {status}
    </span>
  )
}
