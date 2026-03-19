import { useEffect, useState } from 'react'
import { fetchAllRuns, getMatrixData } from '../api/results'
import { RunReport } from '../types'

type MatrixRow = ReturnType<typeof getMatrixData>[0]

export default function MatrixView() {
  const [rows, setRows] = useState<MatrixRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllRuns().then((runs: RunReport[]) => {
      setRows(getMatrixData(runs))
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="spinner" />

  // Group by unique test title (strip currency/lang suffix) for row headers
  const currencies = [...new Set(rows.map((r) => r.currency))]
  const langs = [...new Set(rows.map((r) => r.lang))]

  const getCell = (currency: string, lang: string) =>
    rows.find((r) => r.currency === currency && r.lang === lang)

  return (
    <div>
      <div className="page-header">
        <h2>Matrix View</h2>
        <p>Currency × language test results from latest run</p>
      </div>

      {rows.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <p>No matrix data found</p>
            <p style={{ fontSize: 12 }}>Run <code style={{ color: 'var(--accent)' }}>npm run test:matrix</code> to populate</p>
          </div>
        </div>
      ) : (
        <>
          {/* Grid view */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 13 }}>Result Grid</div>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Currency ↓ / Lang →</th>
                    {langs.map((l) => <th key={l}>{l.toUpperCase()}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {currencies.map((currency) => (
                    <tr key={currency}>
                      <td style={{ fontWeight: 600 }}>{currency}</td>
                      {langs.map((lang) => {
                        const cell = getCell(currency, lang)
                        if (!cell) return <td key={lang} style={{ color: 'var(--text-muted)' }}>—</td>
                        return (
                          <td key={lang}>
                            <span className={`badge ${cell.status}`}>
                              {cell.status === 'passed' ? '✓' : cell.status === 'failed' ? '✗' : '–'} {cell.status}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card grid view */}
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 13 }}>All Scenarios</div>
            <div className="matrix-grid">
              {rows.map((row, i) => (
                <div key={i} className={`matrix-cell ${row.status}`}>
                  <div>{row.currency}</div>
                  <div className="combo">{row.lang.toUpperCase()}</div>
                  <div style={{ marginTop: 8, fontSize: 10 }}>
                    {row.status === 'passed' ? '✓ pass' : row.status === 'failed' ? '✗ fail' : '– skip'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
