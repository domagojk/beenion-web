import React from 'react'
import renderProps from 'react-powerplug/src/utils/renderProps'
import Store, { StoreProps } from '../../store/AppStore'

class IsLoggedInUnwrapped extends React.Component {
  props: StoreProps

  render() {
    return renderProps(this.props, {
      loggedIn: this.props.store.get('loggedIn'),
      checkingLoggedIn: this.props.store.get('checkingLoggedIn')
    })
  }
}

export const IsLoggedIn = Store.withStore(IsLoggedInUnwrapped)
