import {profiles} from './models/model.js'
import { promisify } from 'util'

require('dotenv').config()
const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const redis = require("redis");

var rediscl = redis.createClient();
rediscl.on("connect",  () => {
    console.log("Redis plugged in.");
});

app.use(express.json())
 
const getAsync = promisify(rediscl.get).bind(rediscl)

app.post('/token', (req, res) => {
  const refreshToken = req.body.token
  if (refreshToken == null) 
    return res.sendStatus(401)
  
    
  jwt.verify(refreshToken, process.env.SECRET_REFRESH_TOKEN, (err, user) => {
    if (err) 
      return res.sendStatus(403)

    console.log(user)
    console.log(refreshToken)

    getAsync(user).then((res) => {
      
    })

    const accessToken = generateAccessToken({ name: user.name })

    res.json({ accessToken: accessToken })
  })
})


// TO DO : refactor using async await  | by kimkihyuk
app.delete('/logout', (req, res) => {
  jwt.verify(token, process.env.SECRET_REFRESH_TOKEN, (err, user) => {
    console.log('[logout] user is ', user)
    if (err)
      return res.send(403, {response: `you are not ${user}`})
    req.user = user
    
    rediscl.del(req.user)

    res.sendStatus(204)
  })
})

app.post('/login', (req, res) => {
  const username = req.body.username
  const user = { name: username }

  if (model.profiles.some(profile => profile.username !== user.name)) {
    return res.sendStatus(401)
  }

  const accessToken = generateAccessToken(user)
  const refreshToken = jwt.sign(user, process.env.SECRET_REFRESH_TOKEN, {expiresIn: '1h'})

  res.cookie('access_token', accessToken, {
    httpOnly: true
  })
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true
  })

  rediscl.set(user.name, JSON.stringify({
    refresh_token: refreshToken,
    expires: new Date() + 60 * 60 * 1 // 1hour
  }))

  res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.SECRET_ACCESS_TOKEN, { expiresIn: '1m' })
}

app.listen(4000)