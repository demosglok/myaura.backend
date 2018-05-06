const mongoose = require('mongoose');

// define the schema for our company model
const linkedinProfileSchema = mongoose.Schema({

	profile	: mongoose.Schema.Types.Mixed,
	//interests
	//tech interests
	created_at		 : Date,

});


// create the model for users and expose it to our app
module.exports = mongoose.model('LinkedinProfile', linkedinProfileSchema);
