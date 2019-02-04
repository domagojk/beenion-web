import 'antd/dist/antd.css'
import './global.css'
import React from 'react'
import ReactDOM from 'react-dom'
import Store from './store/AppStore'
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
import { Login } from './auth/Login/Login'
import { Layout } from 'antd'
import { Register } from './auth/Register/Register'
import { ForgetPassword } from './auth/ForgotPassword/ForgotPassword'
import { IsLoggedIn } from './auth/IsLoggedIn/IsLoggedIn'
import { cognito } from './auth/cognitoApi'
import { Feed } from './Feed/Feed'
import { FollowingList } from './Following/FollowingList'

const { Content } = Layout

class App extends React.Component {
  state = {
    loggedIn: false
  }

  render() {
    return (
      <Router>
        <Store.Container>
          <Layout
            className="layout"
            style={{ minWidth: 300, background: '#f9f9f9' }}
          >
            <div style={{ textAlign: 'center', padding: 20 }}>
              <a href="/">
                <img
                  src={require('./assets/img/logo.png')}
                  width="100"
                  height="29"
                  alt="Beenion"
                />
              </a>
            </div>
            <Content style={{ padding: '0 50px' }}>
              <div
                style={{
                  margin: '50px auto 50px auto',
                  maxWidth: 600,
                  background: '#fff',
                  padding: 24,
                  minHeight: 410,
                  border: '1px solid #f3f3f3',
                  position: 'relative',
                  borderRadius: 6
                }}
              >
                <PrivateRoute exact path="/" component={Feed} />
                <PrivateRoute path="/tag/:tag" component={Feed} />
                <PrivateRoute path="/user/:user" component={Feed} />
                <PrivateRoute exact path="/follow" component={FollowingList} />
                <Route path="/login" component={Login} />
                <Route path="/forgotpassword" component={ForgetPassword} />
                <Route path="/register" component={Register} />
                <Route
                  path="/logout"
                  render={() => {
                    cognito.signOut()
                    window.location.replace('/login')
                    return null
                  }}
                />
              </div>
            </Content>
          </Layout>
        </Store.Container>
      </Router>
    )
  }
}

const PrivateRoute = ({ component: Component, ...rest }) => (
  <IsLoggedIn>
    {({ loggedIn, checkingLoggedIn }) => (
      <Route
        {...rest}
        render={props => {
          return checkingLoggedIn ? (
            <div />
          ) : loggedIn ? (
            <Component {...props} />
          ) : (
            <Redirect
              to={{
                pathname: '/login',
                state: { from: props.location }
              }}
            />
          )
        }}
      />
    )}
  </IsLoggedIn>
)

var mountNode = document.getElementById('root')
ReactDOM.render(<App />, mountNode)
