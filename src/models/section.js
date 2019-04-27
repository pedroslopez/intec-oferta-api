const mongoose = require('mongoose');
const { Schema } = mongoose;

const SectionSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    credits: {
        type: String
    },
    professor: {
        type: String
    },
    room: {
        type: String
    },
    schedule: {
        type: [String],
        required: true
    }
}, { timestamps: true });

SectionSchema.index({code: 1, section: 1}, {unique: true});

module.exports = mongoose.model('Section', SectionSchema);
