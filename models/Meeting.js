const mongoose = require('mongoose')

const meetingSchema = mongoose.Schema({

    id: {
        type: String
    },
    name: {
        type: String
    },

    thumbnail: {
        type: String,
        default: "https://anilreyhan.com/mufe/mufe_logo_beyaz.png"
    },

    meetingSummary: {
        type: String
    },

    attendee: {
        type: String
    },

    host: {
        type: String,
    },

    location: {
        type: String
    },

    attendeeExpectations: {
        type: String
    },

    hostExpectations: {
        type: String
    },

    extraNotes: {
        type: String
    },

    time: {
        type: Date
    }

}, {
        versionKey: false,
    });

module.exports = mongoose.model('meetings', meetingSchema)