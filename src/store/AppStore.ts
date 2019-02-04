import { createConnectedStore, Store, Effects } from 'undux'
import { effects } from './AppStoreEffects'

type State = {
  lastCommand: any,
  token: string,
  loggedIn: boolean,
  checkingLoggedIn: boolean,
  following: string[]
}
const initialState: State = {
  lastCommand: {},
  token: '',
  loggedIn: false,
  checkingLoggedIn: true,
  following: []
}

// Create & export a store with an initial value.
export default createConnectedStore(initialState, effects)

export type StoreProps = {
  store: Store<State>
}

export type StoreEffects = Effects<State>
