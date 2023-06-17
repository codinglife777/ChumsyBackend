const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema({
    roomid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },
    sender: {
        type: String
    },
    type: {
        type: String,
        enum: ['text', 'photo', 'video', 'audio', 'file', 'system', 'calling'],
        default: 'text'
    },
    text: {
        type: String,
        // if calling: calling, received, rejected, ended
    },
    edited: {
        type: Boolean,
        default: false,
    },
    data: {
        type: String,
        // video | audio | photo | file path
        // or receivers by comma
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

MessageSchema.virtual('id').get(function () {
    return this._id;
});

MessageSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model("messages", MessageSchema);