import { Field, FieldHint, FieldInput, FieldLabel } from '@shared/components/ui/Field'

export function SignupFormField({ label, hint, error, children, className = '', htmlFor, inputProps, ...props }) {
  return (
    <Field className={className} {...props}>
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {children ?? (htmlFor ? <FieldInput id={htmlFor} error={error} {...inputProps} /> : null)}
      {hint && <FieldHint error={error}>{hint}</FieldHint>}
    </Field>
  )
}
