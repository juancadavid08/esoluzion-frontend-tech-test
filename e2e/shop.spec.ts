import { expect, test, type Page } from '@playwright/test'

const products = [
  {
    id: '1',
    brand: 'Acer',
    model: 'Alpha',
    price: 100,
    imgUrl: 'https://img.test/1.png'
  },
  {
    id: '2',
    brand: 'Samsung',
    model: 'Galaxy',
    price: 200,
    imgUrl: 'https://img.test/2.png'
  }
]
const detail = {
  ...products[0],
  cpu: 'X1',
  ram: '8 GB',
  os: 'Android',
  options: {
    colors: [
      { code: 10, name: 'Negro' },
      { code: 11, name: 'Azul' }
    ],
    storages: [{ code: 20, name: '128 GB' }]
  }
}

async function mockApi(page: Page) {
  await page.route('**/api/product', (route) =>
    route.fulfill({ json: products })
  )
  await page.route('**/api/product/1', (route) =>
    route.fulfill({ json: detail })
  )
  await page.route('**/api/cart', async (route) =>
    route.fulfill({ json: { count: 3 } })
  )
  await page.route('https://img.test/**', (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: '' })
  )
}

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test('shows products and functional breadcrumb', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Productos' })).toBeVisible()
  await expect(page.getByText('Acer Alpha')).toBeVisible()
  await expect(page.getByLabel('Migas de pan')).toContainText('InicioProductos')
})

test('filters products in real time', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('searchbox').fill('Samsung')
  await expect(page.getByText('Samsung Galaxy')).toBeVisible()
  await expect(page.getByText('Acer Alpha')).toBeHidden()
})

test('shows and clears an empty search', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('searchbox').fill('Nokia')
  await expect(
    page.getByRole('heading', { name: 'Sin resultados' })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Limpiar búsqueda' }).click()
  await expect(page.getByText('Acer Alpha')).toBeVisible()
})

test('navigates to detail and updates breadcrumb', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Acer Alpha').click()
  await expect(page).toHaveURL(/product\/1/)
  await expect(page.getByRole('heading', { name: 'Acer Alpha' })).toBeVisible()
  await expect(page.getByLabel('Migas de pan')).toContainText('Detalle')
})

test('sends selected options and updates cart from server', async ({
  page
}) => {
  let payload: unknown
  await page.route('**/api/cart', async (route) => {
    payload = route.request().postDataJSON()
    await route.fulfill({ json: { count: 3 } })
  })
  await page.goto('/product/1')
  await page.getByLabel('Color').selectOption('11')
  await page.getByRole('button', { name: 'Añadir al carrito' }).click()
  await expect(page.getByLabel('3 productos en el carrito')).toBeVisible()
  expect(payload).toEqual({ id: '1', colorCode: 11, storageCode: 20 })
})

test('shows retry state when list API fails', async ({ page }) => {
  await page.route('**/api/product', (route) =>
    route.fulfill({ status: 500, json: {} })
  )
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'No pudimos cargar los productos' })
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible()
})

test('persists cart count after reload', async ({ page }) => {
  await page.goto('/product/1')
  await page.getByRole('button', { name: 'Añadir al carrito' }).click()
  await page.reload()
  await expect(page.getByLabel('3 productos en el carrito')).toBeVisible()
})
