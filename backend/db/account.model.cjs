const model = require('mongoose').model;

const AccountSchema = require('./account.schema.cjs');

const AccountModel = model('account', AccountSchema);

function insertAccount(account) {
    return AccountModel.create(account);
}

function getAllAccount() {
    return AccountModel.find().exec();
}

function getAccountById(id) {
    return AccountModel.findById(id).exec();
}

function deleteAccount(id) {
    return AccountModel.deleteOne({_id: id})
}

function updateAccount(id, account) {
    return AccountModel.findOneAndUpdate({_id: id}, account)
}

function getAccountByOwner(owner) {
    return AccountModel.find({
        owner: owner,
    }).exec();
}

function createShareRequest(fromId, toId) {
    return AccountModel.findById(fromId).then(account => {
        account.shareRequests.push({ from: fromId, to: toId });
        return account.save();
    });
}

function respondToShareRequest(accountId, requestId, accept) {
    return AccountModel.findById(accountId).then(account => {
        const request = account.shareRequests.id(requestId);
        if (request) {
            request.status = accept ? 'accepted' : 'rejected';
            return account.save();
        } else {
            throw new Error('Share request not found');
        }
    });
}


module.exports = {
    getAccountById,
    deleteAccount,
    updateAccount,
    insertAccount, 
    getAllAccount,
    getAccountByOwner,
    createShareRequest,
    respondToShareRequest
}