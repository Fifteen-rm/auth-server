import {profiles} from './models/model.js'
import { promisify } from 'util'
import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import jwt from 'jsonwebtoken';
import redis from 'redis'

const app = express()
var rediscl = redis.createClient();
rediscl.on("connect",  () => {
    console.log("Redis plugged in.");
});

app.use(express.json())
 
const getAsync = promisify(rediscl.get).bind(rediscl)


app.post('/token', async function(req, res) {
  const refreshToken = req.body.token
  jwt.verify(refreshToken, process.env.SECRET_REFRESH_TOKEN, (err, user) => {
    if (err) 
      return res.sendStatus(403)

    const accessToken = generateAccessToken({ name: user.name })

    res.json({ accessToken: accessToken })
  })
})


// TO DO : refactor using async await  | by kimkihyuk
// TO DO : Implement black list | by kimkihyuk
app.delete('/logout', (req, res) => {
  jwt.verify(req.body.token, process.env.SECRET_REFRESH_TOKEN, (err, user) => {
    console.log('[logout] user is ', user)
    if (err)
      return res.send(403, {response: `invalid token`})

    rediscl.del(user.name, console.log)

    res.sendStatus(204)
  })
})

app.post('/login', (req, res) => {
  const username = req.body.username
  const user = { name: username }

  if (!(profiles.some(profile => profile.username === user.name))) {
    return res.send(`there is no user ${user.name}`, 401) // refacotr as return res.status(status).send(body) 
  }
  
  const accessToken = generateAccessToken(user)
  const refreshToken = jwt.sign(user, process.env.SECRET_REFRESH_TOKEN, {expiresIn: '24h'})

  res.cookie('access_token', accessToken, {
    httpOnly: true
  })
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true
  })

  rediscl.set(user.name, JSON.stringify({
    refresh_token: refreshToken,
    expires: new Date() + 60 * 60 * 24 // 1hour
  }), console.log)

  res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.SECRET_ACCESS_TOKEN, { expiresIn: '12h' })
}

app.listen("0.0.0.0", 8080)