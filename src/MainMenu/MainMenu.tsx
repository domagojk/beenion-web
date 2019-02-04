import React from 'react'
import { Link } from 'react-router-dom'
import { Breadcrumb } from 'antd'
import { IsLoggedIn } from '../auth/IsLoggedIn/IsLoggedIn'
import './mainmenu.css'
import { extensionUrl } from '../config'

const LoggedInMainMenu = ({ route }) => (
  <Breadcrumb className="mainmenu" separator="|">
    <Breadcrumb.Item>
      {route === 'feed' ? 'feed' : <Link to="/">feed</Link>}
    </Breadcrumb.Item>
    <Breadcrumb.Item>
      {route === 'follow' ? 'follow' : <Link to="/follow">follow</Link>}
    </Breadcrumb.Item>
    <Breadcrumb.Item>
      <a href={extensionUrl} rel="noopener noreferrer" target="_blank">
        download
      </a>
    </Breadcrumb.Item>
    <Breadcrumb.Item>
      <Link to="/logout">logout</Link>
    </Breadcrumb.Item>
  </Breadcrumb>
)

const LoggedOutMainMenu = ({ route }) => (
  <Breadcrumb separator="|" className="mainmenu">
    <Breadcrumb.Item>
      {route === 'login' ? null : <Link to="/login">login</Link>}
    </Breadcrumb.Item>
  </Breadcrumb>
)

export const MainMenu = ({ route }) => (
  <div>
    <IsLoggedIn>
      {({ loggedIn }) =>
        loggedIn ? (
          <LoggedInMainMenu route={route} />
        ) : (
          <LoggedOutMainMenu route={route} />
        )
      }
    </IsLoggedIn>
  </div>
)
