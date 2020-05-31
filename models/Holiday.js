const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema

const HolidaySchema = new Schema({
    id: {
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
    mail: {
        type: String
    },
    tel: {
        type: String
    },
    department: {
        type: String
    },
    requestedHolidays: {
        type: Number
    },
    holidayStart: {
        type: Date
    },
    holidayEnd: {
        type: Date
    },
    holidayType: {
        type: String
    },
    isApproved: {
        type: Boolean,
    },
    director: {
        type: String
    },
    approverId: {
        type: String
    },
    approverFName: {
        type: String
    }, 
    approverLName: {
        type: String
    },
    approveDate: {
        type: Date
    },
    comment: {
        type: String
    }

}, {
        versionKey: false,
    });

mongoose.model('holidays', HolidaySchema);