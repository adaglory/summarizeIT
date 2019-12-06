const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');
const validator = require('validator')
const jwt = require('jsonwebtoken')
const Schema = mongoose.Schema;

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

let uploads = new Schema({
    
    userid: {
        type: String,
        required: true, max: 100
    },
    

    filename:{
        type: String,
        required: true,
        max: 100
    },
    displayname:{
        type: String,
        required: true,
        max: 100
    },
    
    //status of 
    summarized:{
        type: String,
        required: false,
        default:'false',
        
    },
    
});


// Export the model
const Uploads = mongoose.model('uploads', uploads);
module.exports = Uploads;