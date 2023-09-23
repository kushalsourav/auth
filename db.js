// getting-started.js
const mongoose = require('mongoose');

const dataBaseUrl = 'mongodb+srv://ashborn:ashborn@habit.ku84wy2.mongodb.net/habit-tracker';
mongoose.connect(dataBaseUrl, {useNewUrlParser  :true})
// main().catch(err => console.log(err));

// async function main() {
//   await mongoose.connect('mongodb+srv://ashborn:ashborn@habit.ku84wy2.mongodb.net/habit-tracker');

//   // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
// }

const userSchema = new mongoose.Schema({
    email : {
        type: String,
        // unique: true,
        // required: true,
        // lowercase: true,
        // trim: true
    },
    password : {
        type:String,
        required: true
    }
}, {collection: "habits"})
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
    console.log('DB connected')
})

exports.User = mongoose.model("user", userSchema)