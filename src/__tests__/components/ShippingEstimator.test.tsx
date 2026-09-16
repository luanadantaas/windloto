import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShippingEstimator from '@/components/ShippingEstimator'

function setup(selected = null as any) {
  const onSelect = jest.fn()
  render(<ShippingEstimator onSelect={onSelect} selected={selected} />)
  return { onSelect }
}

describe('ShippingEstimator', () => {
  it('renders a ZIP input and Calculate button', () => {
    setup()
    expect(screen.getByPlaceholderText('ZIP / Postal code')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /calculate/i })).toBeInTheDocument()
  })

  it('shows error when Calculate is clicked with empty input', async () => {
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: /calculate/i }))
    expect(screen.getByText('Please enter a ZIP or postal code.')).toBeInTheDocument()
  })

  it('shows US options for a valid 5-digit ZIP', async () => {
    const user = userEvent.setup()
    const { onSelect } = setup()
    await user.type(screen.getByPlaceholderText('ZIP / Postal code'), '10001')
    await user.click(screen.getByRole('button', { name: /calculate/i }))
    expect(screen.getByText('USPS Priority')).toBeInTheDocument()
    expect(screen.getByText('FedEx 2nd Day')).toBeInTheDocument()
    expect(screen.getByText('FedEx Next Day')).toBeInTheDocument()
    // onSelect called with first option (USPS Priority, price 0)
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'USPS Priority', price: 0 })
    )
  })

  it('shows US options for ZIP+4 format', async () => {
    const user = userEvent.setup()
    setup()
    await user.type(screen.getByPlaceholderText('ZIP / Postal code'), '10001-1234')
    await user.click(screen.getByRole('button', { name: /calculate/i }))
    expect(screen.getByText('USPS Priority')).toBeInTheDocument()
  })

  it('shows international options for a non-US postal code', async () => {
    const user = userEvent.setup()
    setup()
    await user.type(screen.getByPlaceholderText('ZIP / Postal code'), 'SW1A 1AA')
    await user.click(screen.getByRole('button', { name: /calculate/i }))
    expect(screen.getByText('International Postal')).toBeInTheDocument()
    expect(screen.getByText('International DHL')).toBeInTheDocument()
  })

  it('USPS Priority label shows "Free" text', async () => {
    const user = userEvent.setup()
    setup()
    await user.type(screen.getByPlaceholderText('ZIP / Postal code'), '10001')
    await user.click(screen.getByRole('button', { name: /calculate/i }))
    const freeLabel = screen.getByText('Free')
    expect(freeLabel).toBeInTheDocument()
    expect(freeLabel).toHaveClass('text-green-600')
  })

  it('selecting an option calls onSelect with the correct shipping option', async () => {
    const user = userEvent.setup()
    const { onSelect } = setup()
    await user.type(screen.getByPlaceholderText('ZIP / Postal code'), '10001')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    const fedexLabel = screen.getByText('FedEx 2nd Day').closest('label')!
    await user.click(fedexLabel)
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'FedEx 2nd Day', price: 35 })
    )
  })
})
