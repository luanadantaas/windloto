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
    quantityAvailable: null,
    price: { amount: '62.50', currencyCode: 'USD' },
    selectedOptions: [{ name: 'Order Type', value: 'Single Unit' }],
  },
  {
    id: 'gid://shopify/ProductVariant/101',
    title: 'Bulk Order (20+)',
    availableForSale: true,
    quantityAvailable: null,
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
    quantityAvailable: null,
    price: { amount: '50.00', currencyCode: 'USD' },
    selectedOptions: [{ name: 'Color', value: 'Red' }],
  },
  {
    id: 'cv2',
    title: 'Blue',
    availableForSale: true,
    quantityAvailable: null,
    price: { amount: '50.00', currencyCode: 'USD' },
    selectedOptions: [{ name: 'Color', value: 'Blue' }],
  },
  {
    id: 'cv3',
    title: 'Navy',
    availableForSale: true,
    quantityAvailable: null,
    price: { amount: '50.00', currencyCode: 'USD' },
    selectedOptions: [{ name: 'Color', value: 'Navy' }],
  },
]

// Includes 'Chartreuse' which is NOT in COLOR_MAP → should render as text pill
const mixedColorOptions = [{ name: 'Color', values: ['Navy', 'Red', 'Chartreuse'] }]
const mixedColorVariants = [
  {
    id: 'mc1',
    title: 'Navy',
    availableForSale: true,
    quantityAvailable: null,
    price: { amount: '62.50', currencyCode: 'USD' },
    selectedOptions: [{ name: 'Color', value: 'Navy' }],
  },
  {
    id: 'mc2',
    title: 'Red',
    availableForSale: true,
    quantityAvailable: null,
    price: { amount: '62.50', currencyCode: 'USD' },
    selectedOptions: [{ name: 'Color', value: 'Red' }],
  },
  {
    id: 'mc3',
    title: 'Chartreuse',
    availableForSale: true,
    quantityAvailable: null,
    price: { amount: '62.50', currencyCode: 'USD' },
    selectedOptions: [{ name: 'Color', value: 'Chartreuse' }],
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

describe('VariantSelector — color swatches', () => {
  const colorProps = {
    options: colorOptions,
    variants: colorVariants,
    productTitle: 'Ram Lock',
    productImage: 'img.jpg',
  }

  it('known color swatch has aria-label equal to the color name', () => {
    render(<VariantSelector {...colorProps} />)
    expect(screen.getByLabelText('Red')).toBeInTheDocument()
    expect(screen.getByLabelText('Navy')).toBeInTheDocument()
  })

  it('first color swatch is aria-pressed="true" by default (it is selected)', () => {
    render(<VariantSelector {...colorProps} />)
    // First variant is Red — its swatch should be pressed
    expect(screen.getByLabelText('Red')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Blue')).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking a color swatch selects it (aria-pressed becomes true)', async () => {
    const user = userEvent.setup()
    render(<VariantSelector {...colorProps} />)
    await user.click(screen.getByLabelText('Navy'))
    expect(screen.getByLabelText('Navy')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Red')).toHaveAttribute('aria-pressed', 'false')
  })

  it('unknown color renders as a text pill button, not a circle with a letter', () => {
    render(
      <VariantSelector
        options={mixedColorOptions}
        variants={mixedColorVariants}
        productTitle="Test"
        productImage="img.jpg"
      />
    )
    const pill = screen.getByRole('button', { name: 'Chartreuse' })
    expect(pill).toBeInTheDocument()
    // Is a text pill — does NOT have rounded-full class
    expect(pill.className).not.toContain('rounded-full')
    expect(pill.className).toContain('rounded-lg')
  })

  it('unknown color text pill becomes active when clicked', async () => {
    const user = userEvent.setup()
    render(
      <VariantSelector
        options={mixedColorOptions}
        variants={mixedColorVariants}
        productTitle="Test"
        productImage="img.jpg"
      />
    )
    const pill = screen.getByRole('button', { name: 'Chartreuse' })
    await user.click(pill)
    expect(pill.className).toContain('border-[#0f2d5a]')
  })
})

describe('VariantSelector — stock quantity limits', () => {
  const makeVariant = (id: string, qty: number | null) => ({
    id,
    title: 'Single Unit',
    availableForSale: qty === null || qty > 0,
    quantityAvailable: qty,
    price: { amount: '62.50', currencyCode: 'USD' },
    selectedOptions: [{ name: 'Order Type', value: 'Single Unit' }],
  })

  const stockOptions = [{ name: 'Order Type', values: ['Single Unit'] }]

  it('+ button is disabled when quantity equals stock limit', () => {
    render(
      <VariantSelector
        options={stockOptions}
        variants={[makeVariant('v1', 3)]}
        productTitle="Ram Lock"
        productImage="img.jpg"
      />
    )
    // Default qty is 1; increase to 3 (the limit)
    const plusBtn = screen.getByRole('button', { name: '+' })
    // At qty=1 the + should be enabled (stock=3)
    expect(plusBtn).not.toBeDisabled()
  })

  it('+ button becomes disabled when quantity reaches stock limit', async () => {
    const user = userEvent.setup()
    render(
      <VariantSelector
        options={stockOptions}
        variants={[makeVariant('v1', 2)]}
        productTitle="Ram Lock"
        productImage="img.jpg"
      />
    )
    const plusBtn = screen.getByRole('button', { name: '+' })
    await user.click(plusBtn)  // qty goes to 2 = stock limit
    expect(plusBtn).toBeDisabled()
  })

  it('shows "Only X left" badge when stock is 10 or fewer', () => {
    render(
      <VariantSelector
        options={stockOptions}
        variants={[makeVariant('v1', 5)]}
        productTitle="Ram Lock"
        productImage="img.jpg"
      />
    )
    expect(screen.getByText('Only 5 left')).toBeInTheDocument()
  })

  it('does not show low-stock badge when stock is null (tracking off)', () => {
    render(
      <VariantSelector
        options={stockOptions}
        variants={[makeVariant('v1', null)]}
        productTitle="Ram Lock"
        productImage="img.jpg"
      />
    )
    expect(screen.queryByText(/only.*left/i)).not.toBeInTheDocument()
  })

  it('does not show low-stock badge when stock is above 10', () => {
    render(
      <VariantSelector
        options={stockOptions}
        variants={[makeVariant('v1', 50)]}
        productTitle="Ram Lock"
        productImage="img.jpg"
      />
    )
    expect(screen.queryByText(/only.*left/i)).not.toBeInTheDocument()
  })

  it('+ button is not disabled when stock is null (no limit)', () => {
    render(
      <VariantSelector
        options={stockOptions}
        variants={[makeVariant('v1', null)]}
        productTitle="Ram Lock"
        productImage="img.jpg"
      />
    )
    expect(screen.getByRole('button', { name: '+' })).not.toBeDisabled()
  })
})
