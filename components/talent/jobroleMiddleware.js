const {AppError, KnownErrors} = require('../../common/error/appError');
module.exports = function(req, res, next) {
    
    if(req.user.job_role == 'talent'){
	next();
    }
    else {
	throw new AppError(KnownErrors.NotAuthorized,'Job role should match talent component',true);
    }
}