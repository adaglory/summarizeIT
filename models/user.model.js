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

let UserSchema = new Schema({
    
    username: {
        type: String,
        required: true, max: 100
    },
    email:{
        type: String, 
        unique: true, 
        trim:true, 
        lowercase: true, 
        required: true, 
        max: 100,
        validate: value => {
        if (!validator.isEmail(value)) {
            throw new Error({error: 'Invalid Email address'})
        }
    }},

    password:{
        type: String,
        required: true,
        max: 100
    },
    fullname:{
        type: String,
        required: false,
        max: 100,
    },
    phone:{
        type: String,
        required: false,
        max: 100
    },
    status:{
        type: String,
        required: false,
        max: 100
    },
    country:{
        type: String,
        required: false,
        max: 100
    },
    token:  {
            type: String,
            
        }
    
});

//this enforces emails to be unique!
UserSchema.plugin(uniqueValidator);

UserSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 12)
    }
    next()
})

UserSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the user
     try{ 
         console.log('here')
        const user = this;
        const token = jwt.sign({_id: user._id}, process.env.JWT_KEY);
        console.log(token)
        user.token = token;
        console.log(user.token)
        await user.save();
        return token;
    }
    catch(err){
        return console.log(err);
    }
}

UserSchema.statics.findByCredentials = async (email, password) => {
    // Search for a user by email and password.
    const user = await User.findOne({ email} )
    if (!user) {
        throw new Error({ error: 'Invalid login credentials' });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        throw new Error({ error: 'Invalid login credentials' });
    }
    return user
}

// Export the model
const User = mongoose.model('User', UserSchema);
module.exports = User;