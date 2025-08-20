import React from 'react'
import './QuotePreviewModal.css'

interface QuotePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  quoteContent: string
  onDownload: () => void
}

const QuotePreviewModal: React.FC<QuotePreviewModalProps> = ({
  isOpen,
  onClose,
  quoteContent,
  onDownload
}) => {
  if (!isOpen) return null

  const handleDownload = () => {
    onDownload()
    onClose()
  }

  return (
    <div className="preview-modal">
      <div className="preview-content">
        <div className="preview-header">
          <h3>Previsualización de Cotización</h3>
          <button 
            className="close-btn"
            onClick={onClose}
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="preview-body">
          <pre className="quote-preview">{quoteContent}</pre>
        </div>
        
        <div className="preview-actions">
          <button 
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cerrar
          </button>
          <button 
            onClick={handleDownload}
            className="btn btn-primary"
          >
            <span className="material-icons">download</span>
            Descargar
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuotePreviewModal
