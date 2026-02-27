'use client'

import React from 'react'

export const EditLinkWithCopy = ({ className, filePath, children }: { className?: string, filePath?: string, children?: React.ReactNode }) => {
  const repoBase = 'https://github.com/Makinari/API/tree/main'
  const editUrl = filePath ? `${repoBase}/${filePath}` : repoBase

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      alert('Page URL copied to clipboard!')
    }
  }

  return (
    <div className={className} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <a href={editUrl} target="_blank" rel="noreferrer">
        {children || 'Edit this page'}
      </a>
      <button onClick={handleCopy} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        Copy page
      </button>
    </div>
  )
}
