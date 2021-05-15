//Necessary imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Defining a user schema
const User = new Schema(
    {
        email: {
            type: String,
            required: false,
            unique: true
        },
        password: {
            type: String,
            required: false,
        },
        isTwoFactorSet: {
            type: Boolean,
            required: false,
            default: false
        },
        secret: {
            type: Object,
            required: false
        }
    },
    {
        timestamps: true
    }
)

//Exporting User schema
module.exports = mongoose.model('User', User);