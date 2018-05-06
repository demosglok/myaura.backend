const Talent = require('./talentModel');

function build_talent_user_data(user, talent){
		    const score = user.score ? user.score : talent.techstack.length + talent.softskills.length;
		    let profile_completion = 0;
		    let balance = 0;
		    if(user.facebook.id) {
			balance += 10;
			profile_completion += 20;
		    }
		    if(user.github.id) {
			balance += 10;
			profile_completion += 20;
		    }
		    if(user.linkedin.id) {
			balance += 10;
			profile_completion += 20;
		    }

		    if(user.profile_completion ){
			profile_completion = user.profile_completion;
		    }
		    if(user.balance){
			balance = user.balance;
		    }
		    const username = user.github && user.github.profile ? user.github.profile.username : '';
	return {score, profile_completion, balance, availability:true, name:user.display_name, username, email:user.email, photo:user.photo};
}
function build_talent_skills_data(user, talent){
    return {hardskills: talent.techstack, softskills: talent.softskills};
}
function build_talent_general_data(user, talent){
    return {name:user.display_name, email:user.email, country: talent.country, title: talent.title, summary: talent.description};
}
function build_talent_about_data(user, talent){
    return {interests:['diving','hiking','biking']/*talent.interests*/, education:talent.education, expirience:talent.expirience, events:[]};
}
module.exports = {
	getProfile: function(req, res, next){
		Talent.findOne({user_id:req.user.id}).lean().then(talent => 
		{
		    //console.log(req.user.id,talent);
		    const profile = {};
		    profile.user = build_talent_user_data(req.user, talent);

		    
		    profile.general = build_talent_general_data(req.user, talent);

		    profile.skills = build_talent_skills_data(req.user, talent);
		    profile.about = build_talent_about_data(req.user, talent);
		    res.json(profile);
		})
		.catch(err => {
		    console.log(err);
		    next(err);
		});
	},
	getProfileSkills: function(req, res, next){
		Talent.findOne({user_id:req.user.id}).lean().then(talent => 
		    res.json(build_talent_skills_data(req.user, talent))).catch(next);
	},
	getProfileGeneral: function(req, res, next){
		Talent.findOne({user_id:req.user.id}).lean().then(talent => res.json(build_talent_general_data(req.user,talent))).catch(next);
	},
	getProfileAbout: function(req, res, next){
		Talent.findOne({user_id:req.user.id}).lean().then(talent => res.json(build_talent_about_data(req.user,talent))).catch(next);
	},
};