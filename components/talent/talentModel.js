const mongoose = require('mongoose');

// define the schema for our talent model
const talentSchema = mongoose.Schema({

	user_id			 : {type:mongoose.Schema.Types.ObjectId, index:true, unique: true},
	linkedin_extended_profile	: mongoose.Schema.Types.Mixed,
	facebook_extended_profile   : mongoose.Schema.Types.Mixed,
	github_extended_profile   : mongoose.Schema.Types.Mixed,
	description		 : String,
	techstack		 : [{skill:String, level:Number}],
	interests		 : [{interest:String, level:Number}],
	softskills		 : [{skill:String, level:Number}],

	created_at		 : Date,

	country: String,
	title: String,
	education: [mongoose.Schema.Types.Mixed],
	expirience: [mongoose.Schema.Types.Mixed]

});


// create the model for users and expose it to our app
module.exports = mongoose.model('Talent', talentSchema);
