//Necessary Imports
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const routes = require('./routes');
const mongoose = require('mongoose')
const dotenv = require('dotenv')

//Initialising App
const app = express()

//Basic app configurations
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
const PORT = process.env.PORT || 5000

//Setting routes
routes(app);

//Configuring dotenv for using environment variables
dotenv.config();

//Connecting to MongoDB
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

//Server listening on port
app.listen(PORT, () => console.log(`Server Up and Running on port ${PORT}`))