import { useCartStore } from '@/lib/cartStore'

const sampleItem = {
  variantId: 'gid://shopify/ProductVariant/100',
  title: 'Ram Lock — Single Unit',
  price: 62.5,
  image: 'https://cdn.shopify.com/img1.jpg',
  quantity: 1,
}

beforeEach(() => {
  localStorage.clear()
  useCartStore.setState({ cart: [], shopifyCartId: null })
})

describe('addToCart', () => {
  it('adds a new item when cart is empty', () => {
    useCartStore.getState().addToCart(sampleItem)
    const { cart } = useCartStore.getState()
    expect(cart).toHaveLength(1)
    expect(cart[0].variantId).toBe(sampleItem.variantId)
    expect(cart[0].quantity).toBe(1)
  })

  it('increments quantity when item with same variantId already exists', () => {
    useCartStore.getState().addToCart(sampleItem)
    useCartStore.getState().addToCart({ ...sampleItem, quantity: 2 })
    const { cart } = useCartStore.getState()
    expect(cart).toHaveLength(1)
    expect(cart[0].quantity).toBe(3)
  })
})

describe('removeFromCart', () => {
  it('removes the item by variantId', () => {
    useCartStore.getState().addToCart(sampleItem)
    useCartStore.getState().removeFromCart(sampleItem.variantId)
    expect(useCartStore.getState().cart).toHaveLength(0)
  })
})

describe('updateQuantity', () => {
  it('updates quantity when quantity > 0', () => {
    useCartStore.getState().addToCart(sampleItem)
    useCartStore.getState().updateQuantity(sampleItem.variantId, 5)
    const { cart } = useCartStore.getState()
    expect(cart[0].quantity).toBe(5)
  })

  it('removes the item when quantity === 0', () => {
    useCartStore.getState().addToCart(sampleItem)
    useCartStore.getState().updateQuantity(sampleItem.variantId, 0)
    expect(useCartStore.getState().cart).toHaveLength(0)
  })
})

describe('totalItems', () => {
  it('returns the sum of all quantities', () => {
    useCartStore.getState().addToCart({ ...sampleItem, quantity: 3 })
    useCartStore.getState().addToCart({
      ...sampleItem,
      variantId: 'gid://shopify/ProductVariant/101',
      quantity: 2,
    })
    expect(useCartStore.getState().totalItems()).toBe(5)
  })
})

describe('totalPrice', () => {
  it('returns the sum of price × quantity for all items', () => {
    useCartStore.getState().addToCart({ ...sampleItem, price: 10, quantity: 3 })
    useCartStore.getState().addToCart({
      ...sampleItem,
      variantId: 'gid://shopify/ProductVariant/101',
      price: 20,
      quantity: 2,
    })
    // 10*3 + 20*2 = 30 + 40 = 70
    expect(useCartStore.getState().totalPrice()).toBe(70)
  })
})

describe('clearCart', () => {
  it('empties the cart', () => {
    useCartStore.getState().addToCart(sampleItem)
    useCartStore.getState().clearCart()
    const { cart, shopifyCartId } = useCartStore.getState()
    expect(cart).toHaveLength(0)
    expect(shopifyCartId).toBeNull()
  })
})
