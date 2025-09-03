import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { semanticSearchDocuments } from '../features/documentSlice'

const SemanticSearch = () => {
  const dispatch = useDispatch()
  const { loading, error, semanticResults } = useSelector((s) => s.documents)

  const [query, setQuery] = useState('')

  const onSearch = async () => {
    if (!query.trim()) return
    try {
      await dispatch(semanticSearchDocuments({ query: query.trim() })).unwrap()
    } catch (_) {}
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') onSearch()
  }

  return (
    <div className="p-4 text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Semantic Search</h1>
        <p className="text-neutral-400 mb-4">Find the most relevant documents using AI-powered similarity.</p>

        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 outline-none"
            placeholder="Describe what you're looking for..."
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button
            onClick={onSearch}
            disabled={loading || !query.trim()}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-500"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && <div className="text-red-500 mb-3">Error: {error}</div>}

        <div className="space-y-3">
          {Array.isArray(semanticResults) && semanticResults.length > 0 ? (
            semanticResults.map((res) => (
              <div key={res.document?._id || res.documentId}
                   className="bg-neutral-950 border border-neutral-900 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{res.document?.title || 'Untitled'}</h3>
                    <p className="text-sm text-neutral-400 whitespace-pre-wrap line-clamp-3">{res.document?.summary || res.document?.content || ''}</p>
                    {Array.isArray(res.document?.tags) && res.document.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {res.document.tags.map((t) => (
                          <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300">#{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-neutral-500 mt-2">
                      By {typeof res.document?.createdBy === 'object' ? (res.document?.createdBy?.name || res.document?.createdBy?._id) : res.document?.createdBy}
                    </div>
                  </div>
                  <div className="text-xs text-neutral-400 shrink-0">
                    Score
                    <div className="text-sm text-white">{typeof res.score === 'number' ? res.score.toFixed(3) : res.score}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-neutral-400">{loading ? 'Searching…' : 'No results yet. Try a query above.'}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SemanticSearch