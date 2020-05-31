const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const bcrypt = require('bcryptjs')
const passport = require('passport')
var cors = require('cors')

const { ensureAuthenticated } = require('./helpers/auth')

const { loginCheck } = require('./helpers/loginCheck')
const { adminCheck } = require('./helpers/adminCheck')

const exphbs = require('express-handlebars')

const port = 8085
mongoose.set('useFindAndModify', false)
//Declare other routes
const holidays = require('./routes/holidays')
const documents = require('./routes/documents')
const users = require('./routes/users')
const expenses = require('./routes/expenses')

require('./models/SystemSetting')
require('./models/User')

require('./models/Holiday')
const Holiday = mongoose.model('holidays')
const User = mongoose.model('users')

const SystemSetting = mongoose.model('systemSettings')

// Express session midldeware
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
)

app.use(cors())

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

app.use(methodOverride('_method'))

app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  res.locals.user = req.user || null
  next()
})

//Connect to mongoose
/*mongoose
  .connect(
    ********CONNECTION STRING********
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log('MongoDB Connected')
  })
  .catch(() => {
    err => console.log('error' + err)
  })
*/
//Load Models
require('./models/User')

//BodyParser Middleware
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Handlebars middleware
app.engine(
  'handlebars',
  exphbs({
    defaultLayout: 'main',
    helpers: {
      isYk: function () {
        return true
      }
    }
  })
)
app.set('view engine', 'handlebars')

//Static Folder
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'storage')))

//Index Route

app.get('/', ensureAuthenticated, function (req, res) {
 res.render('index')
 
 /* if (!req.user.initialPasswordChange) {
    req.flash(
      'error_msg',
      'Lütfen ilk kullanımdan önce şifrenizi değiştiriniz.'
    )

    res.redirect('/users/editInfo/' + req.user.id)
  } else {
    if (req.user.isAdmin) {
      User.countDocuments({}, function (err, c) {
        console.log('Count is ' + c)
        Holiday.count({ isApproved: false }, function (err, approveCount) {
          console.log('Count is ' + approveCount)

          Holiday.find().then(holiday => {
            res.render('index', {
              holiday: holiday,
              userCount: c,
              approveCount: approveCount
            })
          })
        })
      })
    } else {
      res.redirect('/users/user/' + req.user.id)
    }
  }*/
})

//About Route

app.get('/about', function (req, res) {
  res.render('about')
})

app.get('/systemSettings/settings', adminCheck, function (req, res) {
  res.render('about')
})

app.post('/systemSettings/settings', adminCheck, (req, res, next) => {
  SystemSetting.findOne({
    id: 1
  }).then(setting => {
    setting.systemColor = req.body.systemColor
  })
})

app.get('/users/login', loginCheck, function (req, res) {
  res.render('users/login')
})

app.post('/users/login', loginCheck, (req, res, next) => {
  res.redirect("/")
  /*
  console.log('got the request')
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next)*/
})

app.get('/users/logout', ensureAuthenticated, function (req, res) {
  req.logout()

  req.flash('success_msg', 'Çıkış işlemi başarılı!')
  res.redirect('/users/login')
})

app.use('/holidays', holidays)
app.use('/documents', documents)
app.use('/users', users)
app.use('/expenses', expenses)

app.get('/*', function (req, res) {
  req.flash('error_msg', 'Yanlış link')
  res.redirect('/')
})

app.listen(port, () => {
  console.log('Listening on port  ' + port)
})
