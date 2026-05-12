import { useState } from 'react'
import { Copy, FileText, Share2, Check } from 'lucide-react'
import type { SourceChunk, QueryMode, AppState } from '../../types'
import { parseAnswerCitations } from '../../utils/citations'
import { copyToClipboard, exportToPDF } from '../../utils/export'

interface Props {
  query: string
  answer: string
  sources: SourceChunk[]
  domain: string
  mode: QueryMode
  appState: AppState
  error: string
  onCitationClick: (citation: string) => void
}

export function AnswerView({
  query,
  answer,
  sources,
  domain,
  mode,
  appState,
  error,
  onCitationClick,
}: Props) {
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  const isStreaming = appState === 'streaming'
  const isDone = appState === 'done'

  async function handleCopyAnswer() {
    const ok = await copyToClipboard(answer)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleExportPDF() {
    exportToPDF(query, answer, sources, domain)
  }

  async function handleShare() {
    const text = `Query: ${query}\n\nAnswer: ${answer.slice(0, 500)}…\n\nResearched with ParAILegal`
    await copyToClipboard(text)
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  const segments = parseAnswerCitations(answer)

  return (
    <div className="answer-view">
      {/* Query header */}
      <div className="answer-view__header">
        <h1 className="answer-view__query">{query}</h1>
        <div className="answer-view__meta">
          {domain && <span className="domain-badge">{domain.toUpperCase()}</span>}
          {mode !== 'default' && (
            <span className="mode-badge">{mode}</span>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="error-box">{error}</div>
      )}

      {/* Answer body */}
      <div className="answer-view__body">
        {segments.map((seg, i) =>
          seg.isCitation ? (
            <span
              key={i}
              className="citation-tag"
              title={seg.citation}
              onClick={() => seg.citation && onCitationClick(seg.citation)}
            >
              {seg.text}
            </span>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
        {isStreaming && <span className="streaming-cursor" />}
      </div>

      {/* Disclaimer */}
      {(isDone || isStreaming) && answer && (
        <div className="answer-view__disclaimer">
          ⚖ This is a research tool. Verify all provisions against the official Gazette. This is not legal advice.
        </div>
      )}

      {/* Action buttons — only when done */}
      {isDone && answer && (
        <div className="answer-view__actions">
          <button className={`action-btn${copied ? ' action-btn--copied' : ''}`} onClick={handleCopyAnswer}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy Answer'}
          </button>
          <button className="action-btn" onClick={handleExportPDF}>
            <FileText size={13} />
            Export PDF
          </button>
          <button className={`action-btn${shared ? ' action-btn--copied' : ''}`} onClick={handleShare}>
            {shared ? <Check size={13} /> : <Share2 size={13} />}
            {shared ? 'Copied to clipboard' : 'Share'}
          </button>
        </div>
      )}
    </div>
  )
}
