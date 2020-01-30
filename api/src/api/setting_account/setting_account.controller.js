import express from 'express'
import bcrypt from 'bcrypt'
import loadDB from '../../config/db'
import log4js from 'log4js'
const logErr = log4js.getLogger('error')

const router = express.Router()

const setting_account_get = async (req, res, next) => {
  try {
    const { id } = req.decoded
    const db = await loadDB()
    await db.query(`SELECT username, name, role, status FROM users WHERE id = ${id}`, (err, results) => {
      if (err) throw err
      return res.json(results)
    })
  } catch (e) {
    logErr.error(e)
    return res
  }
}

const setting_account_set = async (req, res, next) => {
  try {
    const { user, password } = req.body
    const { id } = req.decoded
    const db = await loadDB()
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds).then(hash => hash)
    await db.query(`UPDATE users SET name='${name}', password='${hash}' WHERE id = ${id}`, (err, results) => {
      if (err) throw err
      return res.json(results)
    })
  } catch (e) {
    logErr.error(e)
    return res
  }
}

router.get('/', setting_account_get)
router.post('/', setting_account_set)
module.exports = router
