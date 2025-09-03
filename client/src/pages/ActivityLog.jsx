import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTeamActivityFeed, fetchRecentEditedDocuments } from '../features/activitySlice'

const ActivityLog = () => {
  const dispatch = useDispatch()
  const { teamFeed, recentEditedDocs, loading, error } = useSelector((state) => state.activities)

  useEffect(() => {
    dispatch(fetchTeamActivityFeed())
    dispatch(fetchRecentEditedDocuments())
  }, [dispatch])

  const getActionIcon = (action) => {
    switch (action) {
      case 'create':
        return '📝'
      case 'update':
        return '✏️'
      case 'delete':
        return '🗑️'
      default:
        return '📋'
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

  if (loading) {
    return (
      <div className="p-4 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading activities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-semibold mb-6">Activity Log</h1>
      
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-400">Error: {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Activity Feed */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>👥</span>
            Team Activity Feed
          </h2>
          
          {teamFeed.length === 0 ? (
            <p className="text-neutral-400">No recent team activities</p>
          ) : (
            <div className="space-y-3">
              {teamFeed.map((activity) => (
                <div key={activity._id} className="flex items-start gap-3 p-3 bg-neutral-900 rounded-lg">
                  <span className="text-lg">{getActionIcon(activity.action)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium text-blue-400">
                        {activity.user?.name || 'Unknown User'}
                      </span>
                      {' '}
                      <span className="text-neutral-300">
                        {activity.action === 'create' && 'created'}
                        {activity.action === 'update' && 'updated'}
                        {activity.action === 'delete' && 'deleted'}
                      </span>
                      {' '}
                      <span className="font-medium text-green-400">
                        {activity.document?.title || 'a document'}
                      </span>
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {formatTimeAgo(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Edited Documents */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>📚</span>
            Recently Edited Documents
          </h2>
          
          {recentEditedDocs.length === 0 ? (
            <p className="text-neutral-400">No recently edited documents</p>
          ) : (
            <div className="space-y-3">
              {recentEditedDocs.map((doc) => (
                <div key={doc._id} className="p-3 bg-neutral-900 rounded-lg">
                  <h3 className="font-medium text-green-400 mb-1">{doc.title}</h3>
                  {doc.summary && (
                    <p className="text-sm text-neutral-300 mb-2 line-clamp-2">{doc.summary}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>Edited by {doc.lastEditedBy?.name || 'Unknown'}</span>
                    <span>{formatTimeAgo(doc.lastEditedAt)}</span>
                  </div>
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {doc.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-neutral-800 text-neutral-300">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ActivityLog
