const mongoose = require("mongoose");

const FaqsSchema = mongoose.Schema({
    title: {
        type: String
    },
    contents: {
        type: String
    },

}, { timestamps: true });

FaqsSchema.virtual('id').get(() => this._id);

FaqsSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model("faqs", FaqsSchema);