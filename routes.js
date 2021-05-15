//Necessary Imports
const express = require('express');
const authController = require('./controllers/auth.controller');
const router = express.Router();

//Setting up routes with controller functions
router.get('/2FA/setup', authController.setup)
router.get('/2FA/verify', authController.verify)
router.get('/2FA/remove', authController.remove)
router.post('/register', authController.register);

//Setting up routes for use in index.js
const routes = (app) => {

    app.use('/api', router)

    app.get('/', (req, res) => {
        res.send({ "message": "Authentication Example using TOTP" })
    })
}

//Exporting routes function
module.exports = routes;