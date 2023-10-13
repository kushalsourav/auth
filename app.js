const express = require("express");
const bCrypt = require("bcryptjs");
const jsonWebToken = require("jsonwebtoken");
const cors = require("cors");


const dataBase = require('./db');


const app = express();
app.use(cors())
const port = process.env.port || 8000;
const Secret_JWT_TOKEN = "adsdfsfwewfwe";

app.use(express.json())
app.use(express.urlencoded());

app.get('/', (req, res) => {
    res.send("This is auth page")
})

app.post('/user/signup', (req, res) => {
    if (!req.body.email || !req.body.password || !req.body.username) {
        res.json({ success: false, error: "Please fill the form" })
        return
    }
    dataBase.User.create({
        email: req.body.email,
        username: req.body.username,
        password: bCrypt.hashSync(req.body.password),
    }).then((user) => {
        const token = jsonWebToken.sign({ id: user._id, email: user.email }, Secret_JWT_TOKEN)
        res.json({ success: true, token: token })
    }).catch((err) => {

        if (err.keyPattern.email === 1) {
            res.json({ success: false, message: "email already exists" })
        } else {
            res.json({ success: false, error: err })
        }
    })
})

app.post('/user/login', (req, res) => {
    if (!req.body.email || !req.body.password) {
        return new Response(
            404,
            {},
            {
                error: ["please enter both email and password"]
            },
            res.json({ success: false, error: "Send needed params" }),
            res.status(404)
        )
    }
    dataBase.User.findOne({
        email: req.body.email
    }).then((user) => {
        if (!user) {
            res.json({ success: false, error: "user does not exist" })
        } else {
            console.log(req.body.password, user.password)
            if (!bCrypt.compareSync(req.body.password, user.password)) {
                res.json({ success: false, error: "password doesnt match" })
            } else {
                const token = jsonWebToken.sign({ id: user._id, email: user.email }, Secret_JWT_TOKEN)
                res.json({ success: true, token: token, result: "Login succesfull", user: user })
            }
        }
    }).catch((err) => {
        res.json({ success: false, error: err })
    })

})


const checkToken = (req, res, next) => {

    const header = req.headers['authorization'];
    if (typeof header !== 'undefined') {
        jsonWebToken.verify(header, Secret_JWT_TOKEN, (err, authorizedData) => {
            if (err) {
                res.status(403).json({ error: "Inavlid token" });
            } else {
                req.token = authorizedData
                next()
            }
        })
    } else {
        res.status(401).json({ error: "authentication required" })
    }

}
app.use(checkToken, (req, res, next) => {
    dataBase.User.findById(
        req.token.id,).then((user) => {
            if (!user) {
                res.json({ success: false })
            }
            else {
                req.habits = user.habits
                next()
            }
        })
})
app.post('/user/habits/', checkToken ,(req, res) => {
    const { name, dateAdded,icon,colorCode } = req.body;
    

    dataBase.User.findByIdAndUpdate(
        req.token.id,
        {
            $push: {
                habits: {
                    name: name,
                    dateAdded: dateAdded,
                    icon : icon,
                    colorCode:colorCode
                }
            },
        },
        { new: true }
    ).then((user) => {
        if (!user) {
            res.sendStatus(403)
        } else {
            res.json({ success: true, result: "added succesfull", user: user })
        }
    })
})
app.get('/user/habits/', checkToken, (req, res, next) => {
    dataBase.User.findById(
        req.token.id,).then((user) => {
            if (!user) {
                res.json({ success: false })
            }
            else {
                res.json({ success: true, habits: user.habits })
                req.habits = user.habits
                next()
            }
        })

})

app.get('/users/habit/:habitId', checkToken, async (req, res) => {
    const habitId = req.params.habitId;
    try {
        const user = await dataBase.User.findById(req.token.id);
          if(!user) {
            res.status(404).json({error: "user not found"})
          }
          const habit = user.habits.find(h => h._id.equals(habitId));
          if(!habit) {
            res.status(404).json({error: "habit not found"})
          }
          res.json({habit:habit})
    } catch (error) {
        if(error) {
            res.status(500).json({error:"server error"})
        }
    }
})
app.post('/users/habit/delete/:habitId', checkToken, async (req, res) => {
    const habitId = req.params.habitId;
    try {
        await dataBase.User.findByIdAndUpdate(req.token.id, 
            {
                $pull: {
                    habits: {
                        _id: habitId
                    }
                },
            },
            ).then((user) => {
               if(!user) {
                res.status(404).json({message:"user not found"})
               }
               res.json({success: true,message: "successfully removed", habits:user.habits})
            })
         
    } catch (error) {
        if(error) {
            res.status(500).json({error:"server error"})
        }
    }
})


app.post('/users/habit/update/:habitId', checkToken, async (req, res) => {
    const { name, dateAdded, icon, colorCode } = req.body;
    const habitId = req.params.habitId;
    try {
        await dataBase.User.findByIdAndUpdate(req.token.id).then((user) => {
               if(!user) {
                res.status(404).json({message:"user not found"})
               }
            
                const habitIndex = user.habits.findIndex(habit => habit._id.equals(habitId))
                user.habits[habitIndex].set({name,dateAdded, icon,colorCode})
                 user.save()
               res.json({message: "successfully updated", habits:user.habits})
            })
         
    } catch (error) {
        if(error) {
            res.status(500).json({error:"server error"})
        }
    }
})


// protected routes


//toekn eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTAxM2E3ZGFjYmEwNWRhYTRkNDZhYyIsImVtYWlsIjoia3VzaGFsc291cmF2MkBnbWFpbC5jb20iLCJpYXQiOjE2OTU4OTE2MTd9.fQ2zo_aQACSFevocDYFZS30VWBOvdLQy2jHQAHWnPkk









app.listen(port, () => {
    console.log("server loading in : " + port)
})

