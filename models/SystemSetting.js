const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = mongoose.Schema({
	
	activeUserCount: {
		type: Number
	},
	
	systemColor: {
		type: String
	},

	defaultTotalHoliday: {
		type: Number
	}
}, {
		versionKey: false
	});


module.exports = mongoose.model('systemSettings', schema);



