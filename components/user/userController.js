const User = require('./userModel');
const authConfig = require('../../config/auth');
const {AppError, KnownErrors} = require('../../common/error/appError');
const debug = require('debug')('auramvp:users');

module.exports = {
	attachFacebook: function(req,res,next){
		passport.authenticate('facebook', { scope : authConfig.facebookAuth.scope})(req,res,next);
		//res.json({aa:1});
	},
	attachFacebookCallback : function(req,res,next){
		passport.authenticate('facebook', {
			successRedirect : '/profile',
			failureRedirect : '/'
		})(req,res,next);
	},
	attachLinkedin: function(req,res,next){
		passport.authenticate('linkedin')(req,res,next);
	},
	attachLinkedinCallback: function(req,res,next){
		passport.authenticate('linkedin', {
			successRedirect : '/profile',
			failureRedirect : '/'
		})(req,res,next);
	},
	attachGithub: function(req,res,next){
		passport.authenticate('github')(req,res,next);
	},
	attachGithubCallback: function(req,res,next){
		passport.authenticate('github', {
			successRedirect : '/profile',
			failureRedirect : '/'
		})(req,res,next);
	},
	getJobRole: function(req,res,next){
		res.json({job_role:req.user ? req.user.job_role : ''});
	},
	setJobRole: function(req,res,next){
		console.log('setJobRole, data=',req.body);
		req.user.job_role = req.body.jobRole;
		req.user.save()
		.then(save_result => res.json({success:true, message: save_result }))
		.catch(e => {
		    debug(e);
		    next(new AppError(KnownErrors.WrongInput,e,true));
		});
	},
	getBasicProfile: function(req, res, next){
		res.json(req.user);
	},
	getTest: function(req,res,next){
	    res.json({test: req.user.testval});
	},
	setTest: function(req,res,next){
	    req.user.testval = 'aaa';
	    console.log('req.params',req.params);
	    req.user.save().then(result => {
		res.json({result:result})
	    })
	    .catch( e=> console.log(e));
	}
};