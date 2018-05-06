const express = require('express');
const router = express.Router();
const MatchController = require('./matchController') ;
const onlyAuth = require('../../common/middleware/onlyAuth');

router.get('/match/:id',onlyAuth, MatchController.getMatch);
router.get('/match/fortalent',onlyAuth, MatchController.getMatchesForTalent);
router.get('/match/forvacancy',onlyAuth, MatchController.getMatchesForVacancy);

router.get('/search/talents',onlyAuth, MatchController.searchTalents);
router.get('/search/vacancies',onlyAuth, MatchController.searchVacancies);

module.exports = router;
