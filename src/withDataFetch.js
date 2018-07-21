import React, { Component, PureComponent } from 'react'
import 'whatwg-fetch'

const cachedResponses = {}

export function withDataFetch({
  url,
  isImpure = false,
  isHtml = false,
}) {
  const BaseComponent = isImpure ? Component : PureComponent

  return WrappedComponent =>
    class Container extends BaseComponent {
      static displayName = `withDataFetch(${WrappedComponent.displayName ||
        WrappedComponent.name ||
        'Component'})`

      state = {
        data: null,
      }

      componentWillMount = async () => {
        // FIXME: caching not working well for concurent calls (both calls are made)
        if (cachedResponses[url]) {
          this.setState({ data: cachedResponses[url] })
          return
        }
        // console.log(`Fetching ${url}`)
        // const headers = new Headers()
        // headers.append('pragma', 'no-cache')
        // headers.append('cache-control', 'max-age=600')
        const result = await fetch(url, {
          credentials: 'same-origin',
          // method: 'GET',
          // headers,
          // cache: 'force-cache',
        })
        const data = isHtml ? await result.text() : await result.json()
        cachedResponses[url] = data
        this.setState({ data })
      }

      render() {
        return this.state.data ? (
          <WrappedComponent {...this.props} {...this.state.data} />
        ) : null
      }
    }
}
