const express = require('express');
const app =express();
require('dotenv').config();
const bodyParser=require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const conString='mongodb://localhost:27017/messageDB';
//const md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.set('view engine','ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));


//DataBase connection Code //
mongoose.connect(conString, {useUnifiedTopology: true,useNewUrlParser: true});
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


//registerSchema.plugin(encrypt,{secret: process.env.DB_SECRETSTRING,encryptedFields: ['password']}); //encrypt is the const variable we have declared earliar

const Registermodel=mongoose.model('user',registerSchema); //user is collection name

app.get('/',function(req,res) {
        res.render('home');
});

app.get('/register',function(req,res) {
        res.render('register');
});

app.get('/login',function(req,res) {
        res.render('login');
});

app.get('/logout',function(req,res) {
        res.render('home');
});


// Register  code
app.post('/register',function(req,res) {


				bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
					    // Store hash in your password DB.
							if(!err)
							{


								const	userobj = new Registermodel({
					                  email:req.body.username,
					                  password:hash
					                  });

									userobj.save(function(err)
								{
										if(!err)
										{
										res.render('login');
										}
										else {
											console.log('error'+err);
										}
								});
					 }
					});




});

//login code
app.post('/login',function(req,res) {
          Registermodel.findOne({email:req.body.username},function(err,founduser)
           {
             if(err)
             {
               console.log(err);
             }
						 else
						 {
										 if(founduser)
										 {
													 bcrypt.compare(req.body.password, founduser.password, function(err, result) {
		    								 		if(result === true)
														{
															 res.render('secrets');
														}
														else {
															res.redirect('login');
														}

													});
							 		 		}
											else {
													res.redirect('login');
											}
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
