const express = require('express');

const router = express.Router();
const posts = require('../controllers/PostsController.js');

router.post('/posts/', posts.createPost);
router.get('/posts/', posts.getAllPostsList);
router.get('/posts/:id', posts.getPost,);
router.get('/user/:id/posts', posts.getUserPosts);
router.put('/posts/:id', posts.updatePost);
router.delete('/posts/:id', posts.deletePost);
router.delete('/posts/', posts.deleteAllPosts);

//:type => enum {0: AddLikes, 1: AddVotes, 2: SendFeedContent} 
router.put('/posts/:id/:type', posts.addRefCount);

module.exports = router;