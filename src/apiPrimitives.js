import cachedFetch from './cachedFetch'

export const METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
}

// NB the functions that return fetchJson return a promise!
/**
 *
 * @param {string} url
 * @param {object} options
 * @param {string} [options.method] 'GET'(default) or 'DELETE'
 * @param {array<string>} [options.attachHeaders] attach headers, by name, to the result
 *    (as property `_headers`, array)
 * @param {boolean} [options.ignoreCache] Whether should skip local caching. Default: false
 * @returns {Promise<object>}
 */
export async function fetchJson(url, options = {}) {
  // compile options from defaults and given arg:
  const method = options.method || METHODS.GET
  const chosenFetch = options.ignoreCache ? fetch : cachedFetch
  const attachHeaders = options.attachHeaders || []

  const response = await chosenFetch(url, {
    method,
    credentials: 'same-origin',
  })

  let result
  try {
    result = await response.json()
    // eslint-disable-next-line no-underscore-dangle
    result._headers = attachHeaders.reduce(
      (accumulator, headerName) => ({
        ...accumulator,
        [headerName]: response.headers.get(headerName),
      }),
      {}
    )
  } catch (e) {
    // an empty response message would produce such an error, but it's fine :)
    if (e.name === 'SyntaxError') {
      return {}
    }
    throw e
  }

  if (!response.ok) {
    throw Error(result.message)
  }

  return result
}

/** Post data, formatted for any of the API versions (1 or 2)
 * @param {string} url
 * @param {object} data We'll post these key/value pairs
 * @param {string} [method] 'POST' (default), 'PATCH' or PUT'
 * @param {boolean} [isJsonFormat] In real life, it should always be true!!
 *   But if it's false, we'll use FormData. It was tiny a feature that, once implemented,
 *   was worth keeping... who knows :)
 * @param {string} [resultFormat] 'json' (extract json) , 'text' (extract text)
 *   or 'raw' (entire result)
 * @return {Promise<string>} resolves to json
 */
export async function postData({
  url,
  data,
  method = METHODS.POST,
  isJsonFormat = true,
  resultFormat = 'json',
}) {
  const signedData = {
    ...data,
    // @see https://open.vanillaforums.com/discussion/20710/the-transient-key-how-does-one-make-use-of-it
    // The Transient Key is used as a measure against "Cross-Site Request Forgery"
    // (CSRF). What the Transient Key does, is provide a session- and user-specific
    // access token that must be supplied with each form submission.
    TransientKey: gdn.getMeta('TransientKey') /* global gdn */,
  }
  let payload
  if (isJsonFormat) {
    payload = JSON.stringify(signedData)
  } else {
    payload = new FormData()
    Object.keys(signedData).forEach(key => payload.append(key, signedData[key]))
  }
  try {
    const result = await fetch(url, {
      method,
      body: payload,
      credentials: 'same-origin',
      headers: {
        'content-type': 'application/json',
      },
    })
    if (resultFormat === 'json') return result.json()
    if (resultFormat === 'text') return result.text()
    return result
  } catch (err) {
    console.error(`POST error to ${url}: ${err}`)
    throw err
  }
}
