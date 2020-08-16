require('dotenv').config()

import {profiles} from "models/model"

console.log(profiles)
// TO DO : require should be replaced import | kimkihyuk
const redis = require("redis");
var rediscl = redis.createClient();

rediscl.on("connect", () => {
  console.log("Redis plugged in.");
});

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')

app.use(express.json())


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
      
    if (token == null)
      return res.sendStatus(401)
  
    jwt.verify(token, process.env.SECRET_ACCESS_TOKEN, (err, user) => {
      console.log('[authenticate] user is ', user)
      if (err)
        return res.sendStatus(403)
      req.user = user
      next()
    })
  }
  
app.get('/posts', authenticateToken, (req, res) => {
  res.json(profiles.filter(profile => profile.username === req.user.name))
})

app.listen(3000)