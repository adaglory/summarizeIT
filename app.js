require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const User = require('./models/user.model');
var fs = require('fs');
const Uploads = require('./models/files.model');
const token = require('./functions/token');
const pdf = require('./functions/pdfGen');
const querystring = require('querystring');    
const deepai = require('deepai'); // OR include deepai.min.js as a script tag in your HTML
deepai.setApiKey('6d053c08-8a44-43eb-9d88-e7d44f577ec6');
var formidable = require('formidable');
var request = require('request');
const pdfParse = require('pdf-parse');


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
// define a route to download a file 
app.get('/pdf/:file',(req, res) => {
    console.log(req.params.file)
    var file = req.params.file;
    var fileLocation = path.join('./files',file);
    console.log(fileLocation);
    res.download(fileLocation, file); 
    // res.redirect('index');
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
        rendObj = {title: 'SummarizeIT- Dashboard',username: mySession.username, email: mySession.email, files:myUploads}
       
        if(req.query){
            rendObj = {title: 'SummarizeIT- Dashboard',username: mySession.username, email: mySession.email, files:myUploads, upload:req.query.upload, uploadMessage:req.query.message }
            
        }
        res.render('dashboard',rendObj);
    }else{
        const query = querystring.stringify({message:'Login First',success:false});
                res.redirect('/signin?' + query);
    }
    
});
// app.get("/sumupload", async function(req,res){
//     res.render('index',{title: 'SummarizeIT'}); 

    
    
// });
app.get("/sumupload", async function(req,res){
    let mySession = req.session;
    if(mySession.email){
        console.log(req.query)
        let file = req.query.filename;
         
        let dataBuffer = fs.readFileSync('files/' + file);
         
        pdfParse(dataBuffer).then(async function(data) {
         
            // number of pages
            console.log(data.numpages);
            // number of rendered pages
            console.log(data.numrender);
            // PDF info
            console.log(data.info);
            // PDF metadata
            console.log(data.metadata); 
            // PDF.js version
            // check https://mozilla.github.io/pdf.js/getting_started/
            console.log(data.version);
            // PDF text
            console.log(data.text); 

            deepai.setApiKey('6d053c08-8a44-43eb-9d88-e7d44f577ec6');
                var resp = await deepai.callStandardApi("summarization", {
                    text: data.text,
            });
            console.log(resp)
            const summary = resp.output;
            const summarySentenceCase = summary.charAt(0).toUpperCase() + summary.slice(1)
            respObj = {title: 'SummarizeIT- Summary', username: mySession.username,summary:summarySentenceCase}
            res.render('summary', respObj)
            // let query = querystring.stringify({title: 'SummarizeIT- Summary', username: mySession.username,summary:resp.output});
            // res.redirect('/summary?' + query);
                
        });
        
        
        
    }else{
        const query = querystring.stringify({message:'Login First',success:false});
                res.redirect('/signin?' + query);
    }
    
       

    
    
});
//post routes
    app.get("/summary", async function(req,res){
        let mySession = req.session;
        if(mySession.email){
            console.log(req.query)
            if(req.query){
                rendObj = {title: 'SummarizeIT- Summary', summary:req.query.summary}
                res.render('summary',rendObj);
            }
            
        }else{
            const query = querystring.stringify({message:'Login First',success:false});
                    res.redirect('/signin?' + query);
        }
        
    });
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
            let sentence = req.body.sentence
            if(text !== ""){
                deepai.setApiKey('6d053c08-8a44-43eb-9d88-e7d44f577ec6');
                var resp = await deepai.callStandardApi("summarization", {
                    text: text,
            });
            console.log(resp)
            let file = 'summarizeIT'+Date.now();
            let fUrl = file+'.pdf'
            let  body = resp.output;
            await pdf.genpdf(file, file, body );
            res.render('index',{title: 'SummarizeIT', summary:resp.output, summarize:'true', filename:fUrl})
            }
            if(url !== "") {
                
                reqUrl = 'http://api.meaningcloud.com/summarization-1.0?key=7c13bba3611b2cd5f4342f1fd9de1d46&url='+url+'&sentences='+sentence
                console.log(url)
                request(reqUrl, async function (error, response, body) {
                  console.log('error:', error); // Print the error if one occurred
                  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                  console.log('body:', body); // Print the HTML for the Google homepage.
                  if(body){
                      console.log(response.body)
                      let file = 'summarizeIT'+Date.now();
                      let fUrl = file+'.pdf'
                      jsonBody = JSON.parse(response.body)
                      await pdf.genpdf(file, file, jsonBody.summary );
                      res.render('index',{title: 'SummarizeIT', summary:jsonBody.summary, summarize:'true', filename:fUrl})
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
            let validFiles = ['.pdf'];
            
            form.parse(req, async function (err, fields, files) {
            console.log(files)
            ext = path.extname(files.file.name).toLowerCase();
            console.log(ext)
            if(!validFiles.includes(ext)){
                res.render('dashboard',{title: 'SummarizeIT- Dashboard',username: mySession.username, email: mySession.email, upload:'false', uploadMessage: 'Invalid upload file. Only pdf and txt formats are allowed'});
            }else{
                var oldpath = files.file.path;
                console.log(files.file);
                
                // // Example posting file picker input text (Browser only):
                // var options = {
                //     method: 'POST',
                //     url: 'https://api.meaningcloud.com/summarization-1.0',
                //     headers: {'content-type': 'multipart/form-data'},
                //     form: {
                //       key: 'c13bba3611b2cd5f4342f1fd9de1d46',
                //       sentences: 5
                //     }
                //   };
                  
                //   request(options, function (error, response, body) {
                //     if (error) throw new Error(error);
                  
                //     console.log(body);
                //   });
                 let newfilename = mySession.userid + Date.now();
                 let newpath = './files/' + newfilename + ext;
                fs.rename(oldpath, newpath, async function (err) {
                    if (err) throw err;
                    let newFile = new Uploads;
                    newFile.userid = mySession.userid;
                    newFile.displayname = files.file.name;
                    newFile.filename = newfilename + ext;
                    await newFile.save()
                    const query = querystring.stringify({message:'Success',upload:'true'});
                    res.redirect('/dashboard?' + query);

                });
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