import React from 'react'
import { render } from 'react-dom'

export const injectComponentsInDom = components => {
  // render the react components in the dom elements with the homonyme data-react-component
  document.querySelectorAll('[data-react-component]').forEach(element => {
    const componentName = element.getAttribute('data-react-component')
    const Component = components[componentName]
    if (!Component) {
      return
    }

    const props = {}
    for (let i = 0; i < element.attributes.length; i++) {
      // eslint-disable-line no-plusplus
      const attr = element.attributes[i]
      if (attr.name.substr(0, 20) === 'data-react-property-') {
        const propNameWDashes = attr.name.substr(20)
        const propName = propNameWDashes.replace(
          // camelCase
          /-([a-z])/g,
          grp => grp[1].toUpperCase()
        )
        props[propName] = attr.value
      }
    }
    render(<Component {...props} originalInnerHTML={element.innerHTML} />, element)
  })
}
