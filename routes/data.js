const express = require('express');
const router = express.Router();
const { saveData, searchUser, usersExist } = require('../controllers/data')

router.post('/save/:collectionName', saveData);
router.post('/searchUser/:searchKey', searchUser);
router.post('/usersExist', usersExist);

module.exports = router;