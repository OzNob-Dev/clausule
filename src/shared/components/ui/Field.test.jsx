import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Field, FieldCheckbox, FieldHint, FieldInput, FieldLabel, FieldSelect, FieldTextarea } from './Field'

describe('Field', () => {
  it('renders field primitives with accessible labels', () => {
    render(
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <FieldInput id="email" defaultValue="ada@example.com" />
        <FieldSelect aria-label="Role" defaultValue="engineer">
          <option value="engineer">Engineer</option>
        </FieldSelect>
        <FieldTextarea aria-label="Notes" defaultValue="Hello" />
        <label>
          <FieldCheckbox defaultChecked />
          Accept
        </label>
        <FieldHint error>Required</FieldHint>
      </Field>
    )

    expect(screen.getByLabelText('Email')).toHaveValue('ada@example.com')
    expect(screen.getByRole('combobox', { name: 'Role' })).toHaveValue('engineer')
    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveValue('Hello')
    expect(screen.getByRole('checkbox', { name: /Accept/ })).toBeChecked()
    expect(screen.getByText('Required')).toBeInTheDocument()
  })
})
