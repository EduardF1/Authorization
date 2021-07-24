require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// --> No longer needed as per the upgrade to hashing, kept for review
//const encrypt = require('mongoose-encryption');
//const md5 = require('md5');

const app = express();
const port = 4200;
const options = {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
}

//  Server setup
app.use(express.static(`${__dirname}/public`));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

//  DB connection setup
try {
    mongoose.connect(`${process.env.DB_URL}`, options);
} catch (e) {
    console.error(e);
}

// Define User Schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Missing username']
    },
    password: {
        type: String,
        required: [true, 'Missing password']
    }
});

// Password Encryption --> No longer needed as per the upgrade to hashing, kept for review
// userSchema.plugin(encrypt, {secret: `${process.env.SECRET}`, encryptedFields: ['password']});

// Define Schema Model
const User = new mongoose.model('User', userSchema);


app.get('/', ((req, res) => {
    res.render('home');
}));

app.get('/login', ((req, res) => {
    res.render('login');
}));

app.get('/register', ((req, res) => {
    res.render('register');
}));

app.post('/register', ((req, res) => {

    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        const newUser = new User({
            email: req.body.username,
            password: hash
            //password: md5(req.body.password)
        });
        newUser.save((err => {
            if (!err) {
                res.render('secrets');
            } else {
                console.error(err);
            }
        }));
    });
}));

app.post('/login', ((req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    //const password = md5(req.body.password);

    User.findOne({email: username}, (err, foundUser) => {
        if (!err && foundUser) {
            bcrypt.compare(password, foundUser.password, (err, comparisonResult) => {
                if (comparisonResult) {
                    res.render('secrets');
                }
            });
        } else {
            console.error(err);
        }
    });
}));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});