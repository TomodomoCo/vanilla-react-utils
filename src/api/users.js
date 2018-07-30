import { fetchJson } from './apiPrimitives'

const { URL_TOMODOMO_API } = window.tomodomo.config

// uses an endpoint from API v1, but returns data compatible to API v2
export function getProfile() {
  return fetchJson('/profile.json').then(userData => {
    const p = userData.Profile
    return {
      userID: p.UserID,
      name: p.Name,
      photoUrl: p.Photo,
    }
  })
}

/**
 *  @see getModAccessOnActivities() for usage
 * @returns permissions of a user over a set of actions in a certain scope a format like
 * { 'comments.delete': true, 'discussions.manage': false }
 */
export async function getUserAccess(userId, scopedPermissions) {
  const permissionQuery = Object.keys(scopedPermissions)
    .map(permName => `capability[${permName}]=${scopedPermissions[permName]}`)
    .join('&')
  const permissionsJson = await fetchJson(
    `${URL_TOMODOMO_API}capabilitycheck/${userId}?${permissionQuery}`
  )
  return permissionsJson.reduce((accu, { name, status }) => ({ ...accu, [name]: status }), {})
}

export const tagSearch = (search, limit = 10) => (
  fetchJson(`/user/tagsearch?q=${search}&limit=${limit}`)
)
