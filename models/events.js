const mongoose = require("mongoose");

const EventsSchema = mongoose.Schema({
    id_user: {
        type: mongoose.Types.ObjectId,
    },
    category: Array,
    beginning_time: {
        type: String
    },
    duration: {
        type: String
    },
    location: {
        type: String
    },
    price: {
        type: Object
    },
    chumsy_number: {
        type: Number
    },
    need_master: {
        type: Boolean,
        default: false
    },
    with_whom: {
        type: String
    },
    level: {
        type: String
    },
    type: {
        type: String
    },
    gender: {
        type: String
    },
    age: {
        type: String
    },
    description: {
        type: String
    }
}, { timestamps: true });

EventsSchema.virtual('id').get(() => this._id);

EventsSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model("events", EventsSchema);