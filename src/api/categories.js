import { fetchJson } from './apiPrimitives'

export function getCategories() {
  return fetchJson('/api/v2/categories')
}
