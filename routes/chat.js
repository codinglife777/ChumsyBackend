const express = require('express');
const { checkHeader } = require('../utils');

const router = express.Router();
const chat = require('../controllers/ChatController.js');
router.use(checkHeader)

router.post('/getUsersList', chat.getUsersList);
router.post('/getSupportRoomList', chat.getSupportRoomList);
router.post('/addMessages', chat.addMessage);
router.post('/getMessages', chat.getMessages);
router.get('/deleteMessages/', chat.deleteMessage);
router.post('/getRoomInfo', chat.getRoomInfo);
router.post('/addNewRoom', chat.addNewRoom);
router.post('/addNewGroup', chat.addNewGroup);
router.post('/addMemberGroup', chat.addMemberGroup);
router.post('/upload', chat.uploadFile);

module.exports = router;