const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')

const mongoose = new require('mongoose')
var nodemailer = require('nodemailer')
var User = new require('../models/User')
const Holiday = mongoose.model('holidays')
var fs = require('fs-extra')
var handlebars = require('handlebars')

const bcrypt = require('bcryptjs')
const passport = require('passport')
require('../config/passport')(passport)

const { ensureAuthenticated } = require('../helpers/auth')
const { adminCheck } = require('../helpers/adminCheck')

const methodOverride = require('method-override')

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'noreply.mtod@gmail.com',
    pass: 'Saportif2019.'
  }
})

var readHTMLFile = function (path, callback) {
  fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
    if (err) {
      console.log(err)
      callback(err)
    } else {
      callback(null, html)
    }
  })
}

router.get('/list', adminCheck, function (req, res) {
  var users = [
    {
      FName: 'John',
      LName: 'Doe',
      username: 'johndoe',
      initialPasswordChange: false
    },
    {
      FName: 'Jane',
      LName: 'Doe',
      username: 'janedoe',
      initialPasswordChange: true
    },
    {
      FName: 'Yusuf',
      LName: 'Kömür',
      username: 'yusuf.komur',
      initialPasswordChange: true
    },
    {
      FName: 'Anıl',
      LName: 'Reyhan',
      username: 'anilreyhan',
      initialPasswordChange: true
    },
    {
      FName: 'Muhammed',
      LName: 'Dilmaç',
      username: 'mmd',
      initialPasswordChange: true
    }
  ]

  res.render('users/list', {
    users: users
  })

  /*
  User.find({})
    .sort({ FName: 'asc' })
    .then(users => {
      res.render('users/list', {
        users: users
      })
    })*/
})

router.get('/register', adminCheck, function (req, res) {
  res.render('users/register')
})

router.post('/register', adminCheck, (req, res) => {
  let errors = []

  if (errors.length > 0) {
    res.render('users/register', {
      errors: errors,
      name: req.body.name,
      username: req.body.username,
      birthday: req.body.birthday,
      hiringDate: req.body.hiringDate,

      mobileNumber: req.body.mobileNumber,
      mail: req.body.mail
    })
  } else {
    User.findOne({ username: req.body.username }).then(user => {
      if (user) {
        req.flash('error_msg', 'Username already registered')
        res.redirect('register')
      } else {
        var nopass =
          new Date().getMinutes() +
          '' +
          new Date().getSeconds() +
          '' +
          new Date().getDate()

        var newPassword = nopass

        const newUser = new User({
          FName: req.body.FName,
          LName: req.body.LName,
          username: req.body.username,
          mobileNumber: req.body.mobileNumber,
          mail: req.body.mail,
          birthday: req.body.birthday,
          hiringDate: req.body.hiringDate,
          password: newPassword,
          creatorId: req.user._id,
          initialPasswordChange: false
        })

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err
            newUser.password = hash
            newUser
              .save()
              .then(user => {
                readHTMLFile('./passwordEmail.html', function (err, html) {
                  var template = handlebars.compile(html)
                  var replacements = {
                    FName: newUser.FName,
                    password: newPassword,
                    username: newUser.username
                  }

                  var htmlToSend = template(replacements)

                  var mailOptions = {
                    from: 'm-TOD BYS <noreply.mtod@gmail.com>',
                    to: newUser.mail,
                    subject: 'Bilgi Yönetim Sistemi Şifreniz',
                    html: htmlToSend
                  }
                  transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      console.log(error)
                    } else {
                      req.flash(
                        'success_msg',
                        newUser.FName +
                          ' adlı kullanıcı kayıt edildi. Şifresi mail olarak gönderilmiştir.'
                      )
                      res.redirect('/users/register')
                      console.log('Email sent: ' + info.response)
                    }
                  })
                })
              })
              .catch(err => {
                console.log(err)
                return
              })
          })
        })
      }
    })
  }
})

router.delete('/:id', adminCheck, (req, res) => {
  User.deleteOne({
    _id: req.params.id
  }).then(() => {
    req.flash('success_msg', 'Kullanıcı silindi!')
    res.redirect('/users/list')
  })
})

router.get('/user/:id', ensureAuthenticated, function (req, res) {
  User.findOne({
    _id: req.params.id
  }).then(userRequested => {
    const a = userRequested._id

    Holiday.find({
      userId: a
    }).then(holiday => {
      res.render('users/user', {
        userRequested: userRequested,
        holiday: holiday
      })
    })
  })
})

router.get('/editInfo/:id', ensureAuthenticated, function (req, res) {
  User.findOne({
    _id: req.params.id
  }).then(userRequested => {
    res.render('users/editInfo', {
      userRequested: userRequested
    })
  })
})

router.put('/editInfo/:id', ensureAuthenticated, function (req, res) {
  let errors = []

  if (req.body.password) {
    if (req.body.password != req.body.password2) {
      errors.push({ text: 'Passwords do not match' })
    }

    if (req.body.password.length < 4) {
      errors.push({ text: 'Password must be at least 4 characters' })
    }

    User.findOne({
      _id: req.params.id
    }).then(userRequested => {
      ;(userRequested.password = req.body.password),
        (userRequested.initialPasswordChange = true)

      userRequested
        .save()

        .then(userRequested => {
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(userRequested.password, salt, (err, hash) => {
              if (err) throw err
              userRequested.password = hash
              userRequested
                .save()
                .then(userRequested => {
                  req.flash('success_msg', 'Şifraniz başarıyla güncellendi!')
                  res.redirect('/')
                })
                .catch(err => {
                  console.log(err)
                  return
                })
            })
          })
        })
    })
  }

  if (req.body.mail) {
    User.findOne({
      _id: req.params.id
    }).then(userRequested => {
      ;(userRequested.mail = req.body.mail),
        userRequested
          .save()

          .then(userRequested => {
            req.flash('success_msg', 'Şifraniz başarıyla güncellendi!')
            res.redirect('/')
          })
          .catch(err => {
            console.log(err)
            return
          })
    })
  }
})
/*
router.get('/userlist', function (req, res) {
  if (req.headers.token == '123123123') {
    User.find()
      .select('name')
      .sort({ name: 'asc' })
      .then(function (userRequested) {
        res.send(userRequested)
      })
      .catch(function (err) {
        console.log(err)
      })
  } else {
    res.send(401)
  }
})
*/

router.get('/edit/:id', ensureAuthenticated, function (req, res) {
  User.findOne({
    _id: req.params.id
  }).then(userRequested => {
    res.render('users/edit', {
      userRequested: userRequested
    })
  })
})

router.get('/editUserSettings/:id', adminCheck, function (req, res) {
  User.findOne({
    _id: req.params.id
  }).then(userRequested => {
    res.render('users/editUserSettings', {
      userRequested: userRequested
    })
  })
})

router.post('/forgotPassword', (req, res) => {
  User.findOne({ username: req.body.username }).then(user => {
    if (!user) {
      req.flash('error_msg', 'Lütfen kullanıcı adınızı kontrol ediniz.')
      res.redirect('/users/login')
    } else {
      console.log(user.mail + ' >----< ' + req.body.mail)
      if (req.body.mail == user.mail) {
        var nopass =
          new Date().getMinutes() +
          '' +
          new Date().getSeconds() +
          '' +
          new Date().getDate()

        console.log('user </> nopass: ' + user + '</>' + nopass)

        var newPassword = nopass

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newPassword, salt, (err, hash) => {
            if (err) throw err
            user.password = hash
            user.initialPasswordChange = false
            user
              .save()
              .then(user => {
                readHTMLFile('./passwordEmail.html', function (err, html) {
                  var template = handlebars.compile(html)
                  var replacements = {
                    name: user.name,
                    password: newPassword,
                    username: user.username
                  }
                  var htmlToSend = template(replacements)

                  var mailOptions = {
                    from: 'm-TOD BYS <noreply.mtod@gmail.com>',
                    to: user.mail,
                    subject: 'Bilgi Yönetim Sistemi Şifreniz',
                    html: htmlToSend
                  }
                  transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      console.log(error)
                    } else {
                      req.flash(
                        'success_msg',
                        'Yeni şifreniz mail adresinize gönderilmiştir.'
                      )
                      res.redirect('/users/login')
                      console.log('Email sent: ' + info.response)
                      logger.write(
                        new Date()
                          .toISOString()
                          .replace(/T/, ' ')
                          .replace(/\..+/, '') +
                          ' <> IP: ' +
                          req.connection.remoteAddress +
                          ' : ' +
                          'Email sent: ' +
                          info.response +
                          'userId </> username: ' +
                          user.hrId +
                          ' </> ' +
                          user.FName +
                          user.LName +
                          '\r\n'
                      )
                    }
                  })
                })
              })
              .catch(err => {
                console.log(err)
                return
              })
          })
        })
      } else {
        req.flash(
          'error_msg',
          'Girdiğiniz kullanıcı adı mail adresi ile eşleşmiyor.'
        )
        res.redirect('/users/login')
      }
    }
  })
})

/*

router.post('/register', function (req, res, next) {

    let errors = [];

    if (errors.length > 0) {
        res.render('users/register', {
            errors: errors,
            name: req.body.name,
            username: req.body.username,
            isYk: req.body.isYk,
            isDk: req.body.isDk,
            isTk: req.body.isTk,
            isKoor: req.body.isKoor,
            mobileNumber: req.body.mobileNumber,
            mail: req.body.mail,
            password: req.body.password,
            koordinatorluk: req.body.koordinatorluk,
            koordinatorlukGorev: req.body.koordinatorlukGorev,


        });
    } else {

        const obj = {
            id: id,
            name: req.body.name,
            username: req.body.username,
            isYk: req.body.isYk,
            isDk: req.body.isDk,
            isTk: req.body.isTk,
            isKoor: req.body.isKoor,
            mobileNumber: req.body.mobileNumber,
            mail: req.body.mail,
            password: req.body.password,
            koordinatorluk: req.body.koordinatorluk,
            koordinatorlukGorev: req.body.koordinatorlukGorev,

        };

        var user = new User(obj);


        user.save();




        id = uuid.v1();
        console.log('saved');
        res.redirect('/');
    }
});


router.put('/edit/:id', function (req, res) {

    Meeting.findOne({
        id: req.params.id
    })
        .then(meeting => {
            meeting.name = req.body.name;
            meeting.meetingSummary = req.body.meetingSummary;
            meeting.attendee = req.body.attendee;
            meeting.host = req.body.host;
            meeting.location = req.body.location;
            meeting.attendeeExpectations = req.body.attendeeExpectations;
            meeting.hostExpectations = req.body.hostExpectations;
            meeting.extraNotes = req.body.extraNotes;
            meeting.time = req.body.time;
            meeting.thumbnail = req.body.thumbnail

            meeting.save()

            .then(meeting => {
                req.flash('success_msg', 'Toplantı Güncellendi!');
                res.redirect('/meetings/meeting/' + meeting.id);
            });
        });
});
*/

module.exports = router
