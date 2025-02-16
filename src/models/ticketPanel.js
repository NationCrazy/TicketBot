const mongoose = require('mongoose');

const ticketPanelSchema = new mongoose.Schema({
    uuid: {
        type: String,
        index: true,
        required: true
    },
    messageID: {
        type: String,
        required: true
    },
    channelID: {
        type: String,
        required: true
    },
    embed: {
        type: Object,
        required: true
    },
    categories: {
        type: Array,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TicketPanel', ticketPanelSchema);