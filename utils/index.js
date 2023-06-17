const UserCollection = require("../models/User")
const MessageCollection = require("../models/Message")
const RoomCollection = require("../models/Room")
const UnreadMsgCollection = require("../models/UnreadMessages")
const RoomSettingCollection = require("../models/RoomSettings")

const getUser = async (userid = null) => {
    var user = await UserCollection.find().select({ "fullname": 1, "avatar": 1, "birth": 1, "company": 1 }) || [];
    user = user.map(item => item._doc);
    if (!userid) return user;

    user = user.find(item => item._id == userid);
    return user || {};
}

const checkHeader = (req, res, next) => {
    const client_id = req.get('client_id');
    const client_secret = req.get('client_secret');
    if (checkSecret(client_id, client_secret)) next();
    else res.status(401).send('Invalid credentional');
}
const checkSecret = (client_id, client_secret) => {
    // DEVELOPMENT
    return true;
    // if (client_id == 'test_client_id' && client_secret == 'test_client_secret') return true;
    // return false;
}
const getRoomByid = async (roomid) => {
    var data = await RoomCollection.find({ _id: roomid })
    if (data?.length > 0) return data[0] || {};
    return {}

}
const getUsersByRoom = async (roomid) => {
    var data = await getRoomByid(roomid)
    return data.members || [];
}
const addUnreadMessage = async (sender, roomid, messageid) => {
    var users = await getUsersByRoom(roomid)
    users = users.filter(item => item != sender);
    return Promise.all(users.map(async userid => {
        const unread = new UnreadMsgCollection({ roomid, messageid, userid })
        await unread.save();
    }))
}
const unreadMessages = async (userid, roomid) => {
    if (userid) {
        const count = await UnreadMsgCollection.find({ roomid, userid });
        return [{ userid, count: count.length }]
    } else {
        var data = await getRoomByid(roomid)
        const users = data.members
        if (users) {
            return Promise.all(users.map(async userid => {
                const count = await UnreadMsgCollection.find({ roomid, userid });
                return { userid, count: count.length }
            }));
        } else {
            return { userid, count: 0 }
        }

    }
}
const readMessage = (userid, roomid) => {
    return UnreadMsgCollection.deleteMany({ roomid, userid })
}
const getLastMessageByRoomid = async (roomid, msgData = null) => {
    var data = msgData;
    if (!msgData) {
        data = await MessageCollection.find({
            roomid, $and: [
                { type: { $ne: 'system' } },
                { type: { $ne: 'calling' } }
            ]
        })
        if (data?.length > 0) {
            data = data[data.length - 1];
            data = data._doc;
        }
    }
    if (!data) return {};
    var message = '';
    if (data.type == 'photo') message = 'Photo';
    else if (data.type == 'video') message = 'Video';
    else if (data.type == 'audio') message = 'Audio';
    else if (data.type == 'file') message = 'File';
    else if (data.type == 'file') message = 'File';
    else message = data.text;

    return { ...data, id: data._id, message, user: {} };
}
const getMute = async (roomid, userid) => {
    if (!roomid) return true;
    var mute = false;
    const settings = await RoomSettingCollection.find({ roomid, userid, key: 'mute' })
    if (settings?.length > 0) {
        mute = settings[0]?.value == "true";
    }
    return mute;
}
const getRoomsByUser = async (userid) => {
    var rooms = await RoomCollection.find({
        members: { "$in": [userid] }
    }).sort({ "_id": -1 });
    if (rooms?.length > 0) return rooms;
    return [];
}
const getSupportRooms = async () => {
    var rooms = await RoomCollection.find({
        members: { "$size": 2 },
        isgroup: true,
        product_id: { $gt: 0 },
    }).sort({ "_id": -1 });
    if (rooms?.length > 0) return rooms;
    return [];
}
const getRoomInfoById = async (roomid) => {
    var rooms = await RoomCollection.findOne({
        _id: ObjectId(roomid)
    });
    if (rooms?.length > 0) return rooms;
    return [];
}
const getMuteSettings = async (userid) => {
    var rooms = await getRoomsByUser(userid)
    var data = {};
    await Promise.all(rooms.map(async room => {
        const mute = await getMute(room._id, userid)
        data = { ...data, [room._id]: mute };
    }));
    return data;
}

const emit2room = async (roomid, key, data, selfid = null, notify = true) => {
    const room = await RoomCollection.find({ _id: roomid });
    if (!(room?.length > 0)) return false;
    const members = room[0].members;
    members.forEach(member => {
        if (member != selfid) emit2user(member, roomid, key, data, notify);
    });
    return true;
}
const emit2user = async (userid, roomid, key, data, notify = true) => {
    const isOn = global.io.sockets.adapter.rooms.get(`room_${userid}`);
    if (isOn && isOn.size > 0) {
        isOn.forEach(item => {
            console.log("emit", item, `room_${userid}`, key)
            // const socketId = [...isOn][0];
            // https://socket.io/docs/v2/emit-cheatsheet/
            // global.io.in(`room_${userid}`).emit(key, data);
            global.io.to(item).emit(key, data);
        });
    } else if (notify) {
        const isMute = await getMute(roomid, userid)
        if (isMute) return;
        // sendFCM
        console.log("notify to user")
    }
    return true;
}
module.exports = {
    getUser, checkSecret, checkHeader,
    getLastMessageByRoomid, addUnreadMessage, readMessage, unreadMessages, getUsersByRoom,
    getMute, getRoomsByUser, getMuteSettings, emit2room, emit2user, getSupportRooms, getRoomInfoById
}
