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


module.exports = {
    getAccountById,
    deleteAccount,
    updateAccount,
    insertAccount, 
    getAllAccount,
    getAccountByOwner
}