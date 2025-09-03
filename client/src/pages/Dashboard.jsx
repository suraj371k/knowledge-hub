import React, { useEffect, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchAllDocuments, deleteDocument, updateDocument, searchDocuments } from '../features/documentSlice'
import { useNavigate } from 'react-router-dom'
import VersionHistory from '../components/VersionHistory'
import { 
  Search, 
  X, 
  Edit3, 
  Trash2, 
  History, 
  ChevronDown, 
  ChevronUp, 
  Tag, 
  User,
  FileText,
  Save,
  XCircle
} from 'lucide-react'

const Dashboard = () => {
  const dispatch = useDispatch()
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
    <div className="p-3 sm:p-4 lg:p-6 xl:p-8 text-white min-h-screen max-w-full">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold flex items-center gap-2">
          <FileText className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 mt-1 ml-8 sm:ml-9 lg:ml-10">
          Welcome, {user?.name || 'User'}!
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4 sm:mb-6">
        <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-10 sm:px-11 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                setIsSearching(false)
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-xs sm:text-sm text-neutral-400 mt-2 flex items-center gap-1">
            {isSearching ? (
              <>
                <Search className="w-3 h-3 animate-pulse" />
                Searching...
              </>
            ) : (
              <>
                Found {searchResults?.length || 0} result{searchResults?.length !== 1 ? 's' : ''}
              </>
            )}
          </p>
        )}
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-neutral-400 text-sm sm:text-base flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          Loading...
        </div>
      )}

      {/* Documents Section */}
      <div className="mt-4">
        <h2 className="text-lg sm:text-xl font-medium mb-3 sm:mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
          {isSearching && searchQuery.trim() ? 'Search Results' : 'All Documents'}
        </h2>
        
        {!displayDocuments || displayDocuments.length === 0 ? (
          <div className="text-neutral-400 text-sm sm:text-base text-center py-8 sm:py-12 flex flex-col items-center gap-3">
            <FileText className="w-12 h-12 opacity-30" />
            {isSearching && searchQuery.trim() 
              ? `No documents found matching "${searchQuery}"`
              : 'No documents found.'
            }
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {displayDocuments.map((doc) => (
              <div 
                key={doc._id} 
                className="bg-neutral-950 border border-neutral-900 rounded-xl p-4 sm:p-5 lg:p-6 hover:border-neutral-800 transition-all duration-200 hover:shadow-lg hover:shadow-neutral-900/20"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title and Content */}
                    <div className="mb-3">
                      <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 text-white flex items-start gap-2">
                        <FileText className="w-5 h-5 mt-0.5 text-neutral-400 shrink-0" />
                        <span className="break-words">{doc.title}</span>
                      </h3>
                      
                      <div className="ml-7">
                        <p className={`text-xs sm:text-sm text-neutral-400 whitespace-pre-wrap leading-relaxed ${
                          expanded[doc._id] ? '' : 'line-clamp-2 sm:line-clamp-3'
                        }`}>
                          {expanded[doc._id]
                            ? (doc.summary || doc.content || '')
                            : (doc.summary || doc.content || '')}
                        </p>
                        
                        {(doc.summary || doc.content) && (
                          <button
                            onClick={() => setExpanded((prev) => ({ ...prev, [doc._id]: !prev[doc._id] }))}
                            className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            {expanded[doc._id] ? (
                              <>
                                <ChevronUp className="w-3 h-3" />
                                See less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3" />
                                See more
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Tags and Author */}
                    <div className="ml-7 space-y-2">
                      {Array.isArray(doc.tags) && doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {doc.tags.map((t) => (
                            <span 
                              key={t} 
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 text-xs text-neutral-500">
                        <User className="w-3 h-3" />
                        <span>
                          {typeof doc.createdBy === 'object' 
                            ? (doc.createdBy?.name || doc.createdBy?._id) 
                            : doc.createdBy}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-row lg:flex-col gap-2 lg:gap-2 shrink-0 lg:ml-4">
                    <button
                      onClick={() => openEdit(doc)}
                      className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 transition-colors text-white min-w-[80px] lg:min-w-[100px]"
                    >
                      <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    
                    <button
                      onClick={() => openVersionHistory(doc)}
                      className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 transition-colors text-white min-w-[80px] lg:min-w-[100px]"
                    >
                      <History className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">History</span>
                    </button>
                    
                    {canDelete(doc) && (
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg bg-red-600 hover:bg-red-500 transition-colors text-white min-w-[80px] lg:min-w-[100px]"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeEdit} />
          <div className="relative z-10 w-full max-w-2xl lg:max-w-4xl max-h-[90vh] bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-800 bg-neutral-900/50">
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Edit Document
              </h3>
              <button 
                onClick={closeEdit} 
                className="h-8 w-8 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className=" text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Title
                  </label>
                  <input 
                    value={formTitle} 
                    onChange={(e)=>setFormTitle(e.target.value)} 
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-sm sm:text-base text-white placeholder-neutral-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
                    placeholder="Enter document title"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Content
                  </label>
                  <textarea 
                    value={formContent} 
                    onChange={(e)=>setFormContent(e.target.value)} 
                    className="w-full min-h-[120px] sm:min-h-[160px] bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-sm sm:text-base text-white placeholder-neutral-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-y" 
                    placeholder="Enter document content"
                  />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Summary</label>
                    <textarea 
                      value={formSummary} 
                      onChange={(e)=>setFormSummary(e.target.value)} 
                      className="w-full min-h-[80px] sm:min-h-[100px] bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-sm sm:text-base text-white placeholder-neutral-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-y" 
                      placeholder="Enter document summary"
                    />
                  </div>
                  <div>
                    <label className=" text-sm font-medium text-neutral-300 mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags (comma separated)
                    </label>
                    <input 
                      value={formTags} 
                      onChange={(e)=>setFormTags(e.target.value)} 
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-sm sm:text-base text-white placeholder-neutral-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-neutral-800 bg-neutral-900/50">
              <button 
                onClick={closeEdit} 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white hover:bg-neutral-700 transition-colors text-sm sm:text-base"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button 
                onClick={handleUpdate} 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm sm:text-base"
              >
                <Save className="w-4 h-4" />
                Update
              </button>
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