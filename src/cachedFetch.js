// the cache will be used only in the context of this page refresh!
// (avoiding complications related to authentication)
const cache = {} // the urls are object's keys

// Avoid making multiple requests in parallel - this object contains entries (for each url):
// Each entry contains a fetch request and an array of listeners
// The listeners return promises which will be resolved when the fetch is complete (or rejected)
const requestsInProgress = {} // the urls are object's keys

// simulate a response from a given value (so we can read the response body multiple times)
const buildResponseFromValue = (url, value) =>
  Promise.resolve({
    ok: true,
    url,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve(JSON.parse(value)),
    text: () => Promise.resolve(value),
  })

export default function cachedFetch(url, options = {}) {
  // return plain fetch for non-GET requests
  if (options.method && options.method !== 'GET') {
    return fetch(url, options)
  }

  const cachedData = cache[url]
  if (cachedData) {
    return buildResponseFromValue(url, cachedData)
  }

  const getCurrentRequest = () => requestsInProgress[url]

  requestsInProgress[url] = getCurrentRequest() || {
    fetchRequest: fetch(url, options)
      .then(response => response.text())
      .then(value => {
        cache[url] = value
        // resolve all promises in listeners
        getCurrentRequest().listeners.forEach(({ resolve }) =>
          resolve(buildResponseFromValue(url, value))
        )
      })
      .catch(err => getCurrentRequest().listeners.forEach(({ reject }) => reject(err))),
    listeners: [],
  }

  return new Promise((resolve, reject) => {
    // nb: the promise is resolved in the fetch resolver (above)
    getCurrentRequest().listeners.push({ resolve, reject })
  })
}
