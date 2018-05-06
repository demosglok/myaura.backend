const kue = require('kue');
const axios = require('axios');
const profileQueue = kue.createQueue();

const mongoose = require('mongoose');
const dbConfig = require('./config/database');
const User = require('./components/user/userModel');
const Talent = require('./components/talent/talentModel');
const Company = require('./components/company/companyModel');

const facebookProfileModel = require('./common/social/facebookProfileModel');
const githubProfileModel = require('./common/social/githubProfileModel');
const linkedinProfileModel = require('./common/social/linkedinProfileModel');
const fbScrapper = require('./common/social/facebookScrapper');
const githubScrapper = require('./common/social/githubScrapper');;

const {FB, FBexception} = require('fb');
const fbgraph = require('fbgraph');

mongoose.connect(dbConfig.url);
const db = mongoose.connectio;
console.log('started');


profileQueue.process('auramvp.profile',async (job, done) => {
    console.log('job.data',job.data);
    let profile = null;

    let talent = await Talent.findOne({user_id: job.data.user_id});
    if(!talent){
	talent = new Talent();
	talent.user_id = job.data.user_id;
	talent.techstack = [];//[{skill:'bb',level:1}];
	talent.description = '';
	talent.interests = [];//[{interest:'dd', level:2}];
    }
    talent.softskills = [];//[{softskill:'ccc',level:2}];
    const user = await User.findById(job.data.user_id);

    switch(job.data.provider){
	case 'facebook':{
	    
	    profile = new facebookProfileModel();
	    FB.setAccessToken(job.data.token);
	    try{
	    if(!user.photo || user.photo.indexOf('fcdn') !== -1 || user.photo.indexOf('lookaside') !== -1){
		FB.api('/' + job.data.profile_id + '/picture',{fields:['url'],type:'large', redirect:false})
		.then(picture => {
		    user.photo = picture.data.url;
		    user.save();
		})
		.catch(e => console.log('picture error',e));
	    }
//	    const res = await FB.api('/'+job.data.profile_id, {fields:['likes{description,about,category,display_subtext,general_info,mission,name}',
//					    'posts{caption,description,message,story,type}']});
	    const res = await FB.api('/'+job.data.profile_id, {fields:['likes{description,about,category,display_subtext,general_info,mission,name}',
					    'posts{caption,description,message,story,type}']});
	    const posts_paging = res.posts && res.posts.paging ? res.posts.paging.next : null;
	    const likes_paging = res.likes && res.likes.paging ? res.likes.paging.next : null;

	    const posts = res.posts && res.posts.data ? res.posts.data : [];
	    const likes = res.likes && res.likes.data ? res.likes.data : [];
    

	    profile.profile = {posts:posts, likes:likes};
	    if(posts_paging && likes_paging){

		//fbgraph.get(posts_paging, (err,res) => console.log('fbgraph res',res));
		//const {err, next_posts} = await fbgraph.get(posts_paging);//need promisify
		
		const [next_posts, next_likes] = await Promise.all([axios.get(posts_paging), axios.get(likes_paging)]);

		profile.profile.posts = posts.concat(next_posts.data.data);
		profile.profile.likes = likes.concat(next_likes.data.data);
	    }
	    profileQueue.create('auramvp.facebook_profile_data',profile.profile).save();

	    }
	    catch(e){
		console.log('exception',e);
		//logger.error(e);
	    }
	}
	break;
	case 'linkedin':{
	    //try{
	    talent.country = user.linkedin.profile._json.location.country.name;
	    talent.title = user.linkedin.profile._json.headline;
	    if(!talent.description){
		talent.description = user.linkedin.profile._json.summary;
	    }
	    /*
	    profile = new linkedinProfileModel();
	    //Authorization: Bearer AQXdSP_W41_UPs5ioT_t8HESyODB4FqbkJ8LrV_5mff4gPODzOYR
	    const bearer = 'Bearer '+job.data.token;
	    
	    const axios_instance = axios.create({baseURL:'https://api.linkedin.com/v1/', headers:{Authorization: bearer}});
	    const {err,res} = await axios_instance.get('people/~?format=json');
	    axios_instance.get('people/~?format=json').then((err,res) => console.log('2',err,res));
	    console.log('linkedin',err,res);
	    }
	    catch(e){
		console.log('linkedin exception',e);
	    }
	    console.log('linkedin done');
	    */
	}
	break;
	case 'github':{
	    try{
		profile = new githubProfileModel();
		profile.profile = await githubScrapper(job.data.username, job.data.token);
		profile.created_at = Date.now();
		const {res,err} = await profile.save();
		if(err){
		    console.log(err);
		    //logger.error(err);
		}
		let languages = [];
		let topics = []
		for(let repo in profile.profile.repos.repos){
		    if(profile.profile.repos.repos[repo].languages){
			const repo_languages = Object.keys(profile.profile.repos.repos[repo].languages);
			if(repo_languages){
			    languages = languages.concat(repo_languages);
			}
		    }
		    
		    if(profile.profile.repos.repos[repo].topics){
			const repo_topics = profile.profile.repos.repos[repo].topics.names;
			if(repo_topics){
			    topics = topics.concat(repo_topics);
			}
		    }
		}
		const unique_languages = languages.filter((elem, pos, arr) => arr.indexOf(elem) == pos); 
		const unique_topics = topics.filter((elem, pos, arr) => arr.indexOf(elem) == pos); 

		//filling talent
		talent.description += profile.profile.bio + "\n----------------\n";
		
		unique_languages.forEach(lang => 
		    {
			if(lang)  talent.techstack.push({skill:lang, level:1}) ;
		    });
		unique_topics.forEach(topic => topic ? talent.interests.push({interest:topic, level:1}) : null);
	    }
	    catch(e){
		console.log(e);
		//logger.error(e);
	    }
	}
	break;
    }
    
    try{
	if(profile && typeof profile === 'object'){
	    profile.created_at = Date.now();
	    profile.user_id = job.data.user_id;
	    const {profile_save_res, err} = await profile.save();
	    if(err){
		console.log('err',err);
		//logger.error(err);
	    }
	}
	const {talent_save_res,talent_err} = await talent.save();
	if(talent_err){
		console.log('talent err',talent_err);
	}
    }
    catch(e){
	console.log('exception while saving to db', e);
    }
    done();
});

profileQueue.process('auramvp.raw_profile_data', async (job, done) => {
    console.log('raw_profile_data',Object.keys(job.data));
    done();
});