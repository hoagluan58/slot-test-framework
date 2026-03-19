import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAllRuns } from '../api/results'
import { RunReport } from '../types'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'

export default function Overview() {
  const [runs, setRuns] = useState<RunReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllRuns().then((r) => { setRuns(r); setLoading(false) })
  }, [])

  if (loading) return <div className="spinner" />

  if (runs.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h2>Overview</h2>
          <p>Run history and test trends</p>
        </div>
        <div className="card">
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 0 1 0 10h-2"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            <p>No test runs found yet</p>
            <p style={{ fontSize: 12 }}>Run <code style={{ color: 'var(--accent)' }}>npm test</code> to generate your first report</p>
          </div>
        </div>
      </div>
    )
  }

  const latest = runs[0]
  const { passed, failed, skipped, total } = latest.summary
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0

  const trendData = [...runs].reverse().map((r) => ({
    label: new Date(r.startTime).toLocaleDateString(),
    Passed: r.summary.passed,
    Failed: r.summary.failed,
    Skipped: r.summary.skipped,
  }))

  return (
    <div>
      <div className="page-header">
        <h2>Overview</h2>
        <p>Latest run: {new Date(latest.startTime).toLocaleString()} — {latest.runId}</p>
      </div>

      <div className="card-grid">
        <div className="stat-card total">
          <div className="label">Total Tests</div>
          <div className="value">{total}</div>
        </div>
        <div className="stat-card pass">
          <div className="label">Passed</div>
          <div className="value">{passed}</div>
        </div>
        <div className="stat-card fail">
          <div className="label">Failed</div>
          <div className="value">{failed}</div>
        </div>
        <div className="stat-card skip">
          <div className="label">Skipped</div>
          <div className="value">{skipped}</div>
        </div>
        <div className="stat-card" style={{ gridColumn: 'span 1' }}>
          <div className="label">Pass Rate</div>
          <div className="value" style={{ color: passRate >= 80 ? 'var(--green)' : passRate >= 50 ? 'var(--yellow)' : 'var(--red)' }}>
            {passRate}%
          </div>
          <div className="progress-bar"><div className="fill" style={{ width: `${passRate}%` }} /></div>
        </div>
      </div>

      {trendData.length > 1 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 13 }}>Test Trend</div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Passed" stroke="var(--green)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Failed" stroke="var(--red)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Skipped" stroke="var(--yellow)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 13 }}>Run History</div>
        <div className="table-wrapper">
          {runs.map((run) => (
            <Link key={run.runId} to={`/run/${encodeURIComponent(run.runId)}`} className="run-item">
              <span className={`badge run-${run.status}`}>{run.status}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{run.runId}</div>
                <div className="run-time">{new Date(run.startTime).toLocaleString()}</div>
              </div>
              <div className="run-stats">
                <span className="p">✓ {run.summary.passed}</span>
                <span className="f">✗ {run.summary.failed}</span>
                <span className="s">– {run.summary.skipped}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {(run.durationMs / 1000).toFixed(1)}s
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>→</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
