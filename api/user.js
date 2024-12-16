const express = require('express');
const router = express.Router();

const sendMail = require('../hooks/emailfunction');
const User = require('./../models/User');

//user verification model
const UserVerification = require('./../models/Userverification');

//email handling
const nodemailer = require('nodemailer');

const {v4: uuidv4} = require("uuid");

//environment variables
require('dotenv').config();

//password handling
const bcrypt = require('bcrypt');

//nodemailer stuff
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.PASS,
    }
})

//Testing success
transporter.verify((error, success) => {
    if(error) {
        console.log(error);
    }else {
        console.log("Ready for messages");
        console.log(success);
    }
})

//signup
router.post('/signup', (req,res) => {
    let {firstname,lastname,email,password} = req.body;
    firstname = firstname.trim();
    lastname = lastname.trim();
    email = email.trim();
    password = password.trim();


    if(firstname == "" || lastname == "" || email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty input fields"
        });
    }else if(!/^[a-zA-Z ]*$/.test(firstname)){
        res.json({
            status: "FAILED",
            message: "Invalid name format"
        })    
    }else if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
        res.json({
            status: "FAILED",
            message: "INVALID EMAIL FORMAT"
        })
            
    }else if(!/^[a-zA-Z ]*$/.test(lastname)){
        res.json({
            status: "FAILED",
            message: "Invalid name format"
        })    
    }else if (password.length < 0) {
        res.json({
            status: "FAILED",
            message: "Password is too short!"
        })
    }else {
        //checking if user already exists
        User.find({email}).then(result => {
            if(result.length){
                //A user already exist
                res.json({
                    status: "FAILED",
                    message: "User with provided email already exists"

                })
            }else{
                //create a user


                //password handling
                const saltRounds = 10;
                bcrypt.hash(password,saltRounds).then(hashedPassword => {
                    const newUser = new User({
                        firstname,
                        lastname,
                        password: hashedPassword,
                        email,
                        verified: false,

                    });
                    newUser.save().then(result => {
                     //handle account verification
                      res.json({
                        status: "SUCCESS",
                        message: "SignUp succesful",
                        data: result,
                      })
                    })
                    .catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "Signup unsuccessful",
                            
                        })
                    })

                })
                .catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occured while hashing"
                    })
                })

            }


        }).catch(err => {
            console.log(err);
            res.json({
                status: "FAILED",
                message: "An error occurred"
            })
        })

    }


})

//login
router.post('/login', (req,res) => {
    let {email,password} = req.body;
    password = password.trim();
    email = email.trim();

    if(email == "" || password == ""){
        res.json({
            status: "FAILED",
            message: "Empty Credentials supplied"

        })
    }else {
        User.find({email})
        .then(data => {
            if(data.length){
                //user exists

                const hashedPassword = data[0].password;
                bcrypt.compare(password,hashedPassword).then(result =>{
                    if(result){
                        //password match

                        res.json({
                            status: "SUCCESS",
                            message: "login successful",
                            data: data
                        })
                    }else{
                        res.json({
                            status: "FAILED",
                            message: "Invalid password entered",
                            
                        })
                    }
                })
                .catch(err => {
                    res.json({
                        status: "FAILED",
                        message: " An error occurred while comparing passwords"
                    })
                   
                })

            }else{
                res.json({
                    status: "FAILED",
                    message: "Invalid credentials entered"
                })
            }
        })
        .catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while checking for existing user"
            })
        })
    }

})


router.post('/forgotPassword', async (req,res,next) => {
    //Get user based on provided Email
    const user =  await User.findOne({email: req.body.email})

    if(!user) {
        res.json({
            status: "FAILED",
            message: "User cannot be found"

        })
    }
    console.log(user);


    const resetToken = user.createResetPasswordToken();
    await user.save({validateBeforeSave: false});

    //Sending token back to user email
    const resetUrl = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`;
    const message = `Password reset recieved, use the link below\n\n${resetUrl}`

    try{
        await sendMail({
            email: user.email,
            subject: "Request to change password",
            message
        })
    }catch(err){
        user.passwordResetToken = undefined
        user.passwordResetTokenExpires = undefined
        await user.save({validateBeforeSave:false})

        return next(err)
    }

})

router.post('/resetPassword', async (req,res,next) => {
    // check if the user exists and token is still valid
    const tokenBuffer = crypto.randomBytes(32);
    // Convert the buffer to a hexadecimal string
    const token = tokenBuffer.toString('hex');
    const user = await User.findone({ passwordResetToken: token,
        passwordResetTokenExpires: { $gt: Date.now()}
    })
    if(!user) return next(err)
    
    if(req.body.password == "" && req.body.confirmPassword == "" || req.body.password != req.body.confirmPassword){
        console.log(err)
        return next(err)
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined
    user.passwordResetTokenExpires = undefined;
    user.passwordChangedAt = Date.now();
    console.log(user)

    try{
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(user.password, salt);
        user.password = hash
        await user.save()
        console.log(user)
    }catch(err){
        console.log(err)
        next(err)
    }

    res.status(200).json({
        status: "SUCCESS",
        message: "login successful",
        data: data
    })

})



module.exports = router;