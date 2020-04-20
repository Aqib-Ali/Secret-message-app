const express = require('express');
const app =express();
const bodyParser=require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const conString='mongodb://localhost:27017/messageDB';

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

const secretString='this is our secret ke for encryption';
registerSchema.plugin(encrypt,{secret: secretString,encryptedFields: ['password']}); //encrypt is the const variable we have declared earliar

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
        userobj = new Registermodel({
                  email:req.body.username,
                  password:req.body.password
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
												 if(founduser.password===req.body.password)
												 {
													 res.render('secrets');
												 }
												 else {
													 res.redirect('login');
												 }
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
