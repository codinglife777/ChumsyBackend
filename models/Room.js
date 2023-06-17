const mongoose = require("mongoose");

const RoomSchema = mongoose.Schema({
    members: [
        {
            type: String
        }
    ],
    image: {
        type: String,
    },
    name: {
        type: String,
    },
    isgroup: {
        type: Boolean,
        default: false
    },
    product_id: {
        type: String,
        default: null
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

RoomSchema.virtual('id').get(() => this._id);

RoomSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model("rooms", RoomSchema);