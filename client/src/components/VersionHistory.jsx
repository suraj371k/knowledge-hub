import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchVersionHistory, restoreVersion, clearVersionHistory } from '../features/versionSlice'

const VersionHistory = ({ documentId, documentTitle, onVersionRestored, onClose }) => {
  const dispatch = useDispatch()
  const { versionHistory, loading, error } = useSelector((state) => state.versions)
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const versions = versionHistory[documentId] || []

  useEffect(() => {
    if (documentId) {
      dispatch(fetchVersionHistory(documentId))
    }
    
    return () => {
      dispatch(clearVersionHistory(documentId))
    }
  }, [documentId, dispatch])

  const handleRestore = async () => {
    if (!selectedVersion) return
    
    try {
      await dispatch(restoreVersion({ 
        versionId: selectedVersion._id, 
        documentId 
      })).unwrap()
      
      onVersionRestored?.()
      onClose?.()
      setSelectedVersion(null)
      setShowConfirm(false)
    } catch (error) {
      console.error('Failed to restore version:', error)
    }
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6 text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3"></div>
          <p>Loading version history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6 text-white w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Version History</h2>
          <button 
            onClick={onClose}
            className="h-8 w-8 rounded-md border border-neutral-800 bg-neutral-900 hover:border-neutral-700 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <h3 className="text-lg text-neutral-300 mb-1">{documentTitle}</h3>
          <p className="text-sm text-neutral-500">{versions.length} version{versions.length !== 1 ? 's' : ''}</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">Error: {error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto max-h-[60vh]">
          {/* Version List */}
          <div className="space-y-2">
            <h4 className="font-medium text-neutral-300 mb-3">Versions</h4>
            {versions.length === 0 ? (
              <p className="text-neutral-500 text-sm">No version history available</p>
            ) : (
              versions.map((version) => (
                <div
                  key={version._id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedVersion?._id === version._id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                  }`}
                  onClick={() => setSelectedVersion(version)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-400">v{version.versionNumber}</span>
                    <span className="text-xs text-neutral-500">{formatTimeAgo(version.createdAt)}</span>
                  </div>
                  <p className="text-sm text-neutral-300 mb-1">{version.title}</p>
                  <p className="text-xs text-neutral-500">
                    Edited by {version.editedBy?.name || 'Unknown'} • {formatDate(version.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Version Details */}
          <div className="space-y-2">
            <h4 className="font-medium text-neutral-300 mb-3">Version Details</h4>
            {selectedVersion ? (
              <div className="space-y-4">
                <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-green-400">v{selectedVersion.versionNumber}</h5>
                    <span className="text-xs text-neutral-500">{formatDate(selectedVersion.createdAt)}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Title</label>
                      <p className="text-sm text-white">{selectedVersion.title}</p>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Content</label>
                      <p className="text-sm text-neutral-300 line-clamp-4">{selectedVersion.content}</p>
                    </div>
                    
                    {selectedVersion.summary && (
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">Summary</label>
                        <p className="text-sm text-neutral-300">{selectedVersion.summary}</p>
                      </div>
                    )}
                    
                    {selectedVersion.tags && selectedVersion.tags.length > 0 && (
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">Tags</label>
                        <div className="flex flex-wrap gap-1">
                          {selectedVersion.tags.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-neutral-800 text-neutral-300">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setShowConfirm(true)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium"
                >
                  Restore This Version
                </button>
              </div>
            ) : (
              <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800 text-center">
                <p className="text-neutral-500 text-sm">Select a version to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80">
            <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6 text-white max-w-md">
              <h3 className="text-lg font-semibold mb-3">Restore Version?</h3>
              <p className="text-neutral-300 mb-4">
                This will replace the current document with version {selectedVersion?.versionNumber}. 
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestore}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg"
                >
                  Restore
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VersionHistory
