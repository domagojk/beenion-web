import {
  CognitoUserPool,
  CognitoUserAttribute,
  AuthenticationDetails,
  CognitoUser
} from 'amazon-cognito-identity-js'
import { chromeId, clientId, userPoolId } from '../config'

type UserData = {
  email: string
  token: string
}

export class CognitoAPI {
  userPool: any
  constructor({ userPoolId, clientId }) {
    this.userPool = new CognitoUserPool({
      UserPoolId: userPoolId,
      ClientId: clientId
    })
  }
  getUserData(session) {
    let email = ''
    try {
      email = session.idToken.payload.email
    } catch (err) {
      console.error(err)
    }
    return Object.assign({}, session, {
      email,
      token: session.getIdToken().getJwtToken()
    })
  }
  sessionLogin(): Promise<UserData> {
    return new Promise((resolve, reject) => {
      const cognitoUser = this.userPool.getCurrentUser()
      if (!cognitoUser) {
        return reject({ message: 'no session' })
      }
      cognitoUser.getSession((err, session) => {
        if (err) {
          return reject(err)
        }
        if (!session.isValid()) {
          return reject({ message: 'invalid session' })
        }
        if (window['chrome'] && window['chrome'].runtime) {
          window['chrome'].runtime.sendMessage(
            chromeId,
            this.getUserData(session)
          )
        }
        return resolve(this.getUserData(session))
      })
    })
  }
  signIn(username: string, password: string, newPassword?: string) {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: username,
        Password: password
      })
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: this.userPool
      })
      const authCallbacks = {
        onSuccess: result => resolve(this.getUserData(result)),
        newPasswordRequired: userAttributes => {
          // User was signed up by an admin and must provide new
          // password and required attributes, if any, to complete
          // authentication.
          // the api doesn't accept this field back
          delete userAttributes.email_verified
          if (!newPassword) {
            return reject({
              newPassword: true,
              message: 'must create new password'
            })
          }
          cognitoUser.completeNewPasswordChallenge(
            newPassword,
            userAttributes,
            authCallbacks
          )
        },
        onFailure: err => reject(err)
      }
      cognitoUser.authenticateUser(authenticationDetails, authCallbacks)
    })
  }
  forgotPassword({ username }): Promise<any> {
    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: this.userPool
    })
    return new Promise((resolve, reject) => {
      cognitoUser.forgotPassword({
        onSuccess: function(data) {
          resolve(data)
        },
        onFailure: function(err) {
          reject(err)
        },
        inputVerificationCode: function(data) {
          resolve(data)
        }
        //Optional automatic callback
        /*inputVerificationCode: function(data) {
                  console.log('Code sent to: ' + data)
                  var verificationCode = prompt('Please input verification code ', '')
                  var newPassword = prompt('Enter new password ', '')
                  cognitoUser.confirmPassword(verificationCode, newPassword, {
                    onSuccess() {
                      console.log('Password confirmed!')
                    },
                    onFailure(err) {
                      console.log('Password not confirmed!')
                    }
                  })
                }*/
      })
    })
  }
  confirmPassword({ username, verificationCode, newPassword }) {
    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: this.userPool
    })
    return new Promise((resolve, reject) => {
      cognitoUser.confirmPassword(verificationCode, newPassword, {
        onSuccess() {
          resolve()
        },
        onFailure(err) {
          reject(err)
        }
      })
    })
  }
  signUp({ email, password, name, username }): Promise<any> {
    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({
          Name: 'email',
          Value: email
        }),
        new CognitoUserAttribute({
          Name: 'name',
          Value: name
        })
      ]
      const validationData = []
      this.userPool.signUp(
        username,
        password,
        attributeList,
        validationData,
        (err, result) => {
          if (err || !result) {
            return reject(err)
          }
          if (result.userConfirmed === false) {
            return resolve({
              userConfirmed: result.userConfirmed
            })
          }
          return resolve(this.getUserData(result))
        }
      )
    })
  }
  confirmRegistration(email, password, code) {
    return new Promise((resolve, reject) => {
      const userData = {
        Username: email,
        Pool: this.userPool
      }
      const cognitoUser = new CognitoUser(userData)
      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err)
          return
        }
        this.signIn(email, password)
          .then(resolve)
          .catch(reject)
      })
    })
  }
  signOut() {
    const cognitoUser = this.userPool.getCurrentUser()
    if (!cognitoUser) {
      return null
    }
    if (window['chrome'] && window['chrome'].runtime) {
      window['chrome'].runtime.sendMessage(chromeId, {
        type: 'logout'
      })
    }
    return cognitoUser.signOut()
  }
}
export const cognito = new CognitoAPI({
  clientId,
  userPoolId
})
