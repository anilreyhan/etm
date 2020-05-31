const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema

const HolidaySchema = new Schema({
    id: {
        type: String,
        required: true
    },
    holidayStart: {
        type: Date
    },
    holidayEnd: {
        type: Date
    },
    holidayName: {
        type: String
    }

}, {
        versionKey: false,
    });

mongoose.model('nationalHolidays', HolidaySchema);