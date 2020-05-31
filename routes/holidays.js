const express = require('express')
const router = express.Router()
var multer = require('multer')
var upload = multer({ dest: 'uploads/' })
var fs = require('fs-extra')
const { ensureAuthenticated } = require('../helpers/auth')
const { adminCheck } = require('../helpers/adminCheck')
var nodemailer = require('nodemailer')
var handlebars = require('handlebars')
var moment = require('moment-business-days')

//Generate unique ID for each holiday
var uuid = require('uuid')
var id = uuid.v1()

const mongoose = new require('mongoose')

//Load Models
require('../models/Holiday')
require('../models/NationalHoliday')

require('../models/User')
const Holiday = mongoose.model('holidays')
const NationalHoliday = mongoose.model('nationalHolidays')

const User = mongoose.model('users')
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

var storage = multer.diskStorage({
  destination: './docs_tmp/',
  filename: function (req, file, cb) {
    //req.body is empty...
    //How could I get the new_file_name property sent from client here?
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage })

router.get('/requestNew', ensureAuthenticated, function (req, res) {
  res.render(
    './holidays/requestNew'
  ) /*User.findOne({
    _id: req.user._id
  }).then(userRequested => {
    res.render('./holidays/requestNew', {
      userRequested: userRequested
    })
  })*/
})

router.get('/list', adminCheck, function (req, res) {
  var holidays = [
    {
      FName: 'John',
      LName: 'Doe',
      holidayStart: '2020-03-25T00:00:00.000+00:00',
      holidayEnd: '2020-03-27T00:00:00.000+00:00',
      isApproved: false,
      requestedHolidays: 2,
      holidayType: 'Excuse',
      comment: 'In need of rest'
    },
    {
      FName: 'Jane',
      LName: 'Doe',
      holidayStart: '2020-03-25T00:00:00.000+00:00',
      holidayEnd: '2020-03-30T00:00:00.000+00:00',
      isApproved: false,
      requestedHolidays: 5,
      holidayType: 'Excuse',
      comment: 'In need of rest'
    },
    {
      FName: 'Yusuf',
      LName: 'Kömür',
      holidayStart: '2020-02-25T00:00:00.000+00:00',
      holidayEnd: '2020-03-27T00:00:00.000+00:00',
      isApproved: false,
      requestedHolidays: 25,
      holidayType: 'Annual',
      comment: 'In need of rest'
    },
    {
      FName: 'Anıl',
      LName: 'Reyhan',
      holidayStart: '2020-03-25T00:00:00.000+00:00',
      holidayEnd: '2020-03-27T00:00:00.000+00:00',
      isApproved: true,
      approverFName: 'Yusuf',
      approverLName: 'Kömür',
      requestedHolidays: 2,
      holidayType: 'Excuse',
      comment: 'In need of rest'
    },
    {
      FName: 'Muhammed',
      LName: 'Dilmaç',
      holidayStart: '2020-03-25T00:00:00.000+00:00',
      holidayEnd: '2020-03-27T00:00:00.000+00:00',
      isApproved: false,
      requestedHolidays: 2,
      holidayType: 'Excuse',
      comment: 'In need of rest'
    }
  ]
  res.render('./holidays/list', {
    holidays
  })
  /*
  Holiday.find({})
    .sort({ title: 'asc' })
    .then(holidays => {
      res.render('holidays/list', {
        holidays: holidays
      })
    })*/
})

router.get('/preview/:id', ensureAuthenticated, function (req, res) {
  Holiday.findOne({
    id: req.params.id
  }).then(holiday => {
    var tempFile = '/storage/holidays/' + req.params.id + '.pdf'
    fs.readFile(tempFile, function (err, data) {
      res.contentType('application/pdf')
      res.send(data)
    })
  })
})

router.get('/nationalHolidays', adminCheck, function (req, res) {
  NationalHoliday.find()
    .sort({ name: 'asc' })
    .then(nationalHolidays => {
      res.render('holidays/nationalHolidays', {
        nationalHolidays: nationalHolidays
      })
    })
})

router.get('/addNationalHolidays', adminCheck, function (req, res) {
  res.render('./holidays/addNationalHolidays')
})

router.delete('deleteNationalHolidays/:id', (req, res) => {
  console.log(req.params.id)

  NationalHoliday.deleteOne({ id: req.params.id }).then(() => {
    req.flash('success_msg', 'Kayıt silindi!')
    res.redirect('/nationalHolidays')
  })
})

router.post('/addNationalHolidays', adminCheck, function (req, res, next) {
  const nationalHoliday = {
    id: id,
    holidayStart: req.body.nationalHolidayStart,
    holidayEnd: req.body.nationalHolidayEnd,
    holidayName: req.body.nationalHolidayName
  }

  new NationalHoliday(nationalHoliday).save().then(nationalHoliday => {
    req.flash('success_msg', 'Resmi tatil eklendi.')
    res.redirect('/naitonalHolidays')

    id = uuid.v1()
  })
})

router.post('/requestNew', ensureAuthenticated, function (req, res, next) {
  let date_ob = new Date()
  let date = ('0' + date_ob.getDate()).slice(-2)
  let month = ('0' + (date_ob.getMonth() + 1)).slice(-2)
  let year = date_ob.getFullYear()

  var dateNow = year + '-' + month + '-' + date

  var compare_dates = function (date1, date2) {
    if (date1 > date2) return false
    else if ((date1 = date2)) return false
    else return true
  }
  var compare_dates2 = function (date1, date2) {
    if (date1 > date2) return true
    else if (date1 < date2) return false
    else return true
  }

  //if (compare_dates(req.body.holidayStart, Date.now)) {

  // }

  var startDate = req.body.holidayStart
  console.log(startDate)

  var diff = moment(req.body.holidayStart, 'YYYY-MM-DD').businessDiff(
    moment(req.body.holidayEnd, 'YYYY-MM-DD')
  )

  const holiday = {
    id: id,
    userId: req.user._id,
    mail: req.user.mail,
    requestedHolidays: req.body.requestedHolidays,
    holidayStart: req.body.holidayStart,
    holidayEnd: req.body.holidayEnd,
    holidayType: req.body.holidayType,
    comment: req.body.comment,
    FName: req.user.FName,
    LName: req.user.LName,
    isApproved: false
  }

  let holidaySelected = req.body.holidayType.charAt(0)
  console.log(holidaySelected)

  let selectedRemaining

  switch (holidaySelected) {
    case 'Y':
      selectedRemaining = req.user.remainingAnnualHolidays
      break
    case 'M':
      selectedRemaining = req.user.remainingExcuseHolidays
      break
    case 'E':
      selectedRemaining = req.user.remainingMarriageHolidays
      break
    case 'T':
      selectedRemaining = req.user.remainingMovingHolidays
      break
    case 'D':
      selectedRemaining = req.user.remainingBirthdayHolidays
      break
    case 'İ':
      selectedRemaining = req.user.remainingAdministrativeHolidays
      break
    default:
      break
  }

  User.findOne({
    _id: holiday.userId
  }).then(userReq => {
    /*if (holiday.requestedHolidays > selectedRemaining) {
      req.flash(
        'error_msg',
        'Talep ettiğiniz izin miktarı kullanılabilir izin miktarından fazladır!'
      )
      res.redirect('requestNew')
    } else {
    if (diff != holiday.requestedHolidays) {
      req.flash('error_msg', 'Talep ettiğiniz izin miktarı ile seçmiş olduğunuz tarihler uyuşmamaktadır.. Lütfen tarihleri kontrol ediniz!');
      res.redirect('requestNew');
    } else {*/
    if (
      compare_dates(req.body.holidayStart, dateNow) ||
      compare_dates2(req.body.holidayStart, req.body.holidayEnd)
    ) {
      req.flash(
        'error_msg',
        'İzin başlangıç tarihiniz bugünün tarihinden önce ve izin bitiş tarihinden sonra olamaz. Lütfen tarihleri kontrol ediniz!'
      )
      res.redirect('requestNew')
    } else {
      new Holiday(holiday).save().then(holiday => {
        req.flash(
          'success_msg',
          'İzin talebiniz onay sırasına eklendi. İzin talebiniz onaylandıktan sonra mail ile bilgilendirileceksiniz.'
        )
        res.redirect('/')

        id = uuid.v1()
      })
    }
  })
})

router.get('/approve', adminCheck, function (req, res) {
  Holiday.find({})
    .sort({ isApproved: 'asc', name: 'asc' })
    .then(holidays => {
      res.render('holidays/list', {
        holidays: holidays
      })
    })
})

router.put('/approve/:id', adminCheck, function (req, res) {
  var remainingHolidays
  var holidaysTaken

  Holiday.findOne({
    id: req.params.id
  }).then(holiday => {
    holiday.isApproved = true
    holiday.approverId = req.user.id
    holiday.approverFName = req.user.FName
    holiday.approverLName = req.user.LName
    holiday.approveDate = Date.now()

    holiday.save().then(() => {
      User.findOne({
        _id: holiday.userId
      }).then(userReq => {
        let holidaySelected = holiday.holidayType.charAt(0)
        console.log(holidaySelected)

        let selectedRemaining

        switch (holidaySelected) {
          case 'Y':
            selectedRemaining = req.user.remainingAnnualHolidays
            a = Number(userReq.remainingAnnualHolidays)
            userReq.remainingAnnualHolidays =
              a - Number(holiday.requestedHolidays)
            break
          case 'M':
            selectedRemaining = req.user.remainingExcuseHolidays
            a = Number(userReq.remainingExcuseHolidays)
            userReq.remainingExcuseHolidays =
              a - Number(holiday.requestedHolidays)
            break
          case 'E':
            selectedRemaining = req.user.remainingMarriageHolidays
            a = Number(userReq.remainingMarriageHolidays)
            userReq.remainingMarriageHolidays =
              a - Number(holiday.requestedHolidays)
            break
          case 'T':
            selectedRemaining = req.user.remainingMovingHolidays
            a = Number(userReq.remainingMovingHolidays)
            userReq.remainingMovingHolidays =
              a - Number(holiday.requestedHolidays)
            break
          case 'D':
            selectedRemaining = req.user.remainingBirthdayHolidays
            a = Number(userReq.remainingBirthdayHolidays)
            userReq.remainingBirthdayHolidays =
              a - Number(holiday.requestedHolidays)
            break
          case 'İ':
            selectedRemaining = req.user.remainingAdministrativeHolidays
            a = Number(userReq.remainingAdministrativeHolidays)
            userReq.remainingAdministrativeHolidays =
              a - Number(holiday.requestedHolidays)
            break
          default:
            break
        }

        a = Number(userReq.remainingHolidays)
        userReq.remainingHolidays = a - Number(holiday.requestedHolidays)

        userReq.save().then(() => {
          readHTMLFile('./notifyEmail.html', function (err, html) {
            var template = handlebars.compile(html)
            var replacements = {
              name: holiday.FName,
              comment: 'İzin talebiniz onaylandı.'
            }

            var htmlToSend = template(replacements)

            var mailOptions = {
              from: 'm-TOD BYS <noreply.mtod@gmail.com>',
              to: holiday.mail,
              subject: 'Bilgi Yönetim Sistemi Bildirimi',
              html: htmlToSend
            }
            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error)
              } else {
                req.flash('success_msg', 'İzin Talebi Onaylandı!')
                res.redirect('/holidays/approve')
                console.log('Email sent: ' + info.response)
              }
            })
          })
        })
      })
    })
  })
})

router.delete('/:id', adminCheck, (req, res) => {
  Holiday.findOne({
    id: req.params.id
  }).then(holiday => {
    User.findOne({
      _id: holiday.userId
    }).then(userReq => {
      let holidaySelected = holiday.holidayType.charAt(0)
      console.log(holidaySelected)

      let selectedRemaining

      switch (holidaySelected) {
        case 'Y':
          selectedRemaining = req.user.remainingAnnualHolidays
          a = Number(userReq.remainingAnnualHolidays)
          userReq.remainingAnnualHolidays =
            a + Number(holiday.requestedHolidays)
          break
        case 'M':
          selectedRemaining = req.user.remainingExcuseHolidays
          a = Number(userReq.remainingExcuseHolidays)
          userReq.remainingExcuseHolidays =
            a + Number(holiday.requestedHolidays)
          break
        case 'E':
          selectedRemaining = req.user.remainingMarriageHolidays
          a = Number(userReq.remainingMarriageHolidays)
          userReq.remainingMarriageHolidays =
            a + Number(holiday.requestedHolidays)
          break
        case 'T':
          selectedRemaining = req.user.remainingMovingHolidays
          a = Number(userReq.remainingMovingHolidays)
          userReq.remainingMovingHolidays =
            a + Number(holiday.requestedHolidays)
          break
        case 'D':
          selectedRemaining = req.user.remainingBirthdayHolidays
          a = Number(userReq.remainingBirthdayHolidays)
          userReq.remainingBirthdayHolidays =
            a + Number(holiday.requestedHolidays)
          break
        case 'İ':
          selectedRemaining = req.user.remainingAdministrativeHolidays
          a = Number(userReq.remainingAdministrativeHolidays)
          userReq.remainingAdministrativeHolidays =
            a + Number(holiday.requestedHolidays)
          break
        default:
          break
      }

      a = Number(userReq.remainingHolidays)
      userReq.remainingHolidays = a + Number(holiday.requestedHolidays)

      userReq.save().then(() => {
        Holiday.deleteOne({ id: req.params.id }).then(() => {
          req.flash('success_msg', 'İzin Talebi Silindi!')
          res.redirect('/holidays/list')
        })
      })
    })
  })
})

module.exports = router
