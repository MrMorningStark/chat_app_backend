const express = require('express');
const router = express.Router();
const { saveData, searchUser, usersExist, loadConversation, loadRecentChats } = require('../controllers/data')

router.post('/save/:collectionName', saveData);
router.post('/searchUser/:searchKey', searchUser);
router.post('/usersExist', usersExist);
router.post('/loadConversation/:conversationId', loadConversation);
router.post('/loadRecentChats/:userUID', loadRecentChats);

module.exports = router;