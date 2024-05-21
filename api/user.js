const express = require('express');
const router = express.Router();

const User = require('./../models/User');

//password handling
const bcrypt = require('bcrypt');

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
                        email

                    });
                    newUser.save().then(result => {
                        res.json({
                            status: "sucess",
                            message: "Signup successful!",
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

module.exports = router;