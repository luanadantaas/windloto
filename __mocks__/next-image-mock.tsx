import React from 'react'

interface ImageProps {
  src: string
  alt: string
  fill?: boolean
  priority?: boolean
  [key: string]: unknown
}

const MockImage = ({ src, alt, fill, priority, ...props }: ImageProps) => (
  <img src={src} alt={alt} {...props} />
)
export default MockImage
