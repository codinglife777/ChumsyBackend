const mongoose = require("mongoose");

const UnreadMsgSchema = mongoose.Schema({
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

UnreadMsgSchema.virtual('id').get(() => this._id);

UnreadMsgSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model("unread_messages", UnreadMsgSchema);