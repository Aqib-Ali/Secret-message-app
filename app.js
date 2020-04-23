const express = require('express');
const app =express();
require('dotenv').config();
const bodyParser=require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


//app.use code//
app.set('view engine','ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

//app.use code for managing sessions
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


const conString='mongodb://localhost:27017/messageDB';
//DataBase connection Code //
mongoose.connect(conString, {useUnifiedTopology: true,useNewUrlParser: true});
mongoose.set('useCreateIndex',true);
let db= mongoose.connection;

db.on('connected',function()
{
	console.log('connected to the database');
});

db.on('error',function(err)
{
	console.log('error occured'+err);
});

//database Connection Code End//

//database Schema
//Preparing schema


const registerSchema = new mongoose.Schema({
    email:String,
    password:String
    // whatever else
});

registerSchema.plugin(passportLocalMongoose);

const userModel=mongoose.model('user',registerSchema); //user is collection name

passport.use(userModel.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());


app.get('/',function(req,res) {
        res.render('home');
});

app.get('/secrets',function(req,res) {
        if(req.isAuthenticated()){
					res.render('secrets');
				}
				else{
					res.redirect(	'/login');
				}
});

app.get('/register',function(req,res) {
        res.render('register');
});

app.get('/login',function(req,res) {
        res.render('login');
});

app.get('/logout',function(req,res) {
        req.logout();
        res.redirect('/');
});


// Register  code
app.post('/register',function(req,res) {

				userModel.register({username:req.body.username},req.body.password, function(err, user) {
  if (err) {
		console.log('error '+err)
		res.redirect('/register');
	}
	else {
	  passport.authenticate('local')(req,res,function(){
		res.redirect('/secrets');
	});
	}


});
});

//login code
app.post('/login',function(req,res) {

  const user = new userModel({
    username:req.body.username,
    password:req.body.password
  });

  req.login(user,function(err)
{
  if(err)
  {
    console.log(err);
  }
  else{
          passport.authenticate('local')(req,res,function()
          {
            res.redirect('/secrets');
          });
      }
});

});




app.listen(3000,function(err)
{
  if(!err)
  {
    console.log('listening at port 3000');
  }
})
