import React, { useEffect, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchAllDocuments, deleteDocument, updateDocument, searchDocuments } from '../features/documentSlice'
import { useNavigate } from 'react-router-dom'
import VersionHistory from '../components/VersionHistory'

const Dashboard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { items: documents, loading: docsLoading, error: docsError, searchResults } = useSelector((state) => state.documents)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formSummary, setFormSummary] = useState('')
  const [formTags, setFormTags] = useState('')
  const [expanded, setExpanded] = useState({})
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [selectedDocForVersion, setSelectedDocForVersion] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    dispatch(fetchAllDocuments())
  }, [dispatch])

  const loading = docsLoading
  const error = docsError

  // Handle search input changes
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    
    // Clear search results if query is empty
    if (!query.trim()) {
      setIsSearching(false)
      return
    }
    
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        setIsSearching(true)
        dispatch(searchDocuments(query.trim()))
      }
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }

  // Get documents to display (either search results or all documents)
  const displayDocuments = isSearching && searchQuery.trim() ? searchResults : documents

  const canDelete = (doc) => {
    if (!user) return false
    if (user.role === 'admin') return true
    const createdById = typeof doc.createdBy === 'string' ? doc.createdBy : doc.createdBy?._id
    return createdById === user._id
  }

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteDocument(id)).unwrap()
    } catch (_) {
      // handled via slice error
    }
  }

  const openEdit = (doc) => {
    setEditId(doc._id)
    setFormTitle(doc.title || '')
    setFormContent(doc.content || '')
    setFormSummary(doc.summary || '')
    setFormTags(Array.isArray(doc.tags) ? doc.tags.join(', ') : '')
    setIsEditOpen(true)
  }

  const closeEdit = () => {
    setIsEditOpen(false)
    setEditId(null)
  }

  const handleUpdate = async () => {
    if (!editId) return
    const updates = {
      title: formTitle.trim(),
      content: formContent.trim(),
      // omit summary/tags so backend remains source of truth if auto-generated
    }
    try {
      await dispatch(updateDocument({ id: editId, updates })).unwrap()
      closeEdit()
    } catch (_) {}
  }

  const openVersionHistory = (doc) => {
    setSelectedDocForVersion(doc)
    setShowVersionHistory(true)
  }

  const closeVersionHistory = () => {
    setShowVersionHistory(false)
    setSelectedDocForVersion(null)
  }

  const handleVersionRestored = () => {
    closeVersionHistory()
    // Optionally, refetch documents or update the specific document
    dispatch(fetchAllDocuments())
  }

  return (
    <div className="p-4 text-white">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-neutral-400">Welcome, {user?.name || 'User'}!</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 pl-10 text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none transition-colors"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
            🔍
          </div>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                setIsSearching(false)
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-neutral-400 mt-2">
            {isSearching ? 'Searching...' : `Found ${searchResults?.length || 0} result${searchResults?.length !== 1 ? 's' : ''}`}
          </p>
        )}
      </div>

      {loading && <div className="text-neutral-400">Loading...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}

      <div className="mt-4">
        <h2 className="text-xl font-medium mb-3">
          {isSearching && searchQuery.trim() ? 'Search Results' : 'All Documents'}
        </h2>
        {!displayDocuments || displayDocuments.length === 0 ? (
          <div className="text-neutral-400">
            {isSearching && searchQuery.trim() 
              ? `No documents found matching "${searchQuery}"`
              : 'No documents found.'
            }
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayDocuments.map((doc) => (
              <li key={doc._id} className="bg-neutral-950 border border-neutral-900 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{doc.title}</h3>
                    <p className={`text-sm text-neutral-400 whitespace-pre-wrap ${expanded[doc._id] ? '' : 'line-clamp-3'}`}>
                      {expanded[doc._id]
                        ? (doc.summary || doc.content || '')
                        : (doc.summary || doc.content || '')}
                    </p>
                    <button
                      onClick={() => setExpanded((prev) => ({ ...prev, [doc._id]: !prev[doc._id] }))}
                      className="mt-1 text-xs text-blue-400 hover:text-blue-300"
                    >
                      {expanded[doc._id] ? 'See less' : 'See more'}
                    </button>
                    {Array.isArray(doc.tags) && doc.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {doc.tags.map((t) => (
                          <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300">#{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-neutral-500 mt-2">
                      By {typeof doc.createdBy === 'object' ? (doc.createdBy?.name || doc.createdBy?._id) : doc.createdBy}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(doc)}
                      className="px-3 py-1.5 text-xs rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700"
                    >
                      Edit
                    </button>
                    {canDelete(doc) && (
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="px-3 py-1.5 text-xs rounded-lg bg-red-600 hover:bg-red-500 text-white"
                      >
                        Delete
                      </button>
                    )}
                    <button
                      onClick={() => openVersionHistory(doc)}
                      className="px-3 py-1.5 text-xs rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700"
                    >
                      History
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={closeEdit} />
          <div className="relative z-10 w-full max-w-2xl bg-black border border-neutral-900 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Edit Document</h3>
              <button onClick={closeEdit} className="h-8 w-8 rounded-md border border-neutral-800 bg-neutral-900">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Title</label>
                <input value={formTitle} onChange={(e)=>setFormTitle(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Content</label>
                <textarea value={formContent} onChange={(e)=>setFormContent(e.target.value)} className="w-full min-h-[140px] bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 outline-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Summary</label>
                  <textarea value={formSummary} onChange={(e)=>setFormSummary(e.target.value)} className="w-full min-h-[100px] bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Tags (comma separated)</label>
                  <input value={formTags} onChange={(e)=>setFormTags(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 outline-none" />
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={closeEdit} className="px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800">Cancel</button>
              <button onClick={handleUpdate} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Update</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Version History Modal */}
      {showVersionHistory && selectedDocForVersion && (
        <VersionHistory
          documentId={selectedDocForVersion._id}
          documentTitle={selectedDocForVersion.title}
          onVersionRestored={handleVersionRestored}
          onClose={closeVersionHistory}
        />
      )}
    </div>
  )
}

export default Dashboard