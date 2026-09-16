import React from 'react'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VariantSelector from '@/components/VariantSelector'

jest.mock('@/components/AddToCartButton', () => ({
  __esModule: true,
  default: ({ variantId, quantity }: any) => (
    <button data-testid="add-to-cart" data-variant={variantId} data-quantity={quantity}>
      Add to Cart
    </button>
  ),
}))

const options = [
  { name: 'Order Type', values: ['Single Unit', 'Bulk Order (20+)'] },
]
const variants = [
  {
    id: 'gid://shopify/ProductVariant/100',
    title: 'Single Unit',
    availableForSale: true,
    price: { amount: '62.50', currencyCode: 'USD' },
    selectedOptions: [{ name: 'Order Type', value: 'Single Unit' }],
  },
  {
    id: 'gid://shopify/ProductVariant/101',
    title: 'Bulk Order (20+)',
    availableForSale: true,
    price: { amount: '55.00', currencyCode: 'USD' },
    selectedOptions: [{ name: 'Order Type', value: 'Bulk Order (20+)' }],
  },
]

const colorOptions = [{ name: 'Color', values: ['Red', 'Blue', 'Navy'] }]
const colorVariants = [
  {
    id: 'cv1',
    title: 'Red',
    availableForSale: true,
    price: { amount: '50.00', currencyCode: 'USD' },
    selectedOptions: [{ name: 'Color', value: 'Red' }],
  },
  {
    id: 'cv2',
    title: 'Blue',
    availableForSale: true,
    price: { amount: '50.00', currencyCode: 'USD' },
    selectedOptions: [{ name: 'Color', value: 'Blue' }],
  },
  {
    id: 'cv3',
    title: 'Navy',
    availableForSale: true,
    price: { amount: '50.00', currencyCode: 'USD' },
    selectedOptions: [{ name: 'Color', value: 'Navy' }],
  },
]

const defaultProps = {
  options,
  variants,
  productTitle: 'Ram Lock',
  productImage: 'https://cdn.shopify.com/img1.jpg',
}

describe('VariantSelector', () => {
  it('renders option button rows for non-Color options', () => {
    render(<VariantSelector {...defaultProps} />)
    expect(screen.getByRole('button', { name: /single unit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /bulk order/i })).toBeInTheDocument()
  })

  it('renders circular color swatches for Color option', () => {
    render(
      <VariantSelector
        options={colorOptions}
        variants={colorVariants}
        productTitle="Test"
        productImage="img.jpg"
      />
    )
    const redBtn = screen.getByTitle('Red')
    expect(redBtn).toBeInTheDocument()
    expect(redBtn.className).toContain('rounded-full')
  })

  it('"Single Unit" option is active initially (has border-[#0f2d5a] class)', () => {
    render(<VariantSelector {...defaultProps} />)
    const singleUnitBtn = screen.getByRole('button', { name: /single unit/i })
    expect(singleUnitBtn.className).toContain('border-[#0f2d5a]')
  })

  it('clicking "Bulk Order (20+)" makes it active', async () => {
    const user = userEvent.setup()
    render(<VariantSelector {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /bulk order/i }))
    // After async state update wait for the useEffect (isBulk → setQuantity)
    const bulkBtn = screen.getByRole('button', { name: /bulk order/i })
    expect(bulkBtn.className).toContain('border-[#0f2d5a]')
  })

  it('default quantity is 1 for Single Unit variant', () => {
    render(<VariantSelector {...defaultProps} />)
    const qtyInput = screen.getByRole('spinbutton')
    expect(qtyInput).toHaveValue(1)
  })

  it('selecting bulk variant changes quantity to 20', async () => {
    const user = userEvent.setup()
    render(<VariantSelector {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /bulk order/i }))
    const qtyInput = screen.getByRole('spinbutton')
    expect(qtyInput).toHaveValue(20)
  })

  it('minus button is disabled when quantity equals the minimum (1 for single unit)', () => {
    render(<VariantSelector {...defaultProps} />)
    const minusBtn = screen.getByRole('button', { name: '−' })
    expect(minusBtn).toBeDisabled()
  })

  it('minus button is disabled at minimum of 20 for bulk variant', async () => {
    const user = userEvent.setup()
    render(<VariantSelector {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /bulk order/i }))
    const minusBtn = screen.getByRole('button', { name: '−' })
    expect(minusBtn).toBeDisabled()
  })

  it('shows bulk discount badge when bulk variant is active', async () => {
    const user = userEvent.setup()
    render(<VariantSelector {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /bulk order/i }))
    expect(screen.getByText('Bulk discount')).toBeInTheDocument()
  })

  it('price summary shows unit price × quantity', () => {
    render(<VariantSelector {...defaultProps} />)
    // Default: 62.50 × 1 = USD 62.50
    expect(screen.getByText('USD 62.50')).toBeInTheDocument()
    expect(screen.getByText(/USD 62\.50 × 1/)).toBeInTheDocument()
  })
})
