import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductImageGallery from '@/components/ProductImageGallery'

const images = [
  { url: 'https://cdn.shopify.com/img1.jpg', altText: 'Image 1' },
  { url: 'https://cdn.shopify.com/img2.jpg', altText: 'Image 2' },
  { url: 'https://cdn.shopify.com/img3.jpg', altText: 'Image 3' },
]

describe('ProductImageGallery — single image', () => {
  it('does not render arrow buttons when there is only one image', () => {
    render(<ProductImageGallery images={[images[0]]} title="Test Product" />)
    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument()
  })

  it('does not render thumbnails when there is only one image', () => {
    render(<ProductImageGallery images={[images[0]]} title="Test Product" />)
    // No thumbnail buttons — only the main image area exists
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })
})

describe('ProductImageGallery — multiple images', () => {
  it('renders both arrow buttons', () => {
    render(<ProductImageGallery images={images} title="Test Product" />)
    expect(screen.getByLabelText('Previous image')).toBeInTheDocument()
    expect(screen.getByLabelText('Next image')).toBeInTheDocument()
  })

  it('renders one thumbnail button per image', () => {
    render(<ProductImageGallery images={images} title="Test Product" />)
    // The arrow buttons + thumbnail buttons total: 2 arrows + 3 thumbnails = 5
    // We check thumbnails specifically by counting buttons that are NOT the arrows
    const allButtons = screen.getAllByRole('button')
    const arrowButtons = allButtons.filter(
      (b) => b.getAttribute('aria-label') === 'Previous image' || b.getAttribute('aria-label') === 'Next image'
    )
    const thumbnailButtons = allButtons.filter((b) => !arrowButtons.includes(b))
    expect(thumbnailButtons).toHaveLength(images.length)
  })

  it('clicking "Next image" changes the main image to the 2nd image', async () => {
    const user = userEvent.setup()
    render(<ProductImageGallery images={images} title="Test Product" />)

    const mainImageContainer = document.querySelector('.aspect-square')!
    const mainImg = within(mainImageContainer as HTMLElement).getByRole('img')
    expect(mainImg).toHaveAttribute('src', images[0].url)

    await user.click(screen.getByLabelText('Next image'))

    const updatedImg = within(mainImageContainer as HTMLElement).getByRole('img')
    expect(updatedImg).toHaveAttribute('src', images[1].url)
  })

  it('clicking "Previous image" from index 0 wraps to the last image', async () => {
    const user = userEvent.setup()
    render(<ProductImageGallery images={images} title="Test Product" />)

    const mainImageContainer = document.querySelector('.aspect-square')!
    await user.click(screen.getByLabelText('Previous image'))

    const updatedImg = within(mainImageContainer as HTMLElement).getByRole('img')
    expect(updatedImg).toHaveAttribute('src', images[images.length - 1].url)
  })

  it('clicking a thumbnail changes the selected image', async () => {
    const user = userEvent.setup()
    render(<ProductImageGallery images={images} title="Test Product" />)

    const allButtons = screen.getAllByRole('button')
    const thumbnailButtons = allButtons.filter(
      (b) => !b.getAttribute('aria-label')?.includes('image')
    )

    // Click the 3rd thumbnail (index 2)
    await user.click(thumbnailButtons[2])

    const mainImageContainer = document.querySelector('.aspect-square')!
    const mainImg = within(mainImageContainer as HTMLElement).getByRole('img')
    expect(mainImg).toHaveAttribute('src', images[2].url)
  })

  it('the selected thumbnail has border-[#f97316] class; others do not', async () => {
    const user = userEvent.setup()
    render(<ProductImageGallery images={images} title="Test Product" />)

    const allButtons = screen.getAllByRole('button')
    const thumbnailButtons = allButtons.filter(
      (b) => !b.getAttribute('aria-label')?.includes('image')
    )

    // Initially first thumbnail is selected
    expect(thumbnailButtons[0].className).toContain('border-[#f97316]')
    expect(thumbnailButtons[1].className).not.toContain('border-[#f97316]')
    expect(thumbnailButtons[2].className).not.toContain('border-[#f97316]')

    // Click second thumbnail
    await user.click(thumbnailButtons[1])
    expect(thumbnailButtons[0].className).not.toContain('border-[#f97316]')
    expect(thumbnailButtons[1].className).toContain('border-[#f97316]')
  })
})
