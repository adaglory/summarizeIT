const jwt = require('jsonwebtoken')
const User = require('../models/user.model')


module.exports = {
    update: async (userid) => {
   
        try{ 
            const token = jwt.sign({userid}, process.env.JWT_KEY);
            updatetoken = await User.findByIdAndUpdate(userid,{token:token})
            
        }
        catch(err){
            return console.log(err);
        }
    
    }
}




