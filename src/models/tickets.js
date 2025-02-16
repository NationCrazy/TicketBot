const mongoose = require('mongoose');

const ticketsSchema = new mongoose.Schema({
    uuid: {
        type: String,
        index: true,
        required: true
    },
    createdBy: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    channelID: {
        type: String,
        required: true
    },
    addedUsers: {
        type: Array,
        required: false
    },
    claimedBy: {
        type: String,
        required: false,
        default: null
    },
    status: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Tickets', ticketsSchema);