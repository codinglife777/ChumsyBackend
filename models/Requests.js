const mongoose = require("mongoose");

const RequestsSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
    },
    id_requested: {
        type: mongoose.Types.ObjectId
    },
}, { timestamps: true });

RequestsSchema.virtual('id').get(() => this._id);

RequestsSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model("requests", RequestsSchema);