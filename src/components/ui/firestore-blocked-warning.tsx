"use client"
import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from './alert'
// Lucide-react icon replaced with emoji for compatibility

export function FirestoreBlockedWarning() {
  const [isBlocked, setIsBlocked] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    // Detect if Firebase operations are being blocked
    const detectFirestoreBlocking = () => {
      // Check if there are ERR_BLOCKED_BY_CLIENT errors in console
      const originalError = console.error
      console.error = (...args) => {
        const message = args.join(' ')
        if (message.includes('ERR_BLOCKED_BY_CLIENT') || message.includes('firestore.googleapis.com')) {
          setIsBlocked(true)
          setShowWarning(true)
        }
        originalError.apply(console, args)
      }
    }

    detectFirestoreBlocking()
    
    // Show warning after 5 seconds if no successful operations
    const timer = setTimeout(() => {
      if (isBlocked) {
        setShowWarning(true)
      }
    }, 5000)

    return () => {
      clearTimeout(timer)
    }
  }, [isBlocked])

  if (!showWarning) return null

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <span className="text-orange-600 text-lg">⚠️</span>
      <AlertDescription className="text-orange-800">
        <strong>Having trouble saving data?</strong> Your browser's ad blocker may be interfering with database operations. 
        Try whitelisting this site or temporarily disabling your ad blocker/privacy extensions.
      </AlertDescription>
    </Alert>
  )
}