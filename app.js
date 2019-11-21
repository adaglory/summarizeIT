require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const User = require('./models/user.model');
const Uploads = require('./models/files.model');
const token = require('./functions/token');
const querystring = require('querystring');    
const deepai = require('deepai'); // OR include deepai.min.js as a script tag in your HTML
deepai.setApiKey('6d053c08-8a44-43eb-9d88-e7d44f577ec6');
var formidable = require('formidable');
var request = require('request');
var fs = require('fs');
var path = require('path');

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
app.get("/dashboard", async function(req,res){
    let mySession = req.session;
    if(mySession.email){
        let myUploads = await Uploads.find({userid:mySession.userid});
        console.log(myUploads)
        res.render('dashboard',{title: 'SummarizeIT- Dashboard',username: mySession.username, email: mySession.email, files:myUploads});
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
          
          if(user.email !== undefined){
              //generate token
              token.update(user._id);
              let mySession = req.session;
              mySession.username = user.username;
              mySession.email = user.email;
              mySession.userid = user._id;
              res.redirect('/dashboard');
          }else{
            res.render('signin',{title: 'SummarizeIT- Signin', message:'Email or password incorrect', success:'false'})
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


app.post("/summarize", async function(req,res){
    if (req.body) {
        try {
            let url = req.body.url    
            let text = req.body.text
            if(text !== ""){
                deepai.setApiKey('6d053c08-8a44-43eb-9d88-e7d44f577ec6');
                var resp = await deepai.callStandardApi("summarization", {
                    text: text,
            });
        console.log(resp)
            res.render('index',{title: 'SummarizeIT', summary:resp.output, summarize:'true'})
            }
            if(url !== "") {
                
                reqUrl = 'http://api.meaningcloud.com/summarization-1.0?key=7c13bba3611b2cd5f4342f1fd9de1d46&url='+url+'&sentences= 10'
                console.log(url)
                request(reqUrl, function (error, response, body) {
                  console.log('error:', error); // Print the error if one occurred
                  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                  console.log('body:', body); // Print the HTML for the Google homepage.
                  if(body){
                      console.log(response.body)
                      jsonBody = JSON.parse(response.body)
                    res.render('index',{title: 'SummarizeIT', summary:jsonBody.summary, summarize:'true'})
                  }
                  
                });
                
            }
    
        }catch(err){ 
            
                console.log(err);   
            
        }
    }
});

app.post("/upload", async function(req,res){
    if (req.body) {
        try {    
            let mySession = req.session;
            console.log(req.session)
            var form = new formidable.IncomingForm();
            let validFiles = ['.pdf','.txt','.docx','.doc'];
            
            form.parse(req, async function (err, fields, files) {
            console.log(files)
            ext = path.extname(files.doc.name).toLowerCase();
            console.log(ext)
            if(!validFiles.includes(ext)){
                res.render('dashboard',{title: 'SummarizeIT- Dashboard',username: mySession.username, email: mySession.email, upload:'false', uploadMessage: 'Invalid upload file. Only pdf and txt formats are allowed'});
            }else{
                var oldpath = files.doc.name;
                console.log(files.doc);
                // Example posting file picker input text (Browser only):
                link = "https://www.thepolyglotdeveloper.com/2017/10/consume-remote-api-data-nodejs-application/"
                url = 'http://api.meaningcloud.com/summarization-1.0?key=7c13bba3611b2cd5f4342f1fd9de1d46&doc='+oldpath
                console.log(url)
                request(url, function (error, response, body) {
                  console.log('error:', error); // Print the error if one occurred
                  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                  console.log('body:', body); // Print the HTML for the Google homepage.
                });
               

                // var newpath = './files/' + files.doc.name;
                // fs.rename(oldpath, newpath, async function (err) {
                //     if (err) throw err;
                //     let newFile = new Uploads;
                //     newFile.userid = mySession.userid;
                //     newFile.filename = files.doc.name;
                //     await newFile.save()
                //     res.render('dashboard',{title: 'SummarizeIT- Dashboard',username: mySession.username, email: mySession.email, upload:'true', uploadMessage: 'Success.'});
                // });
            }
            
        });
    
        }catch(err){ 
            
                console.log(err)   
            
        }
    }
});



app.listen(process.env.PORT || 3000,function(){
    console.log('App running on port ' +port);
})