export interface ProductOption {
  code: number
  name: string
}

export interface Product {
  id: number | string
  brand?: string
  model?: string
  price?: number | string
  imgUrl?: string
  options?: { colors?: ProductOption[]; storages?: ProductOption[] }
  cpu?: string
  ram?: string
  os?: string
  display?: string
  displayResolution?: string
  battery?: string
  camera?: string
  primaryCamera?: string[]
  secondaryCmera?: string[]
  dimension?: string
  dimentions?: string
  weight?: string
}

export interface CartSelection {
  id: string | number
  colorCode: number
  storageCode: number
}
