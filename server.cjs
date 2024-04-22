const express = require('express');
const account = require('./backend/account.api.cjs');
const users = require('./backend/user.api.cjs')
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')
const path = require('path')

const app = express();


const mongoDBEndpoint = 'mongodb+srv://class:class123@cluster0.53ajqns.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect(mongoDBEndpoint, {
    useNewUrlParser: true,
})

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error connecting to MongoDB:'));


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/account', account);
app.use('/api/users', users);


let frontend_dir = path.join(__dirname, 'dist')

app.use(express.static(frontend_dir));
app.get('*', function (req, res) {
    console.log("received request");
    res.sendFile(path.join(frontend_dir, "index.html"));
});

app.listen(process.env.PORT || 8000, function() {
    console.log("Starting app now...")
})