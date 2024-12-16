const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');


const UserSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    verified: Boolean,
    passwordChangedAt: {
        type: Date
    },
    passwordResetToken:{
        type:String
    },
    passwordResetTokenExpires:{
        type: Date
    }
});


UserSchema.methods.createResetPasswordToken = function(){
        const tokenBuffer = crypto.randomBytes(32);
        // Convert the buffer to a hexadecimal string
        const resetToken = tokenBuffer.toString('hex');
        this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
        return resetToken;
}

const User = mongoose.model('Usersdb',UserSchema);
module.exports = User;