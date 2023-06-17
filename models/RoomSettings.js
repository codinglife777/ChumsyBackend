const mongoose = require("mongoose");

const roomSettingsSchema = mongoose.Schema({
    roomid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    key: {
        type: String,
        enum: ['mute', 'role'],
        default: 'mute'
    },
    value: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

roomSettingsSchema.virtual('id').get(() => this._id);

roomSettingsSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model("room_settings", roomSettingsSchema);