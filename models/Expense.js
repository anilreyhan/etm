const mongoose = require('mongoose')
const Schema = mongoose.Schema

//Create Schema

const ExpenseSchema = new Schema(
  {
    id: {
      type: String,
      required: true
    },
    documentId: {
      type: String
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
    entryNumber: {
      type: String
    },
    date: {
      type: Date
    },
    documentNumber: {
      type: String
    },
    comment: {
      type: String
    },
    amount: {
      type: String
    },
    tax8: {
      type: String
    },
    tax18: {
      type: String
    },
    total: {
      type: String
    },
    isApproved: {
      type: Boolean
    },
    approveStage: {
      type: Number
    }
  },
  {
    versionKey: false
  }
)

mongoose.model('expenses', ExpenseSchema)
