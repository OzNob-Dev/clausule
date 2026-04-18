export default function DigitRow({ digits, inputRefs, inputState, onChange, onKeyDown, onPaste }) {
  return (
    <div
      className={[
        'mfa-otp-row',
        inputState === 'error' ? 'mfa-otp-row--error' : '',
        inputState === 'done' ? 'mfa-otp-row--valid' : '',
      ].join(' ')}
      onPaste={onPaste}
      role="group"
      aria-label="6-digit code"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => { inputRefs.current[index] = element }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={1}
          value={digit}
          onChange={(event) => onChange(index, event.target.value)}
          onKeyDown={(event) => onKeyDown(index, event)}
          className="mfa-otp-box"
          aria-label={`Digit ${index + 1} of 6`}
          autoFocus={index === 0}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          disabled={inputState === 'done' || inputState === 'checking'}
        />
      ))}
    </div>
  )
}
