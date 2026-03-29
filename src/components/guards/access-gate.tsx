import { useState, useRef, useEffect } from 'react'
import type { KeyboardEvent, ClipboardEvent } from 'react'
import './access-gate.css'

interface AccessGateProps {
  onSuccess: () => void
  validateCode: (code: string) => boolean
}

export function AccessGate({ onSuccess, validateCode }: AccessGateProps) {
  const [code, setCode] = useState<string[]>(['', '', '', ''])
  const [error, setError] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const firstInputFocused = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1)
    }
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setError(false)

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }

    if (index === 3 && value) {
      const fullCode = newCode.join('')
      if (validateCode(fullCode)) {
        onSuccess()
      } else {
        setError(true)
        setTimeout(() => {
          setCode(['', '', '', ''])
          inputRefs.current[0]?.focus()
        }, 500)
      }
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    if (/^\d{4}$/.test(pastedData)) {
      const digits = pastedData.split('')
      setCode(digits)
      setError(false)
      inputRefs.current[3]?.focus()
      if (validateCode(pastedData)) {
        onSuccess()
      } else {
        setError(true)
        setTimeout(() => {
          setCode(['', '', '', ''])
          inputRefs.current[0]?.focus()
        }, 500)
      }
    }
  }

  return (
    <div className="ag-overlay">
      <div className="ag-card">
        <div className="ag-header">
          <h2 className="ag-title">Zugriff erforderlich</h2>
          <p className="ag-subtitle">Bitte gib den 4-stelligen Code ein</p>
        </div>

        <div className={`ag-inputs${error ? ' ag-inputs--error' : ''}`}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
                if (index === 0 && el && !firstInputFocused.current) {
                  firstInputFocused.current = true
                  requestAnimationFrame(() => el.focus())
                }
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              aria-label={`Code digit ${index + 1} of 4`}
              aria-required="true"
              aria-invalid={error}
              className={`ag-digit${error ? ' ag-digit--error' : ''}`}
            />
          ))}
        </div>

        {error && (
          <div className="ag-error-msg" role="alert">
            Falscher Code. Bitte versuche es erneut.
          </div>
        )}
      </div>
    </div>
  )
}
