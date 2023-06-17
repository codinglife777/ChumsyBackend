const mongoose = require("mongoose");

const SupportSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
    },
    contents: {
        type: String
    }
}, { timestamps: true });

SupportSchema.virtual('id').get(() => this._id);

SupportSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model("Support", SupportSchema);