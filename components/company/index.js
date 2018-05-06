const express = require('express');
const router = express.Router();
const CompanyController = require('./companyController') ;
const onlyAuth = require('../../common/middleware/onlyAuth');

router.get('/profile', onlyAuth, CompanyController.getProfile);

router.get('/info', onlyAuth, CompanyController.getProfileInfo);
router.get('/techstack', onlyAuth, CompanyController.getProfileTechstack);
router.get('/description', onlyAuth, CompanyController.getProfileDescription);
router.get('/vacancies', onlyAuth, CompanyController.getVacancies);

module.exports = router;
