import bodyParser from 'body-parser'
import cors from 'cors'
import expressValidator from 'express-validator'
import errorHandler from './config/errorHandler'
import conf from './config'
import jwt from 'jsonwebtoken'

let checkToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'] // Express headers are auto converted to lowercase
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length)
  }
  if (token) {
    jwt.verify(token, conf.secretKey, (err, decoded) => {
      if (err) {
        return res.json({
          success: false,
          message: 'Token is not valid'
        })
      } else {
        req.decoded = decoded.username
        next()
      }
    })
  } else {
    return res.json({
      success: false,
      message: 'Auth token is not supplied'
    })
  }
}

const setupRoutes = function (app) {
  app.use(`/${conf.apiName}/login`, require('./api/login/login.controller'))
  app.use(`/${conf.apiName}/register`, require('./api/register/register.controller'))
  app.use(`/${conf.apiName}/checkToken`, checkToken, require('./api/checkToken/checkToken.controller'))
  app.use(`/${conf.apiName}/messages`, checkToken, require('./api/messages/messages.controller'))
  app.use(`/${conf.apiName}/setting_account`, checkToken, require('./api/setting_account/setting_account.controller'))
  app.use(`/${conf.apiName}/files-apk`, checkToken, require('./api/files-apk/files-apk.controller'))
  app.ws(`/${conf.apiName}/socket/messages/:token`, require('./ws'))
}

const invalidRoute = (app) => {
  app.use((req, res, next) => {
    const error = new Error()
    error.message = 'Invalid route'
    error.status = 404
    next(error)
  })
}

export default function (app) {
  app.use(cors())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())

  app.use(expressValidator({
    customValidators: {
      isArray: function (value) {
        return Array.isArray(value)
      },
      arrayNotEmpty: function (array) {
        return array.length > 0
      }
    }
  }))

  setupRoutes(app)
  invalidRoute(app)
  app.use(errorHandler)
}
