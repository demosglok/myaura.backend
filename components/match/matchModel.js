var mongoose = require('mongoose');

// define the schema for our match model
var matchSchema = mongoose.Schema({
	vacancy			 : mongoose.Schema.Types.ObjectId,
	talent			 : mongoose.Schema.Types.ObjectId,
	ratio			 : Number,

	created_at		 : Date,

});

// create the model for users and expose it to our app
module.exports = mongoose.model('Match', matchSchema);
