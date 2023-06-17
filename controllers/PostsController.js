const Posts = require('../models/Posts');

// Create and Save a new Post
exports.createPost = async (req, res) => {
  // Validate request
  if (!req.body.user_id) {
    return res
      .status(400)
      .json(
        {
          success: false,
          message: "UserID can not be empty!"
        });
  }

  //// Create a Post => req.body
  const Post = Posts(req.body);
  // new Posts({
  //   user_id: req.body.user_id,
  //   photo_intro: req.body.photo_intro,
  //   photo: req.body.photo,
  //   is_shared: req.body.is_shared,
  //   likes_users: [req.body.likes_users],
  //   vote_users: [req.body.vote_users],
  //   feed: [req.body.feed],
  // });

  // Save Post in the database
  //  req.body.length ?
  await Post
    .save(req.body)
    .then(data => {
      res.json({ success: true, data: data });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message:
          err.message || "Some error occurred while creating the Post."
      });
    });
}

// Get all Posts
exports.getAllPostsList = async (req, res) => {
  await Posts.find()
    .then(data => {
      res.json({ success: true, data: data });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message:
          err.message || "Some error occurred while retrieving Posts."
      });
    });
}

// Get a single Post
exports.getPost = async (req, res) => {
  const _id = req.params.id;
  await Posts.findById(_id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Post with id " + _id });
      else res.json({ successs: true, data: data });
    })
    .catch(err => {
      res
        .status(500)
        .json({ success: false, message: "Error retrieving Post with id=" + _id });
    });
}

// Get Posts by the userID
exports.getUserPosts = async (req, res) => {
  const user_id = req.params.id;
  await Posts.find({ user_id: user_id })
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Posts with userID  " + user_id });
      else res.json({ successs: true, data: data });
    })
    .catch(err => {
      res
        .status(500)
        .json({ success: false, message: "Error retrieving Post with userID =" + user_id });
    });
}

// Update a Posts by the id in the request
exports.updatePost = async (req, res) => {
  const _id = req.params.id;
  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: "Data to update can not be empty!"
    });
  }

  await Posts.findByIdAndUpdate(_id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).json({
          success: false,
          message: `Cannot update Post with id=${_id}. Maybe Post was not found!`
        });
      } else res.json({ success: true, message: "Post was updated successfully." });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: "Error updating Post with id=" + _id
      });
    });
}

// Delete a Post with the specified id in the request
exports.deletePost = async (req, res) => {
  const _id = req.params.id;
  await Posts.findByIdAndRemove(_id)
    .then(data => {
      if (!data) {
        res.status(404).json({
          success: false,
          message: `Cannot delete Post with id=${_id}. Maybe Post was not found!`
        });
      } else {
        res.json({
          success: true,
          message: "Post was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: "Could not delete Post with id=" + _id
      });
    });
}

// Delete all Posts from the database.
exports.deleteAllPosts = async (req, res) => {
  await Posts.deleteMany({})
    .then(data => {
      res.json({
        success: true,
        message: `${data.deletedCount} Posts were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message:
          err.message || "Some error occurred while removing all Posts."
      });
    });
}

// Update a Posts by the id in the request
exports.addRefCount = async (req, res) => {
  const _id = req.params.id;
  // 0: AddLikes, 1: AddVotes, 2: SendFeedContent
  const dataType = req.params.type;

  await Posts.findById(_id)
    .exec((err, data) => {
      if (err) {
        res.status(500).json({
          success: false,
          message:
            err.message || "Some error occurred while removing all Posts."
        });
      }

      if (!data) {
        res.json({
          success: false,
          message: "Post not found!"
        });
      }

      var isExist = false;
      if (dataType == 0) {
        // Validate request
        if (!req.body.user_id) {
          return res.json({
            success: false,
            message: "UserID can not be empty!"
          });
        }

        const len = data.likes_users.length;
        for (let i = 0; i < len; i++) {
          if (data.likes_users[i] == req.body.user_id) {
            isExist = true;
            break;
          }
        }

        if (isExist) {
          res.json({
            success: false,
            message: "You have already accept for this Post!"
          });
        } else {
          data.likes_users.push(req.body.user_id);
          data.save();

          res.json({
            success: true,
            message: "Accepted successlly!"
          });
        }
      } else if (dataType == 1) {
        // Validate request
        if (!req.body.user_id) {
          return res.json({
            success: false,
            message: "UserID can not be empty!"
          });
        }

        const len = data.vote_users.length;
        for (let i = 0; i < len; i++) {
          if (data.vote_users[i] == req.body.user_id) {
            isExist = true;
            break;
          }
        }

        if (isExist) {
          res.json({
            success: false,
            message: "You have already accept for this Post!"
          });
        } else {
          data.vote_users.push(req.body.user_id);
          data.save();

          res.json({
            success: true,
            message: "Accepted successlly!"
          });
        }
      } else if (dataType == 2) {
        // Validate request
        if (!req.body.feed) {
          return res.json({
            success: false,
            message: "Data can not be empty!"
          });
        }
        const len = data.feed.length;
        for (let i = 0; i < len; i++) {
          if (data.feed[i].user_id == req.body.user_id) {
            isExist = true;
            break;
          }
        }

        if (isExist) {
          res.json({
            success: false,
            message: "You sent feed already for this Post!"
          });
        } else {
          data.feed.push(req.body.feed);
          data.save();

          res.json({
            success: true,
            message: "Accepted successlly!"
          });
        }
      }
    });
}