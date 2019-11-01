require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const User = require('./models/user.model');
const token = require('./functions/token');
const querystring = require('querystring');    

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
const port = 3000;
app.set('view engine', 'ejs');

//initialize session
let mySession
//include  database connection
require('./db/db');
response = {};
//get routes
app.get("/", function(req,res){
    res.render('index',{title: 'SummarizeIT'});
});

app.get("/signup", function(req,res){
    res.render('signup',{title: 'SummarizeIT- Signup'});
});
app.get("/signin", function(req,res){
    
    if(req.query){
        console.log(req.query)
        res.render('signin',{title: 'SummarizeIT- Signin', message: req.query.message, success: req.query.success});
    }else{
        res.render('signin',{title: 'SummarizeIT- Signin'});
    }
    
});

app.get("/profile", function(req,res){
    mySession = req.session;
    if(mySession.email){
        res.render('profile',{title: 'SummarizeIT- Profile', username: mySession.username, email: mySession.email});
    }else{
        const query = querystring.stringify({message:'Login First',success:false});
                res.redirect('/signin?' + query);
    }
    
});
app.get("/dashboard", function(req,res){
    mySession = req.session;
    if(mySession.email){
        res.render('dashboard',{title: 'SummarizeIT- Dashboard',username: mySession.username, email: mySession.email});
    }else{
        const query = querystring.stringify({message:'Login First',success:false});
                res.redirect('/signin?' + query);
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
                const query = querystring.stringify({message:'Register Successful',success:true});
                res.redirect('/signin?' + query);
            }
        }catch(err){
            if (err.errors.email != undefined) {
                if (err.name == "ValidationError" && err.errors.email.kind == "unique") {
                  var errorContent = {
                    title: "Duplicate Email",
                    detail: "There is already a user with the email '"+req.body.email+"'"
                  };
                  res.render('signup',{title: 'SummarizeIT- Signup', message:errorContent.detail, success:false})
                };
              }else{
                res.render('signup',{title: 'SummarizeIT- Signup', message:error, success:false})
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
              let mySession = req.session;
              mySession.username = user.username;
              mySession.email = user.email;
              mySession.userid = user._id;
              res.redirect('/dashboard');
          }else{
            res.render('signin',{title: 'SummarizeIT- Signin', message:'Email or password incorrect', success:false})
          }
          
    
//confirm email and password

//set token and update db
//render dashboard 
    
        }catch(err){
console.log(err)
        }
        }
});

app.post("/profile", async function(req,res){
    if (req.body) {
        try {
            let mySession = req.session;
            console.log(req.session)
            record = req.body;
            console.log(mySession.userid)
            let updateUser = await User.findByIdAndUpdate(mySession.userid,record);
            if(updateUser){
                res.render('profile',{title: 'SummarizeIT- Profile', username: mySession.username, email: mySession.email, message:'Profile Updated Successfully', success:true})
            }else{
                res.render('profile',{title: 'SummarizeIT- Profile', username: mySession.username, email: mySession.email, message:'Updated Failed', success:false})
            }
    
        }catch(err){ 
            var errorContent = {
                title: "Duplicate Email",
                detail: "There is already a user with the email '"+req.body.email+"'"
              };
              res.render('profile',{title: 'SummarizeIT- Profile',username: mySession.username, email: mySession.email,  message:errorContent.detail, success:false})
                console.log(err)   
            
        }
    }
});



app.listen(process.env.PORT || 3000,function(){
    console.log('App running on port ' +port);
})