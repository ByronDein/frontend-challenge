import React from 'react'
import './Notification.css'

interface NotificationProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  return (
    <div className={`notification ${type}`}>
      <div className="notification-content">
        <span className="material-icons">
          {type === 'success' ? 'check_circle' : 'error'}
        </span>
        <span className="notification-message">{message}</span>
        <button 
          className="notification-close"
          onClick={onClose}
        >
          <span className="material-icons">close</span>
        </button>
      </div>
    </div>
  )
}

export default Notification
