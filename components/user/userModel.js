var mongoose = require('mongoose');

// define the schema for our user model
var userSchema = mongoose.Schema({

    facebook         : {
        id           : {type:String, index:true},
        token        : String,
        email        : String,
        name         : String,
	profile      : mongoose.Schema.Types.Mixed,


    },
    linkedin         : {
        id           : {type:String, index:true},
        token        : String,
        displayName  : String,
        username     : String,
	profile      : mongoose.Schema.Types.Mixed,


    },

    github           : {
        id           : {type:String, index:true},
        token        : String,
        displayName  : String,
        username     : String,
	profile      : mongoose.Schema.Types.Mixed,


    },
	detailed_job_profile : mongoose.Schema.Types.ObjectId, //either company or talent id
	
	
	display_name		 : String,
	

	job_role		 : { type: String, enum: ['talent', 'company']},
	email			 : {type:String, index:true, unique: false},
	other_emails	 	 : mongoose.Schema.Types.Mixed,
	photo			 : String,

	balance			 : Number,
	score			 : Number,
	availability		 : Boolean,
	profile_completion	 : Number,

	terms			 : Boolean,

	created_at		 : Date,


});

userSchema.methods.registered = function() {
    return this.terms == true;
};
userSchema.methods.isTalent = function() {
    return this.job_role == 'talent';
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
