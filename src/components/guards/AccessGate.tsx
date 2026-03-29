import { useRef, useState } from 'react'
import './access-gate.css'

interface AccessGateProps {
  onSuccess: () => void
  validateCode: (code: string) => boolean
}

export function AccessGate({ onSuccess, validateCode }: AccessGateProps) {
  const [digits, setDigits] = useState(['', '', '', ''])
  const [error, setError] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const didFocus = useRef(false)

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    setError(false)

    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }

    if (next.every(d => d !== '')) {
      const code = next.join('')
      if (validateCode(code)) {
        onSuccess()
      } else {
        setError(true)
        setTimeout(() => {
          setDigits(['', '', '', ''])
          setError(false)
          inputRefs.current[0]?.focus()
        }, 800)
      }
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (pasted.length === 4) {
      const next = pasted.split('')
      setDigits(next)
      if (validateCode(pasted)) {
        onSuccess()
      } else {
        setError(true)
        setTimeout(() => {
          setDigits(['', '', '', ''])
          setError(false)
          inputRefs.current[0]?.focus()
        }, 800)
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
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => {
                inputRefs.current[i] = el
                if (i === 0 && el && !didFocus.current) {
                  didFocus.current = true
                  requestAnimationFrame(() => el.focus())
                }
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              onPaste={handlePaste}
              aria-label={`Code digit ${i + 1} of 4`}
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
