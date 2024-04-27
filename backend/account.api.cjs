const cookieHelper = require('./cookie.helper.cjs');

const express = require('express');
const router = express.Router();
const AccountModel = require('./db/account.model.cjs');
const UserModel = require('./db/user.model.cjs');
const crypto = require('crypto');

function generatePassword(length, charset) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numerals = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let characters = '';

    if (charset.includes('alphabet')) {
        characters += alphabet;
    }
    if (charset.includes('numerals')) {
        characters += numerals;
    }
    if (charset.includes('symbols')) {
        characters += symbols;
    }

    let password = '';
    const byteSize = Math.ceil(length/3);
    const randomByte = crypto.randomBytes(byteSize);
    for (let i = 0; i < length; i++) {
        const randomVal = randomByte[i % byteSize];
        password += characters[randomVal % characters.length];
    }

    return password;
}

// /api/account/
router.post('/', async function(req, res) {
    const { siteAddress, password, charset, length } = req.body;
    const username = cookieHelper.cookieDecryptor(req);

    if (!username) {
        return res.status(401).send("You need to be logged in to put in a password!");
    }

    if (!siteAddress) {
        return res.status(400).send("Please insert a valid site address!");
    }

    let finalPassword = password;
    if (!password && charset && length >= 4 && length <= 50) {
        finalPassword = generatePassword(parseInt(length), charset);
    }

    if (!finalPassword) {
        return res.status(400).send("Password generation criteria not met!");
    }

    const newAccount = {
        siteAddress,
        password: finalPassword,
        owner: username,
        isShared: false,
        originalOwner: username,
    };

    try {
        const response = await AccountModel.insertAccount(newAccount);
        return res.send(response);
    } catch (error) {
        return res.status(400).send(error.message);
    }
});

// /api/pokemon/pikachu
// --> pkId => pikachu
router.put('/:accountId', async function(req, res) {
    const accountId = req.params.accountId;


    const accountData = req.body;
    const owner = cookieHelper.cookieDecryptor(req);

    if(!owner) {
        res.status(401);
        return res.send("You need to be logged in to create a account!")
    }

    if (!accountData.siteAddress || !accountData.password) {
        res.status(400);
        return res.send("You need to include the site address and password in your request");
    }

    try {
        // verify that this account is owned by this user
        const getAccountResponse = await AccountModel.getAccountById(accountId);
        if(getAccountResponse !== null && getAccountResponse.owner !== owner) {
            res.status(400);
            return res.send("You do not own this account!");
        }

        const accountUpdateResponse = await AccountModel.updateAccount({
            _id: accountId
        }, accountData);
        return res.send('Successfully updated account ID ' + accountId)
    } catch (error) {
        res.status(400);
        return res.send(error);
    }
})


router.get('/:accountId', async function(req, res) {
    const accountId = req.params.accountId;

    try {
        const getAccountResponse = await AccountModel.getAccountById(accountId);
        return res.send(getAccountResponse);
    } catch (error) {
        res.status(400);
        return res.send(error);
    }
})

router.delete('/:accountId', async function(req, res) {
    const accountId = req.params.accountId;
    const owner = cookieHelper.cookieDecryptor(req);

    if(!owner) {
        res.status(401);
        return res.send("You need to be logged in to create a account!")
    }

    try {
        const getAccountResponse = await AccountModel.getAccountById(accountId);
        if(getAccountResponse !== null && getAccountResponse.owner !== owner) {
            res.status(400);
            return res.send("You do not own this account!");
        }

        const deleteAccountResponse = await AccountModel.deleteAccount({ _id: accountId });
        return res.send(deleteAccountResponse);
    } catch (error) {
        res.status(400);
        return res.send(error);
    }
})

router.get('/', async function(req, res) {
    const owner = cookieHelper.cookieDecryptor(req);

    if(!owner) {
        res.status(401);
        return res.send("You need to be logged in to create a account!")
    }


    try {
        const allAccountResponse = await AccountModel.getAccountByOwner(owner);
        return res.send(allAccountResponse);
    } catch (error) {
        res.status(400);
        return res.send("Error inserting account into DB");
    }

})


// Endpoint to create a share request
router.post('/shareRequest', async (req, res) => {
    const { toUsername } = req.body;
    const fromUsername = cookieHelper.cookieDecryptor(req);
    if (!fromUsername) {
        return res.status(401).send("You need to be logged in to share passwords!");
    }

    try {
        const fromUserAccounts = await AccountModel.getAccountByOwner(fromUsername);
        const toUser = await UserModel.getUserByUsername(toUsername);

        if (!toUser) {
            return res.status(404).send("User not found");
        }
        fromUserAccounts.forEach(async (account) => {
            const newAccount = {
                ...account._doc,
                owner: toUsername,
                isShared: true,
            }
            delete newAccount._id;
                        
            await AccountModel.insertAccount(newAccount);
        })

        // Optionally, notify the receiver, model pending
        res.status(200).send("Share request sent successfully");
    } catch (error) {
        res.status(500).send("Error processing share request: " + error.message);
    }
});



// Endpoint to accept a share request
router.post('/acceptsharingrequest', async (req, res) => {
    const { acceptedUser, requestedUser } = req.body;
    const username = cookieHelper.cookieDecryptor(req);

    if (!username) {
        return res.status(401).send("You need to be logged in to respond to accept share requests!");
    }

    try {
        const acceptedUserAccounts = await AccountModel.getAccountByOwner(acceptedUser);
        const filteredAcceptedUserAccounts = acceptedUserAccounts.filter(account => (account.originalOwner === acceptedUser));

        filteredAcceptedUserAccounts.forEach(async account => {
            const newAccount = {
                ...account._doc,
                isShared: false,
                owner: requestedUser
            }
            delete newAccount._id;
            await AccountModel.insertAccount(newAccount);
        });

        acceptedUserAccounts.forEach(async account => {
            const newAccount = {
                ...account._doc,
                isShared: false
            }
            await AccountModel.updateAccount(
                { _id: newAccount._id },
                 newAccount);
        });
        res.status(200).send("succeed!");
    } catch (error) {
        res.status(500).send("Error processing the request: " + error.message);
    }
});

router.post('/rejectsharingrequest', async (req, res) => {
    const { requestId, accept } = req.body;
    const username = cookieHelper.cookieDecryptor(req);

    if (!username) {
        return res.status(401).send("You need to be logged in to respond to reject share requests!");
    }

    try {
        const userAccounts = await AccountModel.getAccountByOwner(username);
        userAccounts.forEach(async account => {
            if (account.isShared) {
                await AccountModel.deleteAccount(account._id);
            }
        });
        res.status(200).send("Succeed!");
    } catch (error) {
        res.status(500).send("Error processing the request: " + error.message);
    }
})


module.exports = router;