require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser')
const User = require('./models/user.model')
const token = require('./functions/token')
const querystring = require('querystring');    

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'))
const port = 3000;
app.set('view engine', 'ejs');

//include  database connection
require('./db/db');
response = {};
//get routes
app.get("/", function(req,res){
    res.render('index',{title: 'SummarizeIT'});
});
app.get("/profile", function(req,res){
    res.render('profile',{title: 'SummarizeIT - Profile'});
});
app.get("/signup", function(req,res){
    res.render('signup',{title: 'SummarizeIT- Signup'});
});
app.get("/signin", function(req,res){
    
    if(req.query){
        res.render('signin',{title: 'SummarizeIT- Signin', message: req.query.message});
    }else{
        res.render('signin',{title: 'SummarizeIT- Signin'});
    }
    
});

app.get("/profile", function(req,res){
    res.render('profile',{title: 'SummarizeIT- Profile'});
});
app.get("/dashboard", function(req,res){
    if(req.query.status === 'success'){
        res.render('dashboard',{title: 'SummarizeIT- Dashboard'});
    }else{
        
    }
        
    
    
});
//post routes
app.post("/signup", async function(req,res){
    if(req.body){
        try{
            if(req.body.username === "" || req.body.email === "" || req.body.password ){
               let error = 'User name, Email and Password fields cannot be left empty'
            }
            const user = new User({username:req.body.username, email:req.body.email, password:req.body.password});
            const register = await user.save();
            
            
            if(register){
                const query = querystring.stringify({message:'Register Successful',status:'success'});
                res.redirect('/signin?' + query);
            }
        }catch(err){
            if (err.errors.email != undefined) {
                if (err.name == "ValidationError" && err.errors.email.kind == "unique") {
                  var errorContent = {
                    title: "Duplicate Email",
                    detail: "There is already a user with the email '"+req.body.email+"'"
                  };
                  res.render('signup',{title: 'SummarizeIT- Signup', message:errorContent.detail, status:'fail'})
                };
              }else{
                res.render('signup',{title: 'SummarizeIT- Signup', message:error, status:'fail'})
              }
            
        }
        
    }
    
});

app.post("/signin", async function(req,res){
    if (req.body) {
        try {
          const {
            email,
            password
          } = req.body //pass request body onto email and password variables.
          //authenticate influencer with findByCredentials functions defined in influencer.model
          const user = await User.findByCredentials(email, password)
         
          if(user){
              //generate token
              token.update(user._id);
              const query = querystring.stringify({status:'success'});
                res.redirect('/dashboard?' + query);
          }else{
            res.render('signin',{title: 'SummarizeIT- Signin', message:'Email or password incorrect', status:'fail'})
          }
          
    
//confirm email and password

//set token and update db
//render dashboard 
    
        }catch(err){
console.log(err)
        }
        }
});



app.listen(process.env.PORT || 3000,function(){
    console.log('App running on port ' +port);
})