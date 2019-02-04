import React from 'react'
import { Form, Input, Checkbox, Button } from 'antd'
import { Link } from 'react-router-dom'
import { cognito } from '../cognitoApi'
import { MainMenu } from '../../MainMenu/MainMenu'
import { FormComponentProps } from 'antd/lib/form'

const FormItem = Form.Item

class RegistrationForm extends React.Component {
  props: FormComponentProps

  state = {
    confirmDirty: false,
    errorMessage: '',
    success: false
  }

  handleSubmit = e => {
    e.preventDefault()

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return false
      }
      return cognito
        .signUp(values)
        .then(data => {
          if (data.userConfirmed === false) {
            this.setState({
              success: true
            })
          } else {
            window.location.replace('/')
          }
        })
        .catch(err => {
          this.setState({
            errorMessage: err.message
          })
        })
    })
  }

  handleConfirmBlur = e => {
    const value = e.target.value
    this.setState({ confirmDirty: this.state.confirmDirty || !!value })
  }

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!')
    } else {
      callback()
    }
  }

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true })
    }
    callback()
  }

  validateUsername = (rule, value, callback) => {
    if (/^[0-9a-zA-Z_.-]+$/.test(value)) {
      callback()
    } else {
      callback('invalid username')
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    }
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0
        },
        sm: {
          span: 16,
          offset: 8
        }
      }
    }

    return (
      <div>
        <MainMenu route="register" />
        {this.state.success ? (
          <p>
            Verification link is sent to provided email address. Once confirmed,
            you can <Link to="/login">login</Link>.
          </p>
        ) : (
          <div>
            <Form onSubmit={this.handleSubmit}>
              <FormItem {...formItemLayout} label="E-mail">
                {getFieldDecorator('email', {
                  rules: [
                    {
                      type: 'email',
                      message: 'The input is not valid E-mail!'
                    },
                    {
                      required: true,
                      message: 'Please input your E-mail!'
                    }
                  ]
                })(<Input />)}
              </FormItem>
              <FormItem {...formItemLayout} label="Password">
                {getFieldDecorator('password', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your password!'
                    },
                    {
                      validator: this.validateToNextPassword
                    }
                  ]
                })(<Input type="password" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="Confirm Password">
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
                })(<Input type="password" onBlur={this.handleConfirmBlur} />)}
              </FormItem>
              <FormItem {...formItemLayout} label={<span>Username</span>}>
                {getFieldDecorator('username', {
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
                })(<Input />)}
              </FormItem>

              <FormItem {...tailFormItemLayout}>
                {getFieldDecorator('agreement', {
                  valuePropName: 'checked',
                  rules: [
                    {
                      required: true,
                      message: 'You must agree to terms before registering'
                    }
                  ]
                })(
                  <Checkbox>
                    I have read the <a href="#test">agreement</a>
                  </Checkbox>
                )}
              </FormItem>

              {this.state.errorMessage && <p>{this.state.errorMessage}</p>}
              <FormItem {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit">
                  Register
                </Button>
              </FormItem>
            </Form>
          </div>
        )}
      </div>
    )
  }
}

export const Register = Form.create()(RegistrationForm)
