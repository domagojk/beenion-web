import React from 'react'
import { Form, Icon, Input, Button } from 'antd'
import { MainMenu } from '../../MainMenu/MainMenu'
import { cognito } from '../cognitoApi'
import { FormComponentProps } from 'antd/lib/form'
import '../login.css'

const FormItem = Form.Item

class NormalForgetPassword extends React.Component {
  props: FormComponentProps

  state = {
    username: '',
    step: 0,
    showUsernameInput: true,
    showCodeInput: false,
    showNewPasswordInput: false,
    errorMessage: '',
    successMessage: ''
  }

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!')
    } else {
      callback()
    }
  }

  validateUsername = (rule, value, callback) => {
    if (/^[0-9a-zA-Z_.-]+$/.test(value)) {
      callback()
    } else {
      callback('invalid username')
    }
  }

  handleSubmit = e => {
    e.preventDefault()

    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (this.state.step === 0) {
          return cognito
            .forgotPassword({ username: values.userName })
            .then(data => {
              this.setState({
                step: 1,
                username: values.userName,
                showUsernameInput: false,
                showCodeInput: true,
                showNewPasswordInput: true,
                errorMessage: '',
                successMessage: `Verification code sent to: ${
                  data.CodeDeliveryDetails.Destination
                }`
              })
            })
            .catch(err => {
              if (err.code === 'UserNotFoundException') {
                this.setState({
                  errorMessage: 'User not found',
                  successMessage: ''
                })
              } else {
                this.setState({
                  errorMessage: err.message
                })
              }
            })
        } else if (this.state.step === 1) {
          return cognito
            .confirmPassword({
              username: this.state.username,
              verificationCode: values.code,
              newPassword: values.password
            })
            .then(data => {
              this.setState({
                step: 2,
                showUsernameInput: false,
                showCodeInput: false,
                showNewPasswordInput: false,
                errorMessage: '',
                successMessage: 'Password changed. You may now log in.'
              })
            })
            .catch(err => {
              this.setState({
                errorMessage: err.message
              })
            })
        }
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    return (
      <div>
        <MainMenu route="forgot" />
        <Form onSubmit={this.handleSubmit} className="login-form">
          {this.state.successMessage && <p>{this.state.successMessage}</p>}
          {this.state.showUsernameInput && (
            <FormItem>
              {getFieldDecorator('userName', {
                rules: [
                  {
                    required: true,
                    message: 'Please input your username!',
                    whitespace: false
                  },
                  {
                    validator: this.validateUsername
                  }
                ]
              })(
                <Input
                  prefix={
                    <Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />
                  }
                  placeholder="Username"
                />
              )}
            </FormItem>
          )}
          {this.state.showCodeInput && (
            <FormItem>
              {getFieldDecorator('code', {
                rules: [{ required: true, message: 'Please input your code!' }]
              })(<Input placeholder="code" />)}
            </FormItem>
          )}
          {this.state.showNewPasswordInput && (
            <FormItem>
              {getFieldDecorator('password', {
                rules: [
                  { required: true, message: 'Please input your Password!' }
                ]
              })(
                <Input
                  prefix={
                    <Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />
                  }
                  type="password"
                  placeholder="New password"
                />
              )}
            </FormItem>
          )}
          {this.state.showNewPasswordInput && (
            <FormItem>
              {getFieldDecorator('confirm', {
                rules: [
                  {
                    required: true,
                    message: 'Please confirm your password!'
                  },
                  {
                    validator: this.compareToFirstPassword
                  }
                ]
              })(
                <Input
                  type="password"
                  placeholder="Confirm password"
                  prefix={
                    <Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />
                  }
                />
              )}
            </FormItem>
          )}
          {this.state.errorMessage && <p>{this.state.errorMessage}</p>}

          {this.state.step === 2 ? (
            <a href="/login">Log in</a>
          ) : (
            <FormItem>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
              >
                Submit
              </Button>
            </FormItem>
          )}
        </Form>
      </div>
    )
  }
}

export const ForgetPassword = Form.create()(NormalForgetPassword)
