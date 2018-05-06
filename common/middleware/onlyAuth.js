const {AppError, KnownErrors} = require('../error/appError');

module.exports = function(req, res, next) {
    if (req.user || (req.session && req.session.user)) {
	next(); 
    } else {
	  throw new AppError(KnownErrors.NotAuthorized, 'Not authorized', true, req.url);
    }
}