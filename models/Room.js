const mongoose = require("mongoose");

const roomSchema = mongoose.Schema({
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

roomSchema.virtual('id').get(() => this._id);

roomSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model("rooms", roomSchema);