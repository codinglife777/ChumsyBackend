const mongoose = require("mongoose");

const PostsSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
    },
    photo_intro: {
        type: String
    },
    photo: {
        type: String
    },
    is_shared: {
        type: Boolean
    },
    likes_users: { type: [] },
    vote_users: { type: [] },
    feed: [{
        user_id: { type: mongoose.Types.ObjectId },
        content: { type: String }
    }]

}, { timestamps: true });

PostsSchema.virtual('id').get(() => this._id);

PostsSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model("posts", PostsSchema);