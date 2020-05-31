const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true
    },
    FName: {
      type: String
    },
    LName: {
      type: String
    },
    isAdmin: {
      type: Boolean
    },
    mobileNumber: {
      type: String
    },
    mail: {
      type: String
    },
    password: {
      type: String,
      required: true
    },
    creatorId: {
      type: String
    },
    position: {
      type: String
    },
    department: {
      type: String
    },
    birthday: {
      type: Date
    },
    addDate: {
      type: Date
    },
    adder: {
      type: String
    },
    isActive: {
      type: Boolean
    },
    hiringDate: {
      type: Date
    },
    yearlyHolidays: {
      type: Number
    },
    totalHolidays: {
      type: Number
    },
    remainingAnnualHolidays: {
      type: Number,
      default: 14
    },
    holidaysTaken: {
      type: Number
    },
    initialPasswordChange: {
      type: Boolean
    },
    director: {
      type: String
    },
    expenseApproveRank: {
      type: Number
    },
    remainingExcuseHolidays: {
      type: Number,
      default: 5
    },
    remainingMarriageHolidays: {
      type: Number,
      default: 5
    },
    remainingMovingHolidays: {
      type: Number,
      default: 3
    },
    remainingAdministrativeHolidays: {
      type: Number,
      default: 3
    },
    remainingBirthdayHolidays: {
      type: Number,
      default: 1
    }
  },
  {
    versionKey: false
  }
)

module.exports = mongoose.model('users', schema)
