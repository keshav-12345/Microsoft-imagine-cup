const { urlencoded } = require("body-parser");
const { response } = require("express");
var express = require("express"),
  passport = require("passport"),
  bodyParser = require("body-parser"),
  LocalStrategy = require("passport-local"),
  User = require("./models/user"),
  Seller =require("./models/seller"),
  Crop=require("./models/crop"),
  passportLocalMongoose = require("passport-local-mongoose"),
  mongoose = require("mongoose"),
  path = require("path"),
  alert = require("alert"),
  axios=require("axios").default,
  request = require("request"),
  multer=require("multer"),
 res = require("express/lib/response");
 const { compileQueryParser } = require("express/lib/utils");
 const { URL } = require("url");
 var app = express();

// CONNECTING MONGODB TO THE SERVER
//=================================
const DB='mongodb+srv://Keshav:Bhatheja321@cluster0.as6ug.mongodb.net/Microsoft_ideathon?retryWrites=true&w=majority'
mongoose.connect(DB,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex:true,
  useFindAndModify:false
}).then(()=>{
  console.log("connection successfull")
}).catch(err=>{
  console.log("Connection Failed")
});

// SETTING TEMPLATE ENGINE EJS
//===========================
app.set("view engine", "ejs");

//USING SOME MIDDLEWARES
//=====================
app.use(
require("express-session")({
secret: "Rusty is the best and cutest dog in the world",
resave: false,
saveUninitialized: false,}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(bodyParser.urlencoded({ extended: true }));



//JOINING STATIC PAGES OF THE WEBSITE
//===================================
const static_path = path.join(__dirname, "/public");
const static = path.join(__dirname, "/public/css");
app.use(express.static(static_path));
app.use(express.static(static));


// SETTING UP MIDDLEWARES FOR FILE UPLOADING(USING MULTER)
// =========================================
var Storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename:(req,file,cb)=>{
    cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
  }
  });
var upload=multer({
  storage:Storage,
}).single('file');


// ROUTES FOR SELLER
//===================

app.get("/Home_seller",isLoggedIn,(req,res)=>{
    res.render("./seller/Home_seller");
  })
  app.get("/about_us", isLoggedIn, function (req, res) {
    res.render("./seller/about_us");
  });
  app.get("/govtschemes", isLoggedIn, function (req, res) {
    res.render("./seller/govtschemes");
  });
  app.get("/crop_page",isLoggedIn, function (req, res) {
    res.render("./seller/crop_page");
  });
  app.get("/logs", function (req, res) {
    res.render("./seller/logs");
  });
  app.get("/profile",isLoggedIn,(req,res)=>{
    res.render("./seller/profile",{success:""});
  });
  app.get("/Reupyog",(req,res)=>{
    res.render("./seller/Reupyog")
  });
  app.get("/Upyog",(req,res)=>{
    res.render("./seller/Upyog");
  });
 
  
//MAKING ROUTES FOR FETCHING API'S USING REQUEST METHOD FOR SELLER
//================================================================
      app.get("/transportation",isLoggedIn, function (req, response) {
        request("https://krishi-vyahan.herokuapp.com/get_transport_details/",{ json: true },(err, res, body) => {
          if (err) {
            return console.log(err); }
            response.render("./seller/transportation", { data: body.transport });
          }
          );
        });
        app.get("/insurance",isLoggedIn, function (req, response) {
          request("https://krishi-vyahan.herokuapp.com/get_insuarance_details/",{ json: true },(err, res, body) => {
            if (err) {
              return console.log(err);
            }
            response.render("./seller/insurance", { data: body.insurance });
          }
          );
        });
        app.get("/lab",isLoggedIn, function (req, response) {
          request("https://krishi-vyahan.herokuapp.com/get_lab_details/",{ json: true },(err, res, body) => {
            if (err) {
              return console.log(err);
            }
            response.render("./seller/lab", { data: body.lab });
          }
          );
        });
        app.get("/shop",isLoggedIn, (req,response)=>{
          request("https://krishi-vyahan.herokuapp.com/get_shop_details/",{json:true},(err,res,body)=>{
            if(err){
              console.log(err);
      }
      response.render("./seller/shop",{data:body.shop});
    })
  });
  //=====================================
  //ROUTES OF POST REQUEST FROM REUPYOG TO UPYOG
  // ======================================
app.post("/Upyog",(req,res)=>{
var flashval=req.body.flashcard;
const REUPYOG = async () => {
      try {
      const resp = await axios.get(`https://krishi-vyahan.herokuapp.com/get_reupyog/?category_id=${flashval}`);
          return res.render("./seller/Upyog",{hello:resp.data.ReUpyog})
      } catch (err) {
          console.error(err);
      }
  };
  REUPYOG();
  })



  // ===========================================================
  // ROUTE FOR SELLER'S PROFILE PAGE FOR POSTTING DATA FROM FORM
  // ===========================================================
  app.post("/profile",upload,(req,res)=>{
    const seller =new Seller({
      sellerName:req.body.sellerName,
      item_name:req.body.item_name,
      quantity: req.body.quantity,
      price:req.body.price,
      state: req.body.state,
      country :req.body.country,
      contact : req.body.contact,
      district: req.body.district,
      price_with_transportation: req.body.price_with_transportation,
      image: req.file.filename
    });
    seller.save().then(()=>{
      res.status(201).render("./seller/profile",{success:" Data Updated successfully"} );
    }).catch((e)=>{
      res.status(400).send(e);
    });
  });
  // ============================================================
  app.post("/cropr",(req,res)=>{
    console.log(req.body)
    const crop=new Crop(req.body);
    crop.save().then(()=>{
      res.status(201).render("./seller/cropr");
    }).catch((e)=>{
      res.send(e);
    })
  })
  app.get("/cropa",(req,res)=>{
    Crop.find({},(err,cropa)=>{
      if(err){
        console.log(err);
      }
      res.render("./seller/cropa",{data:cropa,val:""});
    });
  });
  app.get("/cropr",(req,res)=>{
    Crop.find({},(err,crop)=>{
      if(err){
        console.log(err);
      }
      res.render("./seller/cropr",{data:crop,success:""});
    });
  });
  // SEARCHING ON THE BASIS OF ENTERED VALUE
  // ======================================
  app.post("/search_cropa",(req,res)=>{
    Crop.find({},(err,crop)=>{
      if(err){
        console.log(err);
      }
      res.render("./seller/cropa",{data:crop,val:req.body.search,hi:req.body});
    })
  })

  // SEARHING FROM THE DATABASE USING $AND FUNCTION
  // =============================================
  app.post("/search",(req,res)=>{
    const fltrsoil=req.body.soil;
    const fltrtemp=req.body.temperature;
    const fltrhumidity=req.body.humidity;
    const fltrPh=req.body.Ph;
    const fltrrainfall=req.body.rainfall;
    const fltrprice=req.body.price;
    
    if(fltrsoil!='' && fltrtemp!='' && fltrhumidity!='' && fltrPh!='' && fltrrainfall!='' && fltrprice!=''){
      var fltrparams={ $and:[{soil:fltrsoil},{$and:[{temperature:fltrtemp}]},{$and:[{humidity:fltrhumidity}]},{$and :[{Ph:fltrPh}]},{$and:[{rainfall:fltrrainfall}]},{$and:[{price:fltrprice}]}]
    }
  }
   else{
   var fltrparams={}
   }
   Crop.find(fltrparams,(err,crop)=>{
    if(err){
      console.log(err);
    }
    console.log(req.body)
    res.render("./seller/cropr",{data:crop,success:"data"})
  })
})


// ROUTES FOR CONSUMER
// ===================

app.get("/Home_consumer",isLoggedIn,(req,res)=>{
  res.render("./consumer/Home_consumer");
})
app.get("/logc", function (req, res) {
 res.render("./consumer/logc");
});
app.get("/consumer_about_us",isLoggedIn,(req,res)=>{
  res.render("./consumer/consumer_about_us");
})
app.get("/consumer_govtschemes",isLoggedIn,(req,res)=>{
  res.render("./consumer/consumer_govtschemes");
})
app.get("/consumer_Reupyog",isLoggedIn,(req,res)=>{
res.render("./consumer/consumer_Reupyog");
})


// ROUTES FOR FETCHING API'S FOR CONSUMER USING REQUEST METHOD
// ===========================================================
app.get("/consumer_transportation",isLoggedIn,(req,response)=>{
  request(
    "https://krishi-vyahan.herokuapp.com/get_transport_details/",
    { json: true },
    (err, res, body) => {
      if (err) {
        return console.log(err);
      }
      response.render("./consumer/consumer_transportation", { data: body.transport });
    }
    );
  })
  app.get("/consumer_shop",isLoggedIn, (req,response)=>{
    request("https://krishi-vyahan.herokuapp.com/get_shop_details/",{json:true},(err,res,body)=>{
      if(err){
        console.log(err);
}
response.render("./consumer/consumer_shop",{data:body.shop});
})
});
  
  app.get("/consumer_feed",isLoggedIn,(req,res)=>{
    Seller.find({},(err,user)=>{
      if(err){
        console.log(err);
      }
      console.log(user);
      res.render("./consumer/consumer_feed",{data:user});
    })
  })
// ==========================================================
  app.get("/start", function (req, res) {
    res.render("./login_register/start");
  });

  app.get("/", function (req, res) {
    res.render("./login_register/home");
  });

  // HANDLING USER SIGN UP (REGISTER ROUTES)
  // =====================================

  app.get("/register", function (req, res) {
    res.render("./login_register/register",{data:req.body.type,error:""});
    });
    app.post("/register", function (req, res) {
      var user = {  
        username: req.body.username,
        type: req.body.type,
        email: req.body.email,
        truename: req.body.truename,
      };
      User.register(new User(user), req.body.password, function (err, user) {
        if (err) {  
          console.log("OOPS SOMETHING WENT WRONG!!");
          console.log(err);
          return res.render("./login_register/register",{data:req.body.type,error:"Use Different Contact To Register"});
        }
        passport.authenticate("local")(req, res, function () {
          // TO LOGIN THE USER
          // =================
          User.findOne({ username: user.username }, function (err, user) {
            console.log(user);
        if (err){
          console.log("error");
          res.render("./login_register/register")
        } 
        if(user.type == "seller"){ 
          alert("Successfully Registered")
          return res.render("./login_register/register",{error:"",data:req.body.type});}
        if(user.type == "consumer"){ 
          alert("Successfully Registered")
          return res.render("./consumer/logc",{error:"",data:req.body.type});}
        else alert("invalid user");
        return res.redirect("/start");
      });
    });
  });
});


// LOGIN ROUTE FOR SELLER
// ==================


//LOGIN LOGIC
// MIDDLEWARE:CODE THAT RUNS BEFORE OUR FINAL ROUTE CALLBACK
app.get("/logins", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      alert("invalid user");
      return res.redirect("/start");
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      User.findOne({ username: user.username }, function (err, user) {
        if (err) {console.log("error");}
        if (user.type == "seller") return res.redirect("/Home_seller");
        else alert("invalid user");
        return res.redirect("/start");
      });
    });
  })(req, res, next);
});

// LOGIN ROUTE FOR CONSUMER
// ========================

app.get("/loginc", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      alert("Invalid User")
      return res.redirect("/start");
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      User.findOne({ username: user.username }, function (err, user) {
      if (err) console.log("error");
      console.log(user);
      if (user.type == "consumer") return res.redirect("/Home_consumer");
      else alert("invalid user");
      console.log("Invalid user");
      return res.redirect("/start");
      });
    });
  })(req, res, next);
});


// ROUTE FOR LOGOUT
// ================
 app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
  });

// WRITING MY OWN MIDDLEWARE
// =========================
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/start");
    alert(" First Login into your account");
  }
  }

  // MAKING ENV VARIABLE FOR PORT 
  // ============================
app.listen(process.env.PORT || 3000, process.env.IP, function () {
  console.log("The server has started!!!");
});
