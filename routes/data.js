const express = require('express');
const router = express.Router();
const { saveData, searchUser, usersExist, loadConversation } = require('../controllers/data')

router.post('/save/:collectionName', saveData);
router.post('/searchUser/:searchKey', searchUser);
router.post('/usersExist', usersExist);
router.post('/loadConversation/:conversationId', loadConversation);

module.exports = router;