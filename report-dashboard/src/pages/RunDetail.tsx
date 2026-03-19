import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchAllRuns } from '../api/results'
import { RunReport, TestRecord } from '../types'
import StatusBadge from '../components/StatusBadge'

export default function RunDetail() {
  const { runId } = useParams<{ runId: string }>()
  const [run, setRun] = useState<RunReport | null>(null)
  const [filter, setFilter] = useState<'all' | 'failed' | 'passed'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllRuns().then((runs) => {
      const found = runs.find((r) => r.runId === runId) ?? null
      setRun(found)
      setLoading(false)
    })
  }, [runId])

  if (loading) return <div className="spinner" />
  if (!run) return (
    <div className="page-header">
      <h2>Run not found</h2>
      <Link to="/">← Back to overview</Link>
    </div>
  )

  const filtered: TestRecord[] = run.tests.filter((t) => {
    if (filter === 'failed') return t.status === 'failed' || t.status === 'timedOut'
    if (filter === 'passed') return t.status === 'passed'
    return true
  })

  return (
    <div>
      <div className="page-header">
        <Link to="/" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>← All runs</Link>
        <h2 style={{ marginTop: 6 }}>Run Detail</h2>
        <p className="mono">{run.runId} · {new Date(run.startTime).toLocaleString()}</p>
      </div>

      <div className="card-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card pass"><div className="label">Passed</div><div className="value">{run.summary.passed}</div></div>
        <div className="stat-card fail"><div className="label">Failed</div><div className="value">{run.summary.failed}</div></div>
        <div className="stat-card skip"><div className="label">Skipped</div><div className="value">{run.summary.skipped}</div></div>
        <div className="stat-card total"><div className="label">Duration</div><div className="value" style={{ fontSize: 22 }}>{(run.durationMs / 1000).toFixed(1)}s</div></div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['all', 'failed', 'passed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '5px 14px', borderRadius: 999, border: '1px solid var(--border)',
                background: filter === f ? 'var(--accent-dimmed)' : 'transparent',
                color: filter === f ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
            {filtered.length} tests
          </span>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Test</th>
                <th>Duration</th>
                <th>Retries</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td><StatusBadge status={t.status} /></td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{t.title}</div>
                    {t.errors.length > 0 && (
                      <div className="error-block">{t.errors[0].slice(0, 300)}{t.errors[0].length > 300 ? '…' : ''}</div>
                    )}
                    {t.attachments.filter((a) => a.name === 'screenshot').map((a, i) => (
                      a.path && (
                        <div key={i} style={{ marginTop: 8 }}>
                          <img src={`/` + a.path.replace(/\\/g, '/')} alt="screenshot"
                            style={{ maxWidth: 300, borderRadius: 6, border: '1px solid var(--border)' }} />
                        </div>
                      )
                    ))}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{(t.durationMs / 1000).toFixed(2)}s</td>
                  <td style={{ color: t.retries > 0 ? 'var(--yellow)' : 'var(--text-muted)', fontSize: 12 }}>{t.retries}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
