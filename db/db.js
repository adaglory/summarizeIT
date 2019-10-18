// Set up mongoose connection
const mongoose = require('mongoose');

//let dev_db_url = process.env.MONGODB_URI_LOCAL;
const mongoDB = "mongodb+srv://summarize:Oylo2qEB44tkZDfj@summarizeit-oiall.mongodb.net/test?retryWrites=true&w=majority";
//const mongoDB = dev_db_url;

mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));