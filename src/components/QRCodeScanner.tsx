import { useEffect, useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import type { IDetectedBarcode } from '@yudiel/react-qr-scanner/dist/types'

interface QRCodeScannerProps {
  onDecode: (payload: unknown) => void
}

export const QRCodeScanner = ({ onDecode }: QRCodeScannerProps) => {
  const [fallbackInput, setFallbackInput] = useState('')
  const [cameraSupported, setCameraSupported] = useState(true)

  useEffect(() => {
    if (!('mediaDevices' in navigator)) {
      setCameraSupported(false)
    }
  }, [])

  const handleResult = (result: IDetectedBarcode[]) => {
    if (!result.length) return
    const text = result[0]?.rawValue ?? ''
    if (!text) return
    try {
      const parsed = JSON.parse(text) as unknown
      onDecode(parsed)
    } catch (error) {
      onDecode(text)
    }
  }

  return (
    <div className="space-y-4">
      {cameraSupported ? (
        <Scanner
          constraints={{ facingMode: 'environment' }}
          onScan={handleResult}
          onError={() => setCameraSupported(false)}
        />
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-white/70 text-center">Camera unavailable. Paste code instead.</p>
          <textarea
            className="w-full min-h-[120px] rounded-2xl bg-black/40 border border-white/10 p-3 text-sm"
            placeholder="Paste QR payload"
            value={fallbackInput}
            onChange={(event) => setFallbackInput(event.target.value)}
          />
          <button
            className="w-full py-3 rounded-2xl bg-brand-orange text-black font-semibold"
            onClick={() => {
              try {
                const parsed = JSON.parse(fallbackInput) as unknown
                onDecode(parsed)
              } catch (error) {
                onDecode(fallbackInput)
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
