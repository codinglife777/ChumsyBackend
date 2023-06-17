const mongoose = require("mongoose");

const ReportSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
    },
    reported_user: {
        type: mongoose.Types.ObjectId,
    },
    contents: {
        type: String
    },
    photo: {
        type: String
    },
    is_solution: {
        type: Boolean
    }

}, { timestamps: true });

ReportSchema.virtual('id').get(() => this._id);

ReportSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model("report", ReportSchema);