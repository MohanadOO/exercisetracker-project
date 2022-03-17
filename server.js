require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const { Schema } = mongoose

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const userSchema = new Schema({
  username: { type: String, required: true },
})

let User = mongoose.model('User', userSchema)

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.get('/', (req, res) => {
  res.render('index')
})

app.post('/api/users', (req, res) => {
  const newUser = new User({
    username: req.body.username,
  })

  User.findOne({ username: req.body.username }, (error, data) => {
    if (data === null) {
      return saveUser()
    } else return showUser(data)
  })

  function saveUser() {
    newUser.save((err, data) => {
      if (err) return console.log(error)
      else {
        res.json({
          username: req.body.username,
          _id: data._id,
        })
        return data
      }
    })
  }

  function showUser(data) {
    res.json({
      username: data.username,
      _id: data._id,
    })
  }
})

app.post('/api/users/:_id/exercises', (req, res) => {
  const _id = req.body.id
  const description = req.body.description
  const duration = req.body.duration
  const date = req.body.date

  User.findOne({ _id: _id }, (error, data) => {
    if (data === null) {
      res.json({
        message: 'User dose not exist',
      })
    } else {
      return res.json({
        username: data.username,
        _id: _id,
        date: new Date(date).toString(),
        duration: duration,
        description: description,
      })
    }
  })
})

app.listen(process.env.PORT || 5500)
