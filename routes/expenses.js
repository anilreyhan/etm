const express = require('express')
const router = express.Router()
var multer = require('multer')
var upload = multer({ dest: 'uploads/' })
var fs = require('fs-extra')
const { ensureAuthenticated } = require('../helpers/auth')
const { adminCheck } = require('../helpers/adminCheck')

var path = require('path')
const methodOverride = require('method-override')

//Generate unique ID for each expense
var uuid = require('uuid')
var id = uuid.v1()
var uniqueDocumentId = uuid.v1()

const mongoose = new require('mongoose')

//Load Models
require('../models/Expense')
require('../models/Event')
require('../models/User')
const Expense = mongoose.model('expenses')
const Event = mongoose.model('events')
const User = mongoose.model('users')

var storage = multer.diskStorage({
  destination: './docs_tmp/',
  filename: function (req, file, cb) {
    //req.body is empty...
    //How could I get the new_file_name property sent from client here?
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage })

router.get('/add', ensureAuthenticated, function (req, res) {
  res.render('./expenses/add')
})

router.get('/list', ensureAuthenticated, function (req, res) {
  var expenses = [
    {
      FName: 'John',
      LName: 'Doe',
      date: "2017-11-13T00:00:00.000+00:00",
      approveStage: 2
    },{
      FName: 'Jane',
      LName: 'Doe',
      date: "2017-11-13T00:00:00.000+00:00",
      approveStage: 1
    },{
      FName: 'Yusuf',
      LName: 'Kömür',
      date: "2019-09-13T00:00:00.000+00:00",
      approveStage: 4
    },{
      FName: 'Anıl',
      LName: 'Reyhan',
      date: "2017-01-13T00:00:00.000+00:00",
      approveStage: 2
    },{
      FName: 'Muhammed',
      LName: 'Dilmaç',
      date: "2020-11-13T00:00:00.000+00:00",
      approveStage: 1
    },
  ]

  res.render('expenses/list', { expenses })

  /*
  if (req.user.isAdmin) {
    Expense.find({})
      .sort({ title: 'asc' })
      .then(expenses => {
        res.render('expenses/list', {
          expenses: expenses
        })
      })
  } else {
    Expense.find({ userId: req.user._id })
      .sort({ title: 'asc' })
      .then(expenses => {
        res.render('expenses/list', {
          expenses: expenses
        })
      })
  }*/
})

router.get('/preview/:id', ensureAuthenticated, function (req, res) {
  Expense.findOne({
    id: req.params.id
  }).then(expense => {
    res.render('expenses/expense', {
      expense: expense
    })
  })
})

router.get('/eventList', function (req, res) {
  if (req.headers.token == '123123123') {
    Event.find({}, { _id: 0, name: 1 })
      .sort({ name: 'asc' })
      .then(function (eventList) {
        res.send(eventList)
      })
      .catch(function (err) {
        console.log(err)
      })
  } else {
    res.send(401)
  }
})

router.get('/addNewExpense/', function (req, res) {
  res.render('expenses/addNewExpense', {
    user: req.user
  })
})

router.get('/download/:id', ensureAuthenticated, function (req, res) {
  Expense.findOne({
    id: req.params.id
  }).then(expense => {
    var file = './storage/expenses/' + req.params.id + '.pdf'
    res.download(file, expense.title + '.pdf')
  })
})
router.get('/downloadTemplate', ensureAuthenticated, function (req, res) {
  var file = './storage/harcamaTemplate.xls'
  res.download(file)
})

router.post('/', upload.single('expenseDoc'), ensureAuthenticated, function (
  req,
  res,
  next
) {
  let errors = []

  console.log(req.body)

  if (errors.length > 0) {
    res.render('./expenses/add', {
      errors: errors,
      title: req.body.title,
      summary: req.body.summary
    })
  } else {
    req.flash(
      'success_msg',
      'Harcamanız işlendikten sonra onay sırasına eklenecektir.'
    )
    res.redirect('/')
    ;(async () => {
      await delay(15000)

      readXlsxFile('./storage/expenses/' + uniqueDocumentId + fileExt).then(
        rows => {
          //14. ROW DAN BAŞLA
          rows.forEach(element => {
            if (element[0] == 'SIRA NO') {
              console.log('here.')
              next
            } else {
              User.findOne({ userId: req.user.userId })
                .then(userRequested => {
                  const NewExpense = new Expense({
                    id: id,
                    documentId: uniqueDocumentId,
                    userId: userRequested.userId,
                    FName: userRequested.FName,
                    LName: userRequested.LName,
                    entryNumber: element[0],
                    date: element[1],
                    documentNumber: element[2],
                    comment: element[3],
                    amount: element[4],
                    tax8: element[5],
                    tax18: element[6],
                    total: element[7],
                    isApproved: false,
                    approveStage: 3
                  })
                })
                .catch(err => {
                  req.flash(
                    'error_msg',
                    'Doküman işlenirken beklenmeyen bir hata ile karşılaşıldı. Yetkililere mail gönderiyor!'
                  )
                  //////SAPORTİF EKİBİNE MAİL GÖNDER////////
                  console.log(err)
                  return
                })
            }
          })
          var fileExt = path.extname('./docs_tmp/' + req.file.originalname)
          console.log(fileExt)
          fs.move(
            './docs_tmp/' + req.file.originalname,
            './storage/expenses/' + uniqueDocumentId + fileExt,
            function (err) {
              if (err) return res.status(500).send(err)

              req.flash('success_msg', 'Kayıtlar eklendi.')
              res.redirect('/')
            }
          )
        }
      )
    })()
  }
})

router.get('/approve', adminCheck, function (req, res) {
  Expense.find({ isApproved: false, approveStage: req.user.expenseApproveRank })
    .sort({ isApproved: 'asc', name: 'asc' })
    .then(expenses => {
      res.render('expenses/approve', {
        expenses: expenses
      })
    })
})

router.put('/approve/:id', adminCheck, function (req, res) {
  Expense.findOne({
    id: req.params.id
  }).then(expense => {
    expense.approveStage = req.user.expenseApproveRank - 1
    expense.approverId = req.user.id
    expense.approverName = req.user.name
    expense.approveDate = Date.now()

    expense.save().then(category => {
      req.flash('success_msg', 'Harcama Onaylandı!')
      res.redirect('/expenses/approve')
    })
  })
})

router.delete('/:id', (req, res) => {
  Expense.deleteOne({ id: req.params.id }).then(() => {
    req.flash('success_msg', 'Kayıt silindi!')
    res.redirect('/expenses/list')
  })
})

module.exports = router
