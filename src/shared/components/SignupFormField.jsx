import './SignupFormField.css'

import { Field, FieldHint, FieldInput, FieldLabel } from '@shared/components/ui/Field'

export function SignupFormField({ label, hint, htmlFor, inputProps = {} }) {
  return (
    <Field>
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      <FieldInput id={htmlFor} {...inputProps} />
      {hint ? <FieldHint>{hint}</FieldHint> : null}
    </Field>
  )
}
