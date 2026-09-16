import { resolveShopifyHandle, resolveUrlHandle } from '@/lib/productHandleMap'

describe('resolveShopifyHandle', () => {
  it('maps ram-lock to ram-locking-device', () => {
    expect(resolveShopifyHandle('ram-lock')).toBe('ram-locking-device')
  })

  it('returns identity for rotor-lock (mapped to itself)', () => {
    expect(resolveShopifyHandle('rotor-lock')).toBe('rotor-lock')
  })

  it('returns the input unchanged for unknown handles', () => {
    expect(resolveShopifyHandle('unknown')).toBe('unknown')
  })
})

describe('resolveUrlHandle', () => {
  it('maps ram-locking-device back to ram-lock', () => {
    expect(resolveUrlHandle('ram-locking-device')).toBe('ram-lock')
  })

  it('returns identity for rotor-lock', () => {
    expect(resolveUrlHandle('rotor-lock')).toBe('rotor-lock')
  })

  it('returns the input unchanged for unknown Shopify handles', () => {
    expect(resolveUrlHandle('unknown-shopify-handle')).toBe('unknown-shopify-handle')
  })
})
