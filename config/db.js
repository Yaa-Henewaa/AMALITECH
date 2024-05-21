require('dotenv').config();
const mongoose = require('mongoose');
// const uri = process.env.MONGODB_URI;
 
const connect = mongoose.connect("mongodb://localhost:27017/SignUp");

connect.then(() => {
    console.log("Database connected successfully");
})
.catch(() => {
    console.log("Database cannot be connected");
});

// mongoose
// .connect(uri,{
//     // useNewUrlParser: true,
//     // useUnifiedTopology: true,
// })
// .then(() => {
//     console.log("DB Connected");
// })
// .catch((err) => console.log(err));
