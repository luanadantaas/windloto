import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from '@/components/Header'
import { useCartStore } from '@/lib/cartStore'

// Mock next/link to render plain anchors so text is accessible
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

beforeEach(() => {
  localStorage.clear()
  useCartStore.setState({ cart: [], shopifyCartId: null })
})

describe('Header', () => {
  it('renders the WINDLOTO brand logo text', () => {
    render(<Header />)
    expect(screen.getByText('WIND')).toBeInTheDocument()
    expect(screen.getByText('LOTO')).toBeInTheDocument()
  })

  it('renders navigation links for main pages', () => {
    render(<Header />)
    expect(screen.getAllByRole('link', { name: /home/i }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByRole('link', { name: /ram lock/i }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByRole('link', { name: /rotor lock/i }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByRole('link', { name: /store/i }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByRole('link', { name: /contact us/i }).length).toBeGreaterThanOrEqual(1)
  })

  it('cart badge is NOT visible when cart is empty', async () => {
    render(<Header />)
    // Wait for mount (useEffect runs synchronously in act() within RTL)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
    // The badge only shows when totalItems > 0, so with empty cart there is no badge number
    const badge = document.querySelector('.bg-\\[\\#f97316\\].rounded-full.text-xs')
    expect(badge).toBeNull()
  })

  it('cart badge shows correct count when cart has items', async () => {
    useCartStore.setState({
      cart: [
        {
          variantId: 'gid://shopify/ProductVariant/100',
          title: 'Ram Lock',
          price: 62.5,
          image: '',
          quantity: 3,
          stockLimit: null,
        },
      ],
      shopifyCartId: null,
    })
    render(<Header />)
    // Two badges render: one in the desktop nav, one in the mobile controls area
    const badges = await screen.findAllByText('3')
    expect(badges.length).toBeGreaterThanOrEqual(1)
  })

  it('mobile nav is not visible initially', () => {
    render(<Header />)
    // The mobile nav is conditionally rendered (open === false means it's not in the DOM)
    // We check that the mobile nav container (md:hidden nav) is absent
    const mobileNavs = document.querySelectorAll('nav.lg\\:hidden')
    expect(mobileNavs).toHaveLength(0)
  })

  it('clicking the hamburger menu shows mobile nav links', async () => {
    const user = userEvent.setup()
    render(<Header />)
    await user.click(screen.getByRole('button', { name: /toggle menu/i }))
    const mobileNavs = document.querySelectorAll('nav.lg\\:hidden')
    expect(mobileNavs.length).toBeGreaterThan(0)
  })
})
