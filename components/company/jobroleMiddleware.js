const {AppError, KnownErrors} = require('../../common/error/appError');
module.exports = function(req, res, next) {
    if(req.user.job_role == 'company'){
	next();
    }
    else {
	throw new AppError(KnownErrors.NotAuthorized,'Job role should match company component',true);
    }
}