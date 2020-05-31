const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    adderId: {
      type: String
    },
    recordNumber: {
      type: String
    },
    to: {
      type: String
    },
    name: {
      type: String
    },
    from: {
      type: String
    },
    isReply: {
      type: Boolean
    },
    replyTo: {
      type: String
    },
    dateAdded: {
      type: Date
    },
    documentDate: {
      type: Date
    },
    subject: {
      type: String
    }
  },
  {
    versionKey: false
  }
)

module.exports = mongoose.model('documents', schema)
