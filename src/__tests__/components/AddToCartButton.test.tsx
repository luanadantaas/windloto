import React from 'react'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddToCartButton from '@/components/AddToCartButton'
import { useCartStore } from '@/lib/cartStore'

const defaultProps = {
  variantId: 'gid://shopify/ProductVariant/100',
  title: 'Ram Lock — Single Unit',
  price: 62.5,
  image: 'https://cdn.shopify.com/img1.jpg',
  availableForSale: true,
  quantity: 1,
}

describe('AddToCartButton', () => {
  beforeEach(() => {
    localStorage.clear()
    useCartStore.setState({ cart: [], shopifyCartId: null })
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders "Add to Cart" when availableForSale is true', () => {
    render(<AddToCartButton {...defaultProps} />)
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument()
  })

  it('shows disabled "Out of Stock" button when availableForSale is false', () => {
    render(<AddToCartButton {...defaultProps} availableForSale={false} />)
    const btn = screen.getByRole('button', { name: /out of stock/i })
    expect(btn).toBeDisabled()
  })

  it('adds the item to the cart store with correct data on click', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<AddToCartButton {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /add to cart/i }))
    const { cart } = useCartStore.getState()
    expect(cart).toHaveLength(1)
    expect(cart[0].variantId).toBe(defaultProps.variantId)
    expect(cart[0].price).toBe(defaultProps.price)
    expect(cart[0].quantity).toBe(defaultProps.quantity)
  })

  it('shows "✓ Added to Cart" after clicking', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<AddToCartButton {...defaultProps} />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveTextContent('✓ Added to Cart')
  })

  it('reverts to "Add to Cart" after 2000ms', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<AddToCartButton {...defaultProps} />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveTextContent('✓ Added to Cart')
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    expect(screen.getByRole('button')).toHaveTextContent('Add to Cart')
  })
})
