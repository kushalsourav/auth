const express = require("express");
const bCrypt = require("bcryptjs");
const jsonWebToken = require("jsonwebtoken");

const dataBase = require('./db');


const app = express();
const port = process.env.port || 8000;
const Secret_JWT_TOKEN = "adsdfsfwewfwe";

app.use(express.json())
app.use(express.urlencoded());

app.get('/', (req,res) => {
    res.send("This is auth page")
})

app.post('/user/signup', (req,res) => {
    if(!req.body.email || !req.body.password || !req.body.username) {
        res.json({success: false, eror: "Send needed params"})
        return
    }
  dataBase.User.create({
    email: req.body.email,
    username: req.body.username,
    password : bCrypt.hashSync(req.body.password),
  }).then((user) => {
       console.log(user)
       const token = jsonWebToken.sign({id: user._id, email: user.email}, Secret_JWT_TOKEN)
       res.json({success:true, token: token})
  }).catch((err) => {

    if(err.keyPattern.email === 1) {
        res.json({success:false, message: "email already exists"})
    } else {
        res.json({success:false, error: err})
    }
 
  })
})

app.post('/user/login', (req,res) => {
    if(!req.body.email || !req.body.password) {
        res.json({success: false, eror: "Send needed params"})
        return
    }
    console.log("Email received:", typeof(req.body.email));
    dataBase.User.findOne({
        email: req.body.email
      }).then((user) => {
        if(!user) {
            res.json({success:false , error:"user does not exist"})
        } else {
            console.log(req.body.password, user.password)
            if(!bCrypt.compareSync(req.body.password, user.password)) {
                res.json({success:false, error: "password doesnt match"})
            } else {
                console.log(user)
                const token = jsonWebToken.sign({id: user._id, email: user.email}, Secret_JWT_TOKEN)
                res.json({success:true, token: token, result: "Login succesfull", user:user})
            }
        }
    }).catch((err) => {
        res.json({success: false,error: err})
    })
    
})




















app.listen(port, () => {
  console.log("server loading in : " + port)
})

