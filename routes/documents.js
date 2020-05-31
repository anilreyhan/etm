const express = require('express')
const router = express.Router()
var multer = require('multer')
var upload = multer({ dest: 'uploads/' })
var fs = require('fs-extra')
const { ensureAuthenticated } = require('../helpers/auth')

//Generate unique ID for each document
var uuid = require('uuid')
var id = uuid.v1()

const mongoose = new require('mongoose')

//Load Models
require('../models/Document')
require('../models/User')
const Document = mongoose.model('documents')
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
  res.render('./documents/add')
})

router.get('/list', ensureAuthenticated, function (req, res) {
  Document.find({})
    .sort({ title: 'asc' })
    .then(documents => {
      res.render('documents/list', {
        documents: documents
      })
    })
})

router.get('/preview/:id', ensureAuthenticated, function (req, res) {
  Document.findOne({
    id: req.params.id
  }).then(document => {
    var tempFile = './storage/documents/' + req.params.id + '.pdf';
    fs.readFile(tempFile, function (err, data) {
      res.contentType('application/pdf')
      res.send(data)
    })
  })
})

router.get('/download/:id', ensureAuthenticated, function (req, res) {
  Document.findOne({
    id: req.params.id
  }).then(document => {
    var file = './storage/documents/' + req.params.id + '.pdf'
    res.download(file, document.title + '.pdf')
  })
})

router.post('/', upload.single('document'), ensureAuthenticated, function (
  req,
  res,
  next
) {
  var isReply
  if (req.body.replyTo) {
    isReply = true
  } else {
    isReply = false
  }
  var replyInfo = req.body.replyTo.split('- ')
  var replyToDocNumber = replyInfo[1]
  const document = {
    id: id,
    name: req.body.name,
    recordNumber: req.body.recordNumber,
    adderId: req.user.id,
    to: req.body.to,
    from: req.body.from,
    subject: req.body.subject,
    isReply: isReply,
    replyTo: replyToDocNumber,
    dateAdded: Date.now(),
    documentDate: req.body.documentDate
  }

  new Document(document).save().then(document => {
    fs.move(
      './docs_tmp/' + req.file.originalname,
      './storage/documents/' + id + '.pdf',
      function (err) {
        if (err) return res.status(500).send(err)

        req.flash('success_msg', 'Doküman eklendi.')
        res.redirect('/documents/list')
      }
    )

    id = uuid.v1()
  })
})

router.get('/approve', function (req, res) {
  Document.find({})
    .sort({ isApproved: 'asc', name: 'asc' })
    .then(documents => {
      res.render('documents/approve', {
        documents: documents
      })
    })
})
router.get('/docslist', function (req, res) {
  if (req.headers.token == 'm-todveryveryverysecrettoken') {
    Document.find({}, { _id: 0, recordNumber: 1, name: 1 })
      .sort({ name: 'asc' })
      .then(function (docs) {
        res.send(docs)
        console.log('------------------------')
        console.log(docs)
        console.log('------------------------')
      })
      .catch(function (err) {
        console.log(err)
      })
  } else {
    res.sendStatus(401)
  }
})
router.put('/approve/:id', function (req, res) {
  Document.findOne({
    id: req.params.id
  }).then(document => {
    document.isApproved = true
    document.approverId = req.user.id
    document.approverName = req.user.name
    document.approveDate = Date.now()

    document.save().then(category => {
      req.flash('success_msg', 'Dokuman Onaylandı!')
      res.redirect('/documents/approve')
    })
  })
})

router.delete('/:id', (req, res) => {
    console.log("here")
  Document.deleteOne({ id: req.params.id }).then(() => {
    req.flash('success_msg', 'Doküman silindi!')
    res.redirect('/documents/list')
  })
})

module.exports = router
