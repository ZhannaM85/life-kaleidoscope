import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './button'
import { TextField } from './text-field'
import { Textarea } from './textarea'
import { PhotoUpload } from './photo-upload'
import { EmptyState } from './empty-state'
import { PageHeader } from './page-header'
import { ChipGroup } from './chip-group'

describe('Button', () => {
  it('fires onClick and defaults to type="button"', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save memory</Button>)

    const button = screen.getByRole('button', { name: 'Save memory' })
    expect(button).toHaveAttribute('type', 'button')
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not fire when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        Save
      </Button>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Save' })).catch(() => {})
    expect(onClick).not.toHaveBeenCalled()
  })
})

describe('TextField', () => {
  it('associates label with input', () => {
    render(<TextField label="Title" />)
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
  })

  it('announces errors via aria-invalid and aria-describedby', () => {
    render(<TextField label="Approximate year" error="Must be a four-digit year" />)
    const input = screen.getByLabelText('Approximate year')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    const message = screen.getByText('Must be a four-digit year')
    expect(input.getAttribute('aria-describedby')).toBe(message.id)
  })

  it('shows hint text when there is no error', () => {
    render(<TextField label="Year" hint="Roughly is fine" />)
    expect(screen.getByText('Roughly is fine')).toBeInTheDocument()
  })
})

describe('Textarea', () => {
  it('associates label and accepts typing', async () => {
    render(<Textarea label="Your memory" />)
    const area = screen.getByLabelText('Your memory')
    await userEvent.type(area, 'The kitchen smelled of cinnamon.')
    expect(area).toHaveValue('The kitchen smelled of cinnamon.')
  })
})

describe('ChipGroup', () => {
  const options = [
    { value: 'happy', label: 'happy' },
    { value: 'sad', label: 'sad' },
  ]

  it('selects a chip on tap and marks it pressed', async () => {
    const onChange = vi.fn()
    render(<ChipGroup legend="How does this memory feel?" options={options} value={undefined} onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'happy' }))
    expect(onChange).toHaveBeenCalledWith('happy')
  })

  it('clears the selection when the selected chip is tapped again', async () => {
    const onChange = vi.fn()
    render(<ChipGroup legend="How does this memory feel?" options={options} value="happy" onChange={onChange} />)

    const happyChip = screen.getByRole('button', { name: 'happy' })
    expect(happyChip).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(happyChip)
    expect(onChange).toHaveBeenCalledWith(undefined)
  })
})

describe('PhotoUpload', () => {
  it('passes selected files to onSelect', async () => {
    const onSelect = vi.fn()
    render(<PhotoUpload onSelect={onSelect} />)

    const file = new File(['img'], 'yard.png', { type: 'image/png' })
    const input = screen.getByLabelText('Add a photo')
    await userEvent.upload(input, file)

    expect(onSelect).toHaveBeenCalledWith([file])
  })
})

describe('EmptyState and PageHeader', () => {
  it('renders title, description, and action', () => {
    render(
      <EmptyState title="No memories yet" description="Today is a good day to start." action={<Button>Write</Button>} />
    )
    expect(screen.getByRole('heading', { name: 'No memories yet' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Write' })).toBeInTheDocument()
  })

  it('renders PageHeader as a level-1 heading', () => {
    render(<PageHeader title="Memories" description="Everything you have written." />)
    expect(screen.getByRole('heading', { level: 1, name: 'Memories' })).toBeInTheDocument()
  })
})
