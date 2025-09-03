import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createDocument } from '../features/documentSlice'

const CreateDocument = () => {
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.documents)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [summary, setSummary] = useState('')
  const [tags, setTags] = useState([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (error) setSaved(false)
  }, [error])

  const containerStyle = useMemo(() => ({
    minHeight: '100vh',
    backgroundColor: '#000',
    color: '#fff',
    display: 'flex',
    justifyContent: 'center',
    padding: '32px 16px'
  }), [])

  const cardStyle = useMemo(() => ({
    width: '100%',
    maxWidth: 900,
    background: '#0f0f0f',
    border: '1px solid #1f1f1f',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
  }), [])

  const labelStyle = {
    display: 'block',
    marginBottom: 8,
    color: '#bfbfbf',
    fontSize: 14
  }

  const inputStyle = {
    width: '100%',
    background: '#111',
    border: '1px solid #2a2a2a',
    borderRadius: 10,
    color: '#fff',
    padding: '12px 14px',
    outline: 'none'
  }

  const textareaStyle = {
    ...inputStyle,
    minHeight: 160,
    resize: 'vertical'
  }

  const sectionStyle = { marginBottom: 20 }

  const buttonRowStyle = {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap'
  }

  const primaryButtonStyle = (disabled) => ({
    background: disabled ? '#1a1a1a' : '#2563eb',
    border: '1px solid ' + (disabled ? '#2a2a2a' : '#3b82f6'),
    color: '#fff',
    padding: '10px 16px',
    borderRadius: 10,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.2s ease',
  })

  const secondaryButtonStyle = (disabled) => ({
    background: disabled ? '#121212' : '#0b0b0b',
    border: '1px solid #2a2a2a',
    color: '#e5e5e5',
    padding: '10px 16px',
    borderRadius: 10,
    cursor: disabled ? 'not-allowed' : 'pointer',
  })

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: 999,
    background: '#111',
    border: '1px solid #262626',
    color: '#e5e5e5',
    fontSize: 12,
    marginRight: 8,
    marginBottom: 8
  }

  const helpTextStyle = { color: '#8a8a8a', fontSize: 12, marginTop: 6 }

  // Backend will generate summary/tags on create; no client button needed

  const handleSave = async () => {
    setSaved(false)
    if (!title.trim() || !content.trim()) return
    try {
      await dispatch(createDocument({ title: title.trim(), content: content.trim() })).unwrap()
      setSaved(true)
      setTitle('')
      setContent('')
      setSummary('')
      setTags([])
    } catch (_) {
      // error handled via slice
    }
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ margin: 0, fontSize: 24, marginBottom: 6 }}>Create Document</h2>
        <p style={{ marginTop: 0, color: '#9aa0a6' }}>Add a title and description. Preview a local summary and tags, then save. Server will generate final summary and tags on save.</p>

        <div style={sectionStyle}>
          <label style={labelStyle}>Title</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="Enter document title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div style={helpTextStyle}>A short, descriptive title.</div>
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Description</label>
          <textarea
            style={textareaStyle}
            placeholder="Write your document content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div style={helpTextStyle}>This content will be used by the server to generate the summary and tags.</div>
        </div>

        <div style={{ ...sectionStyle, marginBottom: 12 }}>
          <div style={buttonRowStyle}>
            <button
              style={primaryButtonStyle(loading || !title.trim() || !content.trim())}
              disabled={loading || !title.trim() || !content.trim()}
              onClick={handleSave}
            >
              {loading ? 'Saving...' : 'Save Document'}
            </button>
          </div>
          {error && (
            <div style={{ color: '#ef4444', marginTop: 10 }}>Error: {error}</div>
          )}
          {saved && !error && (
            <div style={{ color: '#10b981', marginTop: 10 }}>Document saved successfully.</div>
          )}
        </div>

        {(summary || (tags && tags.length)) && (
          <div style={{ ...sectionStyle, marginTop: 8 }}>
            <h3 style={{ marginTop: 0, fontSize: 18, color: '#c7c7c7' }}>Preview</h3>
            {summary && (
              <div style={{
                background: '#0b0b0b',
                border: '1px solid #202020',
                borderRadius: 10,
                padding: 12,
                color: '#e5e5e5',
                marginBottom: 12
              }}>{summary}</div>
            )}
            {tags && tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {tags.map((t) => (
                  <span key={t} style={badgeStyle}>#{t}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateDocument