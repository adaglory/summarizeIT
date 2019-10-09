require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser')
const User = require('./models/user.model')

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'))
const port = 3000;
app.set('view engine', 'ejs');

//include  database connection
require('./db/db');

//get routes
app.get("/", function(req,res){
    res.render('index',{title: 'SummarizeIT'});
});
app.get("/signup", function(req,res){
    res.render('signup',{title: 'SummarizeIT- Signup'});
});
app.get("/signin", function(req,res){
    res.render('signin',{title: 'SummarizeIT- Signin'});
});
app.get("/signin?signup = success", function(req,res){
    res.render('signin',{title: 'SummarizeIT- Signin', message:'Sign Up successful, you can log in with your credentials'});
});
app.get("/profile", function(req,res){
    res.render('profile',{title: 'SummarizeIT- Profile'});
});
app.get("/dashboard", function(req,res){
    res.render('dashboard',{title: 'SummarizeIT- Dashboard'});
});
//post routes
app.post("/signup", async function(req,res){
    if(req.body){
        const user = new User({username:req.body.username, email:req.body.email, password:req.body.password});
        await user.save();
        const token = await user.generateAuthToken() //generate token for influencer.
        res.redirect('/signin');
    }
    
})


app.listen(port,function(){
    console.log('App running on port ' +port);
})