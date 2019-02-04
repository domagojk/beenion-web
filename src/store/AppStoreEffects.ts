import { cognito } from '../auth/cognitoApi'
import { StoreEffects } from './AppStore'

export const effects: StoreEffects = store => {
  const getUserData = () =>
    fetch('https://api.beenion.com/v1/getUserData', {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${store.get('token')}`
      }
    })
      .then(response => response.json())
      .then(res => {
        store.set('following')(res.following)
      })

  const invokeUserCommand = command =>
    fetch('https://api.beenion.com/v1/userCommand', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${store.get('token')}`
      },
      body: JSON.stringify(command)
    })

  store.on('lastCommand').subscribe(command => {
    switch (command.type) {
      case 'follow':
      case 'unfollow': {
        return invokeUserCommand(command).then(getUserData)
      }
      default: {
        return null
      }
    }
  })

  cognito
    .sessionLogin()
    .then(userData => {
      store.set('token')(userData.token)
      store.set('loggedIn')(true)
      store.set('checkingLoggedIn')(false)
    })
    .then(getUserData)
    .catch(err => {
      store.set('loggedIn')(false)
      store.set('checkingLoggedIn')(false)
    })

  return store
}
