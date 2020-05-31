const mongoose = require('mongoose')
const Schema = mongoose.Schema
var Expense = new require('../models/Expense')

//Create Schema

const EventSchema = new Schema(
  {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    FName: {
      type: String
    },
    LName: {
      type: String
    },
    dateStart: {
      type: Date
    },
    dateEnd: {
      type: Date
    },
    dateAdded: {
      type: Date
    },
    comment: {
      type: String
    },
    totalAmount: {
      type: String
    },
    approvedAmount: {
      type: String
    },
    isApproved: {
      type: Boolean
    },
    approveStage: {
      type: Number
    },
    expenses: {
      expenses: [Expense]
    }
  },
  {
    versionKey: false
  }
)

mongoose.model('events', EventSchema)
