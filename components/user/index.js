const express = require('express');
const router = express.Router();
const UserController = require('./userController') ;
const onlyAuth = require('../../common/middleware/onlyAuth');
const auth = require('./authMiddleware');



router.get('/basicProfile',[onlyAuth, auth], UserController.getBasicProfile);
router.get('/jobRole',[onlyAuth, auth], UserController.getJobRole);
router.post('/jobRole',[onlyAuth, auth], UserController.setJobRole);
router.get('/test',[auth], UserController.getTest);
router.get('/settest',[ auth], UserController.setTest);
module.exports = router;
