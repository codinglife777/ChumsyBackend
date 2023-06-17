const MessageCollection = require("../models/Message")
const RoomSettingCollection = require("../models/RoomSettings")

const { getUser, checkSecret, getLastMessageByRoomid, addUnreadMessage, readMessage, unreadMessages, getUsersByRoom, getRoomsByUser, getMuteSettings, emit2room, emit2user } = require("../utils");

Number.prototype.toMMSS = function () {
    const _v = (v) => `${(v < 10) ? '0' : ''}${v}`;
    var sec_num = parseInt(this, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    if (hours <= 0) return `${_v(minutes)}:${_v(seconds)}`;
    return `${_v(hours)}:${_v(minutes)}:${_v(seconds)}`;
}
Number.prototype.tostrMMSS = function () {
    const _v = (v) => `${(v < 10) ? '0' : ''}${v}`;
    var sec_num = parseInt(this, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours > 0) return `${_v(hours)}:${_v(minutes)}:${_v(seconds)}`;
    else if (minutes > 0) return `${_v(minutes)}:${_v(seconds)}`;
    else return `${_v(seconds)}s`;
}

const users = {};

const socketToRoom = {};

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`New User connected: ${socket.id}`);

        if (!global.timer) global.timer = {}
        if (!global.curInterval) global.curInterval = {}


        const emitCallingTimer = async (roomid) => {
            global.curInterval[roomid] = 0;
            var users = await getUsersByRoom(roomid)
            global.timer[roomid] = setInterval(() => {
                global.curInterval[roomid] += 1;
                users.forEach(user => {
                    io.in(`room_${user}`).emit('calling-timer', { time: global.curInterval[roomid], str_time: global.curInterval[roomid].toMMSS() });
                });
            }, 1000);
        }
        const clearTimer = (roomid) => {
            global.curInterval[roomid] = 0;
            clearTimeout(global.timer[roomid]);
            global.timer[roomid] = null;
        }
        const endCall = (roomID, userid) => {
            clearTimer(roomID)
            let room = users[roomID];
            if (room) {
                room = room.filter(id => id !== userid);
                users[roomID] = room;
            }
            socket.broadcast.emit('user left', userid)
        }
        socket.on('connected', ({ user, client_id, client_secret }) => {
            if (!checkSecret(client_id, client_secret)) {
                socket.emit('user-disconnected', { error: 'credentional mismatch' })
                socket.leave(`room_${user.id}`)
                socket.disconnect()
                return;
            }
            const userid = user.id;
            socket.join(`room_${userid}`);

            socket.on('disconnect', () => {
                const roomID = socketToRoom[userid];
                socket.leave(`room_${userid}`)
                socket.disconnect()
                endCall(roomID, userid)
            });

        });
        const emitNewMsg = (roomid, new_msg, isNew = true) => {
            // socket.emit('receive-message', new_msg)
            emitLastmessage(roomid, isNew ? new_msg : null);
            emit2room(roomid, 'receive-message', new_msg)

        }
        socket.on('delete-messages', async ({ roomid, messageid }) => {
            await MessageCollection.deleteOne({ _id: messageid })
            const new_msg = { id: messageid, roomid, delete: true }
            emitNewMsg(roomid, new_msg, false)
        })
        socket.on('send-message', async (message) => {
            if (!message) return;
            var messageItem = null

            var isNewMsg = false

            if (message.id) {
                const msg = await MessageCollection.find({ _id: message.id })
                if (msg.length > 0) {
                    messageItem = { ...message, edited: true };
                    await MessageCollection.updateOne({ _id: message.id }, { $set: messageItem })
                }
            } else {
                const msg = new MessageCollection(message)
                messageItem = await msg.save()
                messageItem = messageItem._doc
                isNewMsg = true;
            }
            if (!messageItem) return;

            const user = await getUser(messageItem.sender)
            const new_msg = { ...messageItem, id: messageItem._id, user }
            emitNewMsg(message.roomid, new_msg, isNewMsg)
            if (isNewMsg) {
                await addUnreadMessage(messageItem.sender, message.roomid, messageItem._id)
                emitUnreadMessages(null, message.roomid);
            }
        });
        const emitLastmessage = async (roomid, message) => {
            const lastMsg = await getLastMessageByRoomid(roomid, message)
            // socket.emit('last-message', lastMsg)
            emit2room(roomid, 'last-message', lastMsg, null, false);
        }
        const missedMsg = async (callingid, message) => {
            const msg = new MessageCollection(message)
            MessageCollection.updateOne({ id: callingid }, { message })
                .then(async res => {
                    var messageItem = MessageCollection.find({ id: callingid })
                    if (messageItem?.length > 0) messageItem = msg[0];
                    else messageItem = {};
                    const user = await getUser(messageItem.sender)
                    const new_msg = { ...messageItem._doc, id: messageItem.id, user }
                    emitNewMsg(messageItem.roomid, new_msg, true)
                });
        }
        // socket.on('signal', (data) => {
        //     // signal, roomid 
        //     emit2room(data.roomid, 'signal', data, USERID, false);
        // });
        socket.on('offer', async (data) => {
            // offer, roomid, callerid, 
            const user = await getUser(data.callerid)
            const msg_data = {
                roomid: data.roomid,
                sender: data.callerid,
                type: 'calling',
                text: 'calling',
                data: ''
            };
            const result = await (new MessageCollection(msg_data)).save();
            const callingid = result._id;
            data = { ...data, callingid, user }
            emit2room(data.roomid, 'offer', data, data.callerid);

            // setTimeout(() => {
            //     const msg = MessageCollection.find({ _id: callingid })
            //     if (msg && msg.length > 0) {
            //         if (msg[0].data) return;
            //         const message = {
            //             type: 'system',
            //             text: `Missed call`,
            //         }
            //         missedMsg(callingid, message);
            //         socket.emit("call-missed", data)
            //         emit2room(data.roomid, 'call-missed', data, false);
            //     }
            // }, 15 * 1000);
        });
        socket.on('receive', async (data) => {
            // roomid, receiverid, camera_enabled, mic_enabled, callingid
            const { roomid, receiverid, callingid } = data;

            var receivers = await MessageCollection.find({ _id: callingid })
            var onCallers = []
            var start_call = false;
            if (receivers?.length > 0) {
                var sender = receivers[0].sender || '';
                receivers = receivers[0].data || '';
                if (!receivers) start_call = true;
                onCallers = [sender, ...(receivers.split(","))].map(item => item);
            }
            else return;
            receivers = `${receivers}${receivers ? ',' : ''}${receiverid}`;
            await MessageCollection.updateOne({ _id: callingid }, { text: 'received', data: receivers });

            const user = await getUser(receiverid)
            data = { ...data, user }
            // emit2room(roomid, 'receive', { ...data, user }, false);
            onCallers.map(item => emit2user(item, roomid, 'receive', data, false))
            if (start_call) emitCallingTimer(roomid);
        });

        socket.on('decline', async (data) => {
            // roomid, userid
            const message = {
                type: 'system',
                text: global.curInterval[data.roomid] > 0 ? `Call ${global.curInterval[data.roomid].tostrMMSS()}` : 'Call declined'
            }
            missedMsg(data.callingid, message);
            clearTimer(data.roomid);
            const user = await getUser(data.userid)
            endCall(data.roomid, data.userid)
            emit2room(data.roomid, 'decline', { ...data, user }, false);
        });
        socket.on('mute-device', async (data) => {
            // roomid, type, muted
            emit2room(data.roomid, 'mute-device', data, false);
        });
        socket.on('last-message', async ({ user_id }) => {
            var data = await getRoomsByUser(user_id)
            data.forEach(async item => {
                const lastMsg = await getLastMessageByRoomid(item._id)
                socket.emit('last-message', lastMsg)
            });
        });
        socket.on('read-message', async ({ userid, roomid }) => {
            await readMessage(userid, roomid)
            await emitUnreadMessages(userid, roomid, true)
        });
        const emitUnreadMessages = async (userid, roomid, selfonly = false) => {
            const unreadMsgs = await unreadMessages(userid, roomid)
            if(unreadMsgs){
                unreadMsgs.forEach(({ userid, count }) => {
                    socket.emit('unread-messages', { userid, roomid, count })
                    if (!selfonly) emit2user(userid, roomid, 'unread-messages', { userid, roomid, count }, false)
                });
            }
        }
        socket.on('unread-messages', async ({ userid, roomid }) => {
            await emitUnreadMessages(userid, roomid, true)
        });

        const emitMuteRooms = async (userid) => {
            settings = await getMuteSettings(userid)
            socket.emit("mute-rooms", settings);
        }
        socket.on('mute-rooms', async ({ userid }) => {
            await emitMuteRooms(userid)
        });
        socket.on('mute-room', async ({ roomid, userid, mute }) => {
            const query = { userid, roomid, key: 'mute' };
            const update = { $set: { userid, roomid, key: 'mute', value: mute.toString() } };
            const options = { upsert: true };
            await RoomSettingCollection.updateOne(query, update, options);
            await emitMuteRooms(userid)
        });

        socket.on("join room", (roomID, userid) => {
            if (users[roomID]) {
                const length = users[roomID].length;
                if (length === 4) {
                    socket.emit("room full");
                    return;
                }
                users[roomID].push(userid);
            } else {
                users[roomID] = [userid];
            }
            socketToRoom[userid] = roomID;
            const usersInThisRoom = users[roomID].filter(id => id !== userid);
            socket.emit("all users", usersInThisRoom);
        });

        socket.on("sending signal", payload => {
            emit2user(payload.userToSignal, null, 'user joined', { signal: payload.signal, callerID: payload.callerID })
        });

        socket.on("returning signal", payload => {
            emit2user(payload.callerID, null, 'returning signal', { signal: payload.signal, id: payload.userid })
        });
    });
}