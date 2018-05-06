// config/passport.js

const {FB, FacebookApiException} = require('fb');
const kue = require('kue');

// load all the things we need
const LikedinStrategy   = require('passport-linkedin-oauth2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GithubStrategy = require('passport-github').Strategy;

const User       		= require('../userModel');

function createUserFromProfile(profile){
	const user = new User();
	user.display_name = profile.displayName;
	user.created_at = Date.now();
	user.email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '';
	user.other_emails = profile.emails;
	user.photo = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '';
	return user;
}
const profileProcessingQueue = kue.createQueue();
module.exports = function(passport, configAuth) {

	// =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });


    passport.use(new LikedinStrategy({
        clientID        : configAuth.linkedinAuth.clientID,
        clientSecret    : configAuth.linkedinAuth.clientSecret,
        callbackURL     : configAuth.linkedinAuth.callbackURL,
		scope			: configAuth.linkedinAuth.scope,
		state			: configAuth.linkedinAuth.state,
	passReqToCallback: true
    },
    function(req, token, refreshToken, profile, done) {

        process.nextTick(function() {

            User.findOne({ 'linkedin.id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
				if(req.user == null){
					req.user = {};
				}
					User.findById(req.user.id,function(err,user){
						if(err)
							return done(err);
						if(!user){
							user = createUserFromProfile(profile);
						}
						if(!user.linkedin){
							user.linkedin = {};
						}
						user.linkedin.id    = profile.id; // set the users facebook id                   
						user.linkedin.token = token; // we will save the token that facebook provides to the user                    
						user.linkedin.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
						user.linkedin.email = (profile.emails && profile.emails.length>0)?profile.emails[0].value:null
						user.linkedin.profile = profile;

						// save our user to the database
						user.save(function(err) {
							if (err)
								throw err;
							
							profileProcessingQueue.create('auramvp.profile', {provider:'linkedin',profile_id:profile.id,email:user.linkedin.email,user_id:user.id,token:token}).save();
							// if successful, return the new user
							return done(null, user);
						});							
					});
                }
            });
        });

    }));


    passport.use(new GithubStrategy({
        clientID        : configAuth.githubAuth.clientID,
        clientSecret    : configAuth.githubAuth.clientSecret,
        callbackURL     : configAuth.githubAuth.callbackURL,
	scope		: configAuth.githubAuth.scope,
	state		: configAuth.githubAuth.state,
	passReqToCallback: true
    },
    function(req, token, refreshToken, profile, done) {

        process.nextTick(function() {
            User.findOne({ 'github.id' : profile.id }, function(err, user) {

                if (err)
                    return done(err);

                if (user) {
                    return done(null, user); // user found, return that user
                } else {
				if(req.user == null){
					req.user = {};
				}
					User.findById(req.user.id,function(err,user){
						if(err){
							return done(err);
						}
						if(!user){
							user = createUserFromProfile(profile);
						}
						if(!user.github){
							user.github = {};
						}
						user.github.id    = profile.id;
						user.github.token = token;
						user.github.name  = profile.displayName; 
						user.github.email = (profile.emails && profile.emails.length>0)?profile.emails[0].value:null
						user.github.profile = profile;
						
						user.save(function(err) {
							if (err)
								throw err;
							
							profileProcessingQueue.create('auramvp.profile', {provider:'github',profile_id:profile.id,user_id: user.id, email:user.github.email,token:token, username:profile.username}).save();
							// if successful, return the new user
							return done(null, user);
						});
						
					});
                }

            });
        });

    }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
	profileFields   : ['email','name','age_range','picture','cover','id','gender','displayName','profileUrl'],
	passReqToCallback: true
    },

    // facebook will send back the token and profile
    function(req, token, refreshToken, profile, done) {
        process.nextTick(function() {

            User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                if (err){
                    return done(err);
		}

                if (user) {
                    return done(null, user); // user found, return that user
                } else {
				if(req.user == null){
					req.user = {};
				}

					User.findById(req.user.id,function(err,user){
						if(err){
							return done(err);
						}
						if(!user){
							user = createUserFromProfile(profile);
							if(!user.name) { user.name = profile.first_name + ' ' + profile.last_name;}
						}
						if(!user.facebook){
							user.facebook = {};
						}
						// if there is no user found with that facebook id, create them
						// set all of the facebook information in our user model
						user.facebook.id    = profile.id; // set the users facebook id                   
						user.facebook.token = token; // we will save the token that facebook provides to the user                    
						user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
						user.facebook.email = (profile.emails && profile.emails.length>0)?profile.emails[0].value:null; // facebook can return multiple emails so we'll take the first
						user.facebook.profile = profile;
						profileProcessingQueue.create('auramvp.profile', {provider:'facebook',profile_id:profile.id,user_id:user.id,email:user.facebook.email,token:token}).save();

						user.save(function(err) {
							if (err){
								throw err;
							}
							// if successful, return the new user
							return done(null, user);
						});
					});
                }

            });
        });

    }));

};
