const express = require('express');
const router = express.Router();
const TalentController = require('./talentController') ;
const onlyAuth = require('../../common/middleware/onlyAuth');
const jobRoleTalent = require('./jobroleMiddleware');


router.get('/profile',[onlyAuth,jobRoleTalent], TalentController.getProfile);
router.get('/profile/skills',[onlyAuth,jobRoleTalent], TalentController.getProfileSkills);
router.get('/profile/general',[onlyAuth,jobRoleTalent], TalentController.getProfileGeneral);
router.get('/profile/about',[onlyAuth,jobRoleTalent], TalentController.getProfileAbout);

module.exports = router;
