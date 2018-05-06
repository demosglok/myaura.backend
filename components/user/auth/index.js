const express = require('express');
const router = express.Router();
const debug = require('debug')('auramvp:auth');
const passport = require('passport');

const passportInit = require('./passport'); // pass passport for configuration

module.exports = function (app, authConfig){

    passportInit(passport, authConfig);
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions

router.get('/auth/facebook', (req,res,next) => {
	req.session.redirect_after_login = req.query.redirect_after_login;
	debug('auth/facebook',req.query.redirect_after_login, req.session.redirect_after_login);
	passport.authenticate('facebook', { scope : authConfig.facebookAuth.scope})(req,res,next);
});
router.get('/auth/facebook/callback', (req,res,next) => {
	const redirect = req.session.redirect_after_login ? req.session.redirect_after_login : '/';
	delete req.session.redirect_after_login;
	debug('auth/facebook/callback',req.session.redirect_after_login, redirect);
	passport.authenticate('facebook', {
		successRedirect : redirect,
		failureRedirect : '/failure'
	})(req,res,next);
});


router.get('/auth/github', (req,res,next) => {
	req.session.redirect_after_login = req.query.redirect_after_login;
	debug('auth/github',req.query.redirect_after_login, req.session.redirect_after_login);
	passport.authenticate('github')(req,res,next);
});
router.get('/auth/github/callback', (req,res,next) => {
	const redirect = req.session.redirect_after_login ? req.session.redirect_after_login : '/';
	delete req.session.redirect_after_login;
	debug('auth/facebook/callback',req.session.redirect_after_login, redirect);
	passport.authenticate('github', {
		successRedirect : redirect,
		failureRedirect : '/'
	})(req,res,next);
});

router.get('/auth/linkedin', (req,res,next) => {
	req.session.redirect_after_login = req.query.redirect_after_login;
	debug('auth/linkedin',req.query.redirect_after_login, req.session.redirect_after_login);
	passport.authenticate('linkedin')(req,res,next);
});
router.get('/auth/linkedin/callback', (req,res,next) => {
	const redirect = req.session.redirect_after_login ? req.session.redirect_after_login : '/';
	delete req.session.redirect_after_login;
	debug('auth/facebook/callback',req.session.redirect_after_login, redirect);
	passport.authenticate('linkedin', {
		successRedirect : redirect,
		failureRedirect : '/'
	})(req,res,next);
});


    app.use('/',router);
}
