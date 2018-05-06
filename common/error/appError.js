function AppError(code, description, isOperational, url) {
    Error.call(this, description);
    Error.captureStackTrace(this);
    
	this.code = code;
	this.description = description;
	this.isOperational = isOperational;    
	this.url = url;
};

AppError.prototype.__proto__ = Error.prototype;
const KnownErrors = {NotAuthorized : 401, WrongInput: -2};


module.exports = {AppError : AppError, KnownErrors: KnownErrors};
 