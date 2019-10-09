// Set up mongoose connection
const mongoose = require('mongoose');

//let dev_db_url = process.env.MONGODB_URI_LOCAL;
const mongoDB = process.env.MONGODB_URI;
//const mongoDB = dev_db_url;

mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));