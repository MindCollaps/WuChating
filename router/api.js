const router = require("express").Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const verify = require("../middleware/verifyLoginToken")

const User = require("../models/User");
const Message = require("../models/Message");

router.get("/auth", verify, async (req, res) => {
    res.status(200).json({status: 200, message: "auth!", data: []})
});

router.get("/userid", verify, async (req, res) => {
    res.status(200).json({status: 200, message: "Fetched new messages!", data: {userID: req.user.userID}});
});

router.post("/login", async (req, res) => {
    //Check if the user is in db
    const user = await User.findOne({username: req.body.username.toLowerCase()});
    if (!user) return res.status(200).json({status: 400, message: "Username or password is wrong!"});

    //Check if password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(200).json({status: 400, message: "Username or password is wrong!"});


    res.status(200).json({status: 200, message: "login successful", data: {token: await getAccessToken(user)}});
});

router.post("/checkuserid", async (req, res) => {
    const user = await User.findOne({userID: req.body.userID});
    if(!user) return res.status(200).json({status: 200, message: "ID found", data: false});


    res.status(200).json({status: 200, message: "ID found", data: true});
});

router.post("/message", verify, async (req, res) => {
    const message = req.body.message;
    const dest = req.body.dest;
    const date = req.body.date;

    const destUser = await User.findOne({userID: dest});
    if(!destUser) return res.status(200).json({status: 400, message: "The recipient doesnt exist"});

    const smessage = new Message({
        autor: req.user._id,
        recipient: destUser._id,
        message: message,
        date: date
    });

    await smessage.save();
    res.status(200).json({status: 200, message: "Message sent!"})
});

router.get("/message", verify, async (req, res) => {
    const data = await Message.find({recipient: req.user._id});
    if(!data) return res.status(200).json({status: 200, message: "No new messages!", data: []});
    else if(data.length == 0)return res.status(200).json({status: 200, message: "No new messages!", data: []});

    const ar = [];

    for (let d of data) {
        const autorUserID = (await User.findOne({_id: d.autor})).userID;
        await d.remove();
        d = d.toJSON();
        delete d._id;
        delete d.recipient;
        delete d.__v;
        d.autor = autorUserID;

        ar.push(d);
    }

    res.status(200).json({status: 200, message: "Fetched new messages!", data: ar});
});

router.post("/register", async (req, res) => {
    const password = req.body.password;
    const username = req.body.username.toLowerCase();

    const eUser = await User.findOne({username: username});
    if(eUser)return res.status(200).json({status: 400, message: "That user already exists!"});

    let userId = makeToken(4);

    while (await User.findOne({userID: userId})){
        userId = makeToken(4);
    }

    const hashPassword = await hashPw(password);

    const nUser = new User({
        username: username,
        userID: userId,
        password: hashPassword
    })

    const cUser = await nUser.save();

    res.status(200).json({status: 200, message: "User created!", data: {token: await getAccessToken(cUser)}})
});

async function getAccessToken(user){
    const time = new Date();
    const token = await jwt.sign({_id: user._id, ctime: time}, process.env.TOKEN_SECRET);

    return token;
}

function makeToken(length) {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

async function hashPw(pw) {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(pw, salt);
    return hashPassword;
}

module.exports = router;