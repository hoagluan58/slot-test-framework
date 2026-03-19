import { useEffect, useState } from 'react'
import { fetchAllRuns, getFailedTests } from '../api/results'
import { RunReport } from '../types'
import StatusBadge from '../components/StatusBadge'

type FailedTest = ReturnType<typeof getFailedTests>[0]

export default function BugList() {
  const [bugs, setBugs] = useState<FailedTest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchAllRuns().then((runs: RunReport[]) => {
      setBugs(getFailedTests(runs))
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="spinner" />

  const filtered = bugs.filter(
    (b) => !search || b.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <h2>Bug Feed</h2>
        <p>{bugs.length} failure{bugs.length !== 1 ? 's' : ''} across all runs</p>
      </div>

      <div className="card">
        <input
          type="text"
          placeholder="Search failures…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '9px 14px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--bg-raised)',
            color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit',
            marginBottom: 16, outline: 'none',
          }}
        />

        {filtered.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <p>{search ? 'No matching failures' : 'No failures — all tests passed! 🎉'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Test</th>
                  <th>Run</th>
                  <th>Time</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((bug, i) => (
                  <tr key={i}>
                    <td><StatusBadge status={bug.status} /></td>
                    <td>
                      <div style={{ fontWeight: 500, maxWidth: 480 }}>{bug.title}</div>
                      {bug.errors[0] && (
                        <div className="error-block">
                          {bug.errors[0].slice(0, 250)}{bug.errors[0].length > 250 ? '…' : ''}
                        </div>
                      )}
                    </td>
                    <td>
                      <a href={`/run/${encodeURIComponent(bug.runId)}`} className="mono" style={{ fontSize: 11 }}>
                        {bug.runId.slice(0, 24)}…
                      </a>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(bug.runStartTime).toLocaleDateString()}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {(bug.durationMs / 1000).toFixed(2)}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
