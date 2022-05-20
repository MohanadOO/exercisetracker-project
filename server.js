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
  log: [
    {
      description: { type: String, required: true },
      duration: { type: Number, required: true },
      date: { type: Date, default: new Date().toDateString() },
    },
  ],
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
  const date =
    new Date(req.body.date).toDateString() || new Date().toDateString()
  run()
  async function run() {
    try {
      const user = await User.where('_id').equals(_id)
      user[0].log = [
        ...user[0].log,
        {
          description: req.body.description,
          duration: req.body.duration,
          date: date,
        },
      ]
      await user[0].save()
      const logLength = user[0].log.length - 1
      res.json({
        _id: user[0]._id,
        username: user[0].username,
        date: user[0].log[logLength].date.toDateString(),
        duration: user[0].log[logLength].duration,
        description: user[0].log[logLength].description,
      })
    } catch (e) {
      console.log(e.message)
    }
  }
})

app.get('/api/users/:_id/logs', (req, res) => {
  const id = req.params._id
  run()
  async function run() {
    const user = await User.where('_id').equals(id)
    const limit = parseInt(req.query.limit) || user[0].log.length
    const from = new Date(req.query.from).getTime() || 0
    const to = new Date(req.query.to).getTime() || new Date().getTime()
    const logs = user[0].log
    const fix = logs
      .filter((value) => {
        return from < value.date.getTime() && to > value.date.getTime()
      })
      .map((i) => {
        return i
      })
    const count = [...fix].splice(0, limit).length
    res.json({
      _id: user[0]._id,
      username: user[0].username,
      count: count,
      log: fix.splice(0, limit),
    })
  }
})

app.get('/api/users', (req, res) => {
  async function findLength() {
    const user = await User.find({}, { log: 0, date: 0 })
    res.json(user)
  }
  findLength()
})

app.listen(process.env.PORT || 5500)

module.exports = app