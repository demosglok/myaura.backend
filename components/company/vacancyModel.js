const mongoose = require('mongoose');

// define the schema for our vacancy model
const vacancySchema = mongoose.Schema({

	description		 : String,
	techstack		 : [String],
	candidate_level	 : {type:String, enum:['junior', 'middle','senior']},
	
	created_at		 : Date,

});


// create the model for users and expose it to our app
module.exports = mongoose.model('Vacancy', vacancySchema);
