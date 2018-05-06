const mongoose = require('mongoose');

// define the schema for our company model
const companySchema = mongoose.Schema({

	linkedin_extended_profile	: mongoose.Schema.Types.Mixed,
    facebook_extended_profile   : mongoose.Schema.Types.Mixed,
	description		 : String,
	techstack		 : [String],
	vacancies		 : [{type: mongoose.Schema.Types.ObjectId, ref: 'Vacancy'}],

	created_at		 : Date,

});


// create the model for users and expose it to our app
module.exports = mongoose.model('Company', companySchema);
