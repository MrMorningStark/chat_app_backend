const express = require('express');
const router = express.Router();
const { saveData, searchUser } = require('../controllers/data')

router.post('/save/:collectionName', saveData);
router.post('/searchUser/:searchKey', searchUser);

module.exports = router;