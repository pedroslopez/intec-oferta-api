const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChangeSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    field: {
        type: String
    },
    oldValue: {
        type: String
    },
    newValue: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Change', ChangeSchema);
