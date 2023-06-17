const RoomCollection = require('../models/Room')
const MessageCollection = require('../models/Message');
const {
  getUser,
  getRoomsByUser,
  emit2room,
  getSupportRooms,
  getRoomInfoById,
  getLastMessageByRoomid
} = require('../utils');
const RoomSettingsCollection = require('../models/RoomSettings');

const getUsersList = async (req, res) => {
  const {user_id} = req.body;
  var data = await getRoomsByUser(user_id)
  const users = await getUser();

  data = await Promise.all(data.map(async (item) => {
    var members = item.members.map(member => users.find(t => t._id == member))
    var name = item.name;
    var avatar = item.avatar;
    const lastMsg = await getLastMessageByRoomid(item._id);
    if (!item.isgroup) {
      const user = members.find(member => member._id != user_id)
      if (user) {
        name = user.fullname;
        avatar = user.avatar;
        member_id = user._id;
        member_birth = user.birth;
        member_company = user.company;
      }
    }
    return {
      ...item._doc,
      id: item._id,
      member_id,
      member_birth,
      member_company,
      name,
      avatar,
      lastMsg
    };
  }));
  // data = data.filter(item => {
  //     if(!item.lastMsg._id) return false;
  //     return true;
  // });
  res.send(data).status(200);
};
const getSupportRoomList = async (req, res) => {
  var data = await getSupportRooms()
  const users = await getUser();

  data = data.map(item => {
    var members = item.members.map(member => {
      const user = users.find(t => t.id == member);
      member = user.name;
      return member;
    });
    var buyer = members[0];
    var seller = members[1];
    return {
      ...item._doc,
      buyer,
      seller
    };
  });
  res.send(data).status(200);
};
const getRoomInfo = async (req, res) => {
  const {roomid} = req.body;
  var data = await getRoomInfoById(roomid)

  res.send(data).status(200);
};
const getMessages = async (req, res) => {
  const {roomid} = req.body;
  const users = await getUser();
  var data = await MessageCollection.find({roomid});
  data = data.map(item => {
    const user = users.find(usr => item.sender == usr._id) || {};
    return {
      ...item._doc,
      id: item.id,
      user
    }
  });
  res.send(data).status(200);
}

// Add a new Message
exports.addMessage = async (req, res) => { // Validate request
  if (req.body && !req.body.contents) {
    return res.status(400).json({success: false, message: "Contents can not be empty!"});
  }

  const Msg = MessageCollection(req.body);

  await Msg.save(req.body).then(data => {
    res.json({success: true, data: data});
  }).catch(err => {
    res.status(500).json({
      success: false,
      message: err.message || "Some error occurred while creating the Event."
    });
  });
}

// Delete a Msg with the specified id in the request
exports.deleteMessage = async (req, res) => {
  const _id = req.params.id;
  await Events.findByIdAndRemove(_id).then(data => {
    if (!data) {
      res.status(404).json({success: false, message: `Cannot delete History with id=${_id}. Maybe Event was not found!`});
    } else {
      res.json({success: true, message: "History was deleted successfully!"});
    }
  }).catch(err => {
    res.status(500).json({
      success: false,
      message: "Could not delete History with id=" + _id
    });
  });
}


const addNewRoom = async (req, res) => {
  const {room, userid} = req.body;
  if (!room ?. id || !userid) 
    return res.send("Invalid user").status(400);
  

  const {id, avatar, name} = room;
  const data = await RoomCollection.find({
    $and: [
      {
        $or: [
          {
            members: [id, userid]
          }, {
            members: [userid, id]
          }
        ]
      }, {
        isgroup: false
      }
    ]
  });
  if (data.length > 0) 
    return res.send({success: true, roomid: data[0]._id, exits: true}).status(200);
  


  const result = await RoomCollection({
    members: [
      userid, id
    ],
    image: avatar,
    name: name,
    isgroup: false
  }).save();
  const roomid = result._id;
  emit2room(roomid, 'refresh-chat', {}, null, false);
  res.send({success: true, roomid}).status(200);
}
const addNewGroup = async (req, res) => {
  const {
    image,
    name,
    members,
    product_id,
    isgroup
  } = req.body;

  var result;
  if (product_id) {
    result = await RoomCollection({
      members,
      image,
      name,
      isgroup,
      product_id
    }).save();
  } else {
    result = await RoomCollection({members, image, name, isgroup: true}).save();
  }
  const roomid = result._id;

  await RoomSettingsCollection({roomid, userid: members[0], key: 'role', value: 'admin'}).save();

  emit2room(roomid, 'refresh-chat', {}, null, false);
  res.send({success: true, roomid}).status(200);
}
const addMemberGroup = async (req, res) => {
  const {user_id, room_id} = req.body;

  var result = await RoomCollection.updateOne({
    _id: room_id
  }, {
    $push: {
      members: user_id
    }
  }, {upsert: false});

  res.send({success: true, result}).status(200);
}
const uploadFile = (req, res) => {
  if (!req.files || !req.files.file) {
    res.send({message: 'File not found'}).status(401);
  }
  const file = req.files.file;
  const {
    body: {
      path,
      filename
    }
  } = req;

  fileUpload(path, file, filename).then(response => {
    res.send(response).status(200);
  }).catch(err => {
    res.send(err).status(401);
  });
}
module.exports = {
  getUsersList,
  getSupportRoomList,
  getMessages,
  uploadFile,
  addNewRoom,
  addNewGroup,
  addMemberGroup,
  getRoomInfo
};
