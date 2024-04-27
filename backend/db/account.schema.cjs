const Schema = require('mongoose').Schema;

const shareRequestSchema = new Schema({
    from: { type: Schema.Types.ObjectId, ref: 'Password', required: true },
    to: { type: Schema.Types.ObjectId, ref: 'Password', required: true },
    status: { type: String, default: 'pending' } // Possible values: 'pending', 'accepted', 'rejected'
});

module.exports = new Schema({
    siteAddress: {
        type: String,
        required: true,
    },
    password: String,
    owner: String,
    created: {
        type: Date,
        default: Date.now
    },
    originalOwner: String,
    isShared: Boolean
}, { collection : 'passwordSpr2024' });