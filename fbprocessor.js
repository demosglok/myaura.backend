const axios = require('axios');

const mongoose = require('mongoose');
const dbConfig = require('./config/database');
const User = require('./components/user/userModel');
const Talent = require('./components/talent/talentModel');

const FacebookProfileModel = require('./common/social/facebookProfileModel');

const Translate = require('google-translate-api');
// Imports the Google Cloud client library
const Language = require('@google-cloud/language');

// Instantiates a client
const langClient = new Language.LanguageServiceClient({
    keyFilename: 'apikey.json'
});



mongoose.connect(dbConfig.url);
const db = mongoose.connectio;
console.log('started');


function trans(text){
    if(text && text.length > 0)
	return Translate(text,{to:'en'}).then(res => res.text).catch(e => '');
    else
	return new Promise((resolve,reject) => resolve(''));
}
function classf(text){
    return Promise.resolve().then(() => {
	if(text && text.length > 0){
	    return langClient.classifyText({document: {type:'PLAIN_TEXT',content:text}})
		    .then(results => results[0].categories)
		    .catch (e => {console.log(e);return []});
	}
	else return '';
    });

}
function wordcount(text){
    return text.split(/[^A-Za-z]/).filter(el => el.length > 0).length;
}
setTimeout(async () => {
    profiles =  await FacebookProfileModel.find();
    profiles.forEach(async profile => {
	if(profile.profile.posts.length > 0 && profile.profile.likes.length > 0){
	for(let like of profile.profile.likes){
	    //const like = profile.profile.likes[0];
	    //likes - description, about, general_info, mission
	    const like_translated = await Promise.all([
		trans(like.description), trans(like.about), trans(like.general_info), trans(like.mission), trans(like.name)
	    ]);
	    const like_categories = await Promise.all(like_translated.filter(el => el && wordcount(el) > 25).map(el => classf(el)));
	    console.log('like_categories', like_categories);
	}
	for( let post of profile.profile.posts){
	    //const post = profile.profile.posts[0];
	    post_translated = await Promise.all([trans(post.description), trans(post.message)]);
	    //posts - description, if not - message

	    const post_categories = await Promise.all(post_translated.filter(el => el && wordcount(el) > 25).map(el => classf(el)));
	    console.log('post_categories', post_categories);
	}
	}
    });
},2000);