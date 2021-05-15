//Necessary Imports
const { User } = require('../models')
const speakeasy = require('speakeasy')
const QrCode = require('qrcode')

//For registering a new user
const register = async (req, res) => {
    const {
        email,
        password
    } = req.body;

    let status;
    let message;

    try {
        const user = new User({ email, password });
        await user.save();
        status = 200;
        message = 'Employee create successfully';
    } catch {
        console.log('Some error occured', err);
        console.log(err.stack);
        status = 400;
        message = 'Bad request';
    }

    res.status(status).send({ message });
}

//For enabling 2-Factor Authentication
const setup = async (req, res) => {
    //Getting Credentials for Validation
    const { email, password } = req.body;

    try {
        //Searching user based on EMAIL
        let user = await User.findOne({ email: email })

        if (!user) {//Checking if user found or not
            res.status(404).send({
                message: 'No user found with that email'
            })
        } else if (user.isTwoFactorSet) {//Checking whether 2FA is already setup
            res.status(400).send({
                message: '2FA Already Configured'
            })
        }
        else {
            //Checking the Credentails
            if (user.email === email && user.password === password) {
                //Generating Secret Key
                const secret = speakeasy.generateSecret({ name: "Yash TOTP Based Auth NodeJS" });

                //saving generated secret in user's record
                user.secret = secret;
                user.isTwoFactorSet = true;
                await user.save();
                QrCode.toDataURL(secret.otpauth_url, (err, data) => {
                    if (err) {
                        res.status(400).send({
                            message: 'Error ocurred while creating Qr code, Please try again'
                        })
                    } else {
                        res.status(200).send(`
                        <h1>Setup 2-Factor Authentication</h1>
                        <p>Scan below qr code in the Authenticator app</p>
                        <img src=${data} alt="Qr code not available"/>
                        <p>or add manually: ${secret.base32} </p>
                        `);
                    }
                })
            } else {
                //removing generated secret from user's record
                user.secret = undefined;
                user.isTwoFactorSet = false;
                await user.save();
                res.status(401).send({
                    message: 'Incorrect Credentials, Please try again'
                })
            }
        }
    } catch {
        console.log('Error occured: ', err)
        res.status(400).send({
            message: 'Bad request, Try Again'
        })
    }
}

//For verifying TOTP
const verify = async (req, res) => {
    //Getting Credentials for Validation
    const { email, userToken } = req.body;

    try {
        //Searching user based on EMAIL
        let user = await User.findOne({ email: email })

        //Checking if user exists or not
        if (!user) {
            res.status(404).send({
                message: 'No user found with that email'
            })
        } else { //User is present, now verify the totp
            const verified = speakeasy.totp.verify({
                secret: user.secret.base32,
                encoding: 'base32',
                token: userToken
            })
            res.status(200).send({ "success": verified })
        }
    } catch {
        console.log('Error occured: ', err)
        res.status(400).send({
            message: 'Bad request, Try Again'
        })
    }
}

//For disabling 2-Factor Authentication
const remove = async (req, res) => {
    //Getting Credentials for Validation
    const { email, userToken } = req.body;

    try {
        //Searching user based on EMAIL
        let user = await User.findOne({ email: email })

        //Checking if user exists or not
        if (!user) {
            res.status(404).send({
                message: 'No user found with that email'
            })
        } else if (!user.isTwoFactorSet) {
            res.status(404).send({
                message: '2FA is not configured for this account'
            })
        } else {
            const verified = speakeasy.totp.verify({
                secret: user.secret.base32,
                encoding: 'base32',
                token: userToken
            })
            // res.status(200).send({ "success": verified })
            if (verified) {
                //removing generated secret from user's record
                user.secret = undefined;
                user.isTwoFactorSet = false;
                await user.save();
                res.status(200).send({
                    message: '2FA turned off successfully'
                })
            } else {
                res.status(400).send({
                    message: 'Incorrect code, please try again'
                })
            }
        }
    } catch {
        console.log('Error occured: ', err)
        res.status(400).send({
            message: 'Bad request, Try Again'
        })
    }
}

//Exporting all the functions
module.exports = {
    register,
    setup,
    verify,
    remove
}