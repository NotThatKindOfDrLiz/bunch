import { useEffect, useState, useCallback, useRef } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import type { IDetectedBarcode } from '@yudiel/react-qr-scanner/dist/types'

interface QRCodeScannerProps {
  onDecode: (payload: unknown) => void
}

export const QRCodeScanner = ({ onDecode }: QRCodeScannerProps) => {
  const [fallbackInput, setFallbackInput] = useState('')
  const [cameraSupported, setCameraSupported] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const lastScannedRef = useRef<string>('')
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    // Check camera support
    if (!('mediaDevices' in navigator) || !navigator.mediaDevices?.getUserMedia) {
      setCameraSupported(false)
      return
    }

    // Test camera access
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        // Camera works, stop the stream
        stream.getTracks().forEach((track) => track.stop())
        setCameraSupported(true)
      })
      .catch(() => {
        setCameraSupported(false)
      })
  }, [])

  // Debounce scans to prevent duplicate processing
  const handleResult = useCallback(
    (result: IDetectedBarcode[]) => {
      if (!result.length) return
      const text = result[0]?.rawValue ?? ''
      if (!text) return

      // Prevent duplicate scans
      if (lastScannedRef.current === text) return
      lastScannedRef.current = text

      // Clear any pending timeout
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current)
      }

      // Debounce: wait 300ms before processing
      setIsScanning(true)
      scanTimeoutRef.current = setTimeout(() => {
        try {
          const parsed = JSON.parse(text) as unknown
          onDecode(parsed)
        } catch (error) {
          // If not JSON, try as plain text
          onDecode(text)
        } finally {
          setIsScanning(false)
          // Reset after 2 seconds to allow re-scanning same code
          setTimeout(() => {
            lastScannedRef.current = ''
          }, 2000)
        }
      }, 300)
    },
    [onDecode],
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current)
      }
    }
  }, [])

  // Optimized camera constraints for better performance
  const cameraConstraints = {
    facingMode: 'environment' as const,
    width: { ideal: 1280 },
    height: { ideal: 720 },
  }

  return (
    <div className="space-y-4">
      {cameraSupported ? (
        <div className="relative">
          <Scanner
            constraints={cameraConstraints}
            onScan={handleResult}
            onError={(error) => {
              console.warn('[QR Scanner] Camera error:', error)
              setCameraSupported(false)
            }}
            scanDelay={300}
            styles={{
              container: { borderRadius: '16px', overflow: 'hidden' },
            }}
          />
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl pointer-events-none">
              <div className="bg-white rounded-full p-3">
                <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-white/70 text-center">Camera unavailable. Paste code instead.</p>
          <textarea
            className="w-full min-h-[120px] rounded-2xl bg-black/40 border border-white/10 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
            placeholder="Paste QR payload or code"
            value={fallbackInput}
            onChange={(event) => setFallbackInput(event.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                try {
                  const parsed = JSON.parse(fallbackInput) as unknown
                  onDecode(parsed)
                  setFallbackInput('')
                } catch (error) {
                  onDecode(fallbackInput)
                  setFallbackInput('')
                }
              }
            }}
          />
          <button
            className="w-full py-3 rounded-2xl bg-brand-orange text-black font-semibold hover:bg-brand-orange/90 transition-colors"
            onClick={() => {
              try {
                const parsed = JSON.parse(fallbackInput) as unknown
                onDecode(parsed)
                setFallbackInput('')
              } catch (error) {
                onDecode(fallbackInput)
                setFallbackInput('')
              }
            }}
          >
            Submit code
          </button>
        </div>
      )}
    </div>
  )
}
