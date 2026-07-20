import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProductItem from '../components/ProductItem'

test('renders product info and link', () => {
  render(
    <MemoryRouter>
      <ProductItem product={{ id: '11', brand: 'Apple', model: 'iPhone', price: 999 }} />
    </MemoryRouter>
  )

  const label = screen.getByText('Apple iPhone')
  expect(label).toBeTruthy()

  const price = screen.getByText('999 €')
  expect(price).toBeTruthy()

  const anchor = screen.getByRole('link') as HTMLAnchorElement
  expect(anchor.getAttribute('href')).toBe('/product/11')
})

test('renders fallback values when image and price are missing', () => {
  render(
    <MemoryRouter>
      <ProductItem product={{ id: '12', brand: 'Moto', model: 'G' }} />
    </MemoryRouter>
  )

  expect(screen.getByText('No image')).toBeTruthy()
  expect(screen.getByText('—')).toBeTruthy()
})
