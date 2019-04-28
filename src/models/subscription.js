const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubscriptionSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    types: {
        type: [String],
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

SubscriptionSchema.index({code: 1, email: 1}, {unique: true});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
