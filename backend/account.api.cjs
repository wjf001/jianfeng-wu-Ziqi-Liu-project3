const cookieHelper = require('./cookie.helper.cjs');

const express = require('express');
const router = express.Router();
const AccountModel = require('./db/account.model.cjs')

function generatePassword(charset, length) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numerals = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let characters = '';
    let password = '';

    if (charset.includes('alphabet')) {
        characters += alphabet;
    }
    if (charset.includes('numerals')) {
        characters += numerals;
    }
    if (charset.includes('symbols')) {
        characters += symbols;
    }

    for (let i = 0; i < length; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
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
        finalPassword = generatePassword(charset, length);
    }

    if (!finalPassword) {
        return res.status(400).send("Password generation criteria not met!");
    }

    const newAccount = {
        siteAddress,
        password: finalPassword,
        owner: username,
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

        const accountUpdateResponse = await AccountModel.updateAccount(accountId, accountData);
        return res.send('Successfully updated account ID ' + accountId)
    } catch (error) {
        res.status(400);
        return res.send(error);
    }
})



// -> /pokemon/pikachu => req.params.pokemonName === pikachu
// -> /pokemon/pikachu?food=banana
router.get('/:accountId', async function(req, res) {
    const accountId = req.params.accountId;

    try {
        const getAccountResponse = await AccountModel.getAccountById(accountId);
        return res.send(getAccountResponse);
    } catch (error) {
        res.status(400);
        return res.send(error);
    }

    // res.status(404);
    // return res.send("Pokemon with name " + pokemonName + " not found :(");
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

        const deleteAccountResponse = await AccountModel.deleteAccount(accountId);
        return res.send(deleteAccountResponse);
    } catch (error) {
        res.status(400);
        return res.send(error);
    }
})

// localhost:8000/api/pokemon?name=pikachu
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
    const { toUserId } = req.body;
    const fromUsername = cookieHelper.cookieDecryptor(req);
    console.log('---------------------------');
    if (!fromUsername) {
        return res.status(401).send("You need to be logged in to share passwords!");
    }

    try {
        const fromUser = await AccountModel.getAccountByOwner(fromUsername);
        const toUser = await AccountModel.getAccountById(toUserId);
        console.log(fromUser, toUser);

        if (!toUser) {
            return res.status(404).send("User not found");
        }

        // Assume sharing requires inserting a new share request into both user records
        const shareRequest = {
            from: fromUser._id,
            to: toUserId,
            status: 'pending'
        };

        // Add share request to sender
        fromUser.shareRequests.push(shareRequest);
        await fromUser.save();

        // Optionally, notify the receiver, model pending
        res.status(200).send("Share request sent successfully");
    } catch (error) {
        res.status(500).send("Error processing share request: " + error.message);
    }
});



// Endpoint to accept or reject a share request
router.post('/respondToShareRequest', async (req, res) => {
    const { requestId, accept } = req.body;
    const username = cookieHelper.cookieDecryptor(req);

    if (!username) {
        return res.status(401).send("You need to be logged in to respond to share requests!");
    }

    try {
        const user = await AccountModel.getAccountByOwner(username);
        const request = user.shareRequests.id(requestId);

        if (!request) {
            return res.status(404).send("Request not found");
        }

        request.status = accept ? 'accepted' : 'rejected';
        await user.save();

        res.status(200).send(`Request ${accept ? 'accepted' : 'rejected'}`);
    } catch (error) {
        res.status(500).send("Error processing the request: " + error.message);
    }
});


module.exports = router;