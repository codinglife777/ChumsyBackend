const mongoose = require("mongoose");

const SupportSchema = mongoose.Schema({
    id_user: {
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