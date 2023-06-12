const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AirportCode = require('../models/airportCode');
const Schedule = require('../models/schedule');

exports.createUser = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  const isNewUser = await User.isThisEmailInUse(email);
  if (!isNewUser)
    return res.json({
      success: false,
      message: 'This email is already in use, try sign-in',
    });
  const user = await User({
    first_name,
    last_name,
    email,
    password,
  });
  await user.save();
  res.json({ success: true, user });
};

exports.userSignIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.json({
      success: false,
      message: 'user not found, with the given email!',
    });

  const isMatch = await user.comparePassword(password);
  if (!isMatch)
    return res.json({
      success: false,
      message: 'email / password does not match!',
    });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  let oldTokens = user.tokens || [];

  if (oldTokens.length) {
    oldTokens = oldTokens.filter(t => {
      const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000;
      if (timeDiff < 86400) {
        return t;
      }
    });
  }

  await User.findByIdAndUpdate(user._id, {
    tokens: [...oldTokens, { token, signedAt: Date.now().toString() }],
  });
  const userInfo = {
	_id: user._id,
    fullname: user.fullname,
    email: user.email,
    gender: user.gender,
    birth: user.birth,
    phone_num: user.phone_num,
    company: user.company,
    avatar: user.avatar ? user.avatar : '',
  };

  const switchObj = user.isshow;
  const photos = user.photos;
  const friendsArr = user.friends;
  const friendsInfo = await User.find({_id: { "$in": friendsArr }}).select({ "fullname": 1, "avatar": 1, "birth": 1, "company": 1, "photos": 1});
  
  const airportCode = await AirportCode.find({});
  const schedule = await Schedule.find({ user:user._id}).sort({from: 1 });
  // const schedule = await Schedule.find({ user:user._id, to: { $gte: new Date() }}).sort({from: 1 });

  res.json({ success: true, user: userInfo, switchObj: switchObj, photos: photos, airportCode: airportCode, schedule: schedule, friendsInfo: friendsInfo, token });
};

exports.signOut = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'Authorization fail!' });
    }

    const tokens = req.user.tokens;

    const newTokens = tokens.filter(t => t.token !== token);

    await User.findByIdAndUpdate(req.user._id, { tokens: newTokens });
    res.json({ success: true, message: 'Sign out successfully!' });
  }
};

exports.uploadProfile = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: token });
    }
    await User.findByIdAndUpdate(req.user._id, { ...req.body[0] });
    const user = await User.findById(req.user._id);
    const userInfo = {
	  _id: user._id,
      fullname: user.fullname,
      email: user.email,
      gender: user.gender,
      birth: user.birth,
      phone_num: user.phone_num,
      company: user.company,
      avatar: user.avatar ? user.avatar : '',
    };
  
    res.json({ success: true, user: userInfo, message: 'Upload Profile successfully!' });
  }
};

exports.saveSwitch = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: token });
    }
    await User.findByIdAndUpdate(req.user._id, { isshow: {...req.body[0]} });
    const user = await User.findById(req.user._id);
    const switchObj = user.isshow;
  
    res.json({ success: true, switchObj: switchObj, message: 'Upload Profile Settings successfully!' });
  }
};

exports.savePhoto = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: token });
    }
    const photo_uri = req.body[0];
    let keys = Object.keys(photo_uri);
    let values = Object.values(photo_uri);
    let add_key = 'photos.'+keys;
    if(add_key && values[0])
      await User.findByIdAndUpdate(req.user._id, {$push:{ photos: values[0] }}, {safe: true, upsert: true, new : true},);
    const user = await User.findById(req.user._id);
    const photos = user.photos;
  
    res.json({ success: true, photos: photos, message: 'Upload Photo successfully!' });
  }
};

exports.delPhoto = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: token });
    }
    const photo_id = req.body[0];
    let add_key = 'photos.'+photo_id;
    await User.findByIdAndUpdate(req.user._id, {$unset : {[add_key] : 1 }});
    await User.findByIdAndUpdate(req.user._id, {$pull : {"photos" : null}});
    const user = await User.findById(req.user._id);
    const photos = user.photos;
  
    res.json({ success: true, photos: photos, message: 'Delete Photo successfully!' });
  }
};

exports.setProfilePicture = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: token });
    }
    const photo_id = req.body[0];
    const user = await User.findById(req.user._id);
    const photos = user.photos;
    const setPicture = photos[photo_id];
    await User.findByIdAndUpdate(req.user._id, { 'avatar': setPicture});
    const userInfo = {
	  _id: user._id,
      fullname: user.fullname,
      email: user.email,
      gender: user.gender,
      birth: user.birth,
      phone_num: user.phone_num,
      company: user.company,
      avatar: setPicture ? setPicture : '',
    };
  
    res.json({ success: true, user: userInfo, message: 'Use Profile Picture successfully!' });
  }
};

exports.saveSchedule = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: token });
    }
    const new_data = req.body[0];
    const schedule_row = await Schedule({
      user: req.user._id,
      ...req.body[0],
    });
    await schedule_row.save();
    const schedule = await Schedule.find({ user:req.user._id}).sort({from: 1 });
    // const schedule = await Schedule.find({ user:req.user._id, to: { $gte: new Date() }}).sort({from: 1 });
  
    res.json({ success: true, schedule: schedule, message: 'Upload Schedule successfully!' });
  }
};

exports.delSchedule = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: token });
    }
    const schedule_id = req.body[0];
    await Schedule.deleteOne({_id: schedule_id});
    const schedule = await Schedule.find({ user:req.user._id}).sort({from: 1 });
    // const schedule = await Schedule.find({ user:req.user._id, to: { $gte: new Date() }}).sort({from: 1 });

  
    res.json({ success: true, schedule: schedule, message: 'Delete Schedule successfully!' });
  }
};

exports.getTraveler = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: token });
    }
    const schedule_id = req.body[0];
    const schedule_current = await Schedule.findById(schedule_id);
    if(!schedule_current) {
      return res
        .status(401)
        .json({ success: false, message: token });
    }

    const traveler_list = await Schedule.find({ $or: [
      { $and: [{ from: { $gte: schedule_current.from } }, { from: { $lt: schedule_current.to } }, { location: schedule_current.location }, { user: { $ne: req.user._id } }] },
      { $and: [{ to: { $gt: schedule_current.from } }, { to: { $lte: schedule_current.to } }, { location: schedule_current.location }, { user: { $ne: req.user._id } }] },
      { $and: [{ from: { $lt: schedule_current.from } }, { to: { $gt: schedule_current.to } }, { location: schedule_current.location }, { user: { $ne: req.user._id } }] },
    ]}).populate('user').sort({from: 1 });
  
    res.json({ success: true, traveler_list: traveler_list, message: 'successfully!' });
  }
};

exports.addFriend = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: token });
    }
    const friend_id = req.body[0];
    await User.findByIdAndUpdate(req.user._id, {$addToSet:{ friends: friend_id }}, {safe: true, upsert: true, new : true},);
    const user = await User.findById(req.user._id);
    const friendsArr = user.friends;
    const friendsInfo = await User.find({_id: { "$in": friendsArr }}).select({ "fullname": 1, "avatar": 1, "birth": 1, "company": 1, "photos": 1});
  
    res.json({ success: true, friendsInfo: friendsInfo, message: 'Add Friend successfully!' });
  }
};

exports.delFriend = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: token });
    }
    const friend_id = req.body[0];
    await User.findByIdAndUpdate(req.user._id, {$pull:{ friends: friend_id }},{ safe: true, upsert: true });
    const user = await User.findById(req.user._id);
    const friendsArr = user.friends;
    const friendsInfo = await User.find({_id: { "$in": friendsArr }}).select({ "fullname": 1, "avatar": 1, "birth": 1, "company": 1, "photos": 1});
  
    res.json({ success: true, friendsInfo: friendsInfo, message: 'Remove Friend successfully!' });
  }
};