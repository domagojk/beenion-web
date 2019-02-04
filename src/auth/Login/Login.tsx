import React from 'react'
import { Form, Icon, Input, Button, Spin } from 'antd'
import { cognito } from '../cognitoApi'
import { MainMenu } from '../../MainMenu/MainMenu'
import { Link, Redirect, RouteComponentProps } from 'react-router-dom'
import { IsLoggedIn } from '../IsLoggedIn/IsLoggedIn'
import { extensionUrl } from '../../config'
import { FormComponentProps } from 'antd/lib/form'
import '../login.css'

const FormItem = Form.Item

class NormalLoginForm extends React.Component {
  props: FormComponentProps & RouteComponentProps

  state = {
    errorMessage: ''
  }

  handleSubmit = e => {
    e.preventDefault()

    this.props.form.validateFields((err, values) => {
      if (!err) {
        cognito
          .signIn(values.userName, values.password)
          .then(() => {
            window.location.replace('/')
          })
          .catch(err => {
            this.setState({
              errorMessage: err.message
            })
          })
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { from } = this.props.location.state || { from: { pathname: '/' } }

    return (
      <IsLoggedIn>
        {({ loggedIn, checkingLoggedIn }) =>
          checkingLoggedIn ? (
            <Spin className="login-form-spin" />
          ) : loggedIn ? (
            <Redirect to={from} />
          ) : (
            <div className="loginpage">
              <MainMenu route="login" />
              <a
                className="downloadlink"
                href={extensionUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icon type="chrome" />
                <span>Download chrome extension</span>
              </a>
              <Form onSubmit={this.handleSubmit} className="login-form">
                <FormItem>
                  {getFieldDecorator('userName', {
                    rules: [
                      { required: true, message: 'Please input your username!' }
                    ]
                  })(
                    <Input
                      prefix={
                        <Icon
                          type="user"
                          style={{ color: 'rgba(0,0,0,.25)' }}
                        />
                      }
                      placeholder="Username or Email"
                    />
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('password', {
                    rules: [
                      { required: true, message: 'Please input your Password!' }
                    ]
                  })(
                    <Input
                      prefix={
                        <Icon
                          type="lock"
                          style={{ color: 'rgba(0,0,0,.25)' }}
                        />
                      }
                      type="password"
                      placeholder="Password"
                    />
                  )}
                </FormItem>
                <FormItem>
                  <Link className="login-form-forgot" to="/forgotpassword">
                    Forgot password?
                  </Link>
                  {this.state.errorMessage && <p>{this.state.errorMessage}</p>}
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-form-button"
                  >
                    Log in
                  </Button>
                  Or <Link to="/register">register now!</Link>
                </FormItem>
              </Form>
            </div>
          )
        }
      </IsLoggedIn>
    )
  }
}

export const Login = Form.create()(NormalLoginForm)
