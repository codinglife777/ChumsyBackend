const mongoose = require("mongoose");

const unreadMsgSchema = mongoose.Schema({
    roomid: {
        type: String,
    },
    userid: {
        type: String
    },
    messageid: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

unreadMsgSchema.virtual('id').get(() => this._id);

unreadMsgSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model("unread_messages", unreadMsgSchema);