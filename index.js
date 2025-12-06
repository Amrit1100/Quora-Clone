const express = require('express')
const multer = require("multer")
const path = require("path")
const { MongoClient } = require("mongodb");
const cookieParser = require("cookie-parser");
const { error } = require('console');
const app = express()
const port = 3000

app.use(express.json())
app.use(cookieParser())

app.use((req,res,next)=>{
    let cookies = req.cookies
    if(cookies.login){
      req.loggedIn = true
      req.useremail = cookies.email
    }else{
      req.loggedIn = false
    }
  next()
})


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname); 
        // keeps name + extension
    }
});

const uploads = multer({storage : storage})
const uri = "mongodb+srv://amritpreetsingh:Amrit98788@mycluster.us690.mongodb.net/?retryWrites=true&w=majority&appName=MyCluster"
const client = new MongoClient(uri)

async function connectmongo(){
  try{
    await client.connect()
    return "connected"
  }catch(err){
    console.error(error)
    return "notconnected"
  }
}
connectmongo()

// All pages get request
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"))
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, "/public/login.html"))
})

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, "/public/signup.html"))
})

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, "/public/profile.html"))
})

app.get('/add-blog', (req, res) => {
  res.sendFile(path.join(__dirname, "/public/addblog.html"))
})


app.use(express.static('public'))

app.post("/signup", async(req,res)=>{
  if (req.loggedIn === true){
    res.json({msg : "loggedIn"})
  }else{
    let name = req.body.name
    let email = req.body.email
    let password = req.body.password
    if (!name || !email || !password){
      res.json({msg : "All fields are required"})
    }else{
      try{
      let db = client.db("Quora-Clone")
      let users = db.collection("Users")
      let result = await users.findOne({ email })
      if(result){
        res.json({msg : "Account Already exist with this email"})
      }else{
        let insertid = await users.insertOne({name,email,password})
        res.json({msg : "Success"})
      }
      }catch(err){
        console.error(err)
      }
      
    }
  }
   
})

app.post("/login", async(req,res)=>{
  if (req.loggedIn === true){
    res.json({msg : "loggedIn"})
  }else{
    let email = req.body.email
    let password = req.body.password
    if (!email || !password){
      res.json({msg : "All Fields are Required"})
    }else{
      try{
      let db = client.db("Quora-Clone")
      let users = db.collection("Users")
      let result = await users.findOne({ email })
      if(result){
        let savedpassword = result.password
        if(savedpassword === password){
          res.cookie("login", true, {httpOnly : true})
          res.cookie("email", email, {httpOnly : true})
          res.json({msg : `success`})
        }else{
          res.json({msg : "InCorrect Password."})
        }
      }else{
        res.json({msg : "No Account found with this email account"})
      }
    }catch(err){
      console.error(err)
      res.json({msg : `An Error Occurred. Please try again! ${err}`})
    }
  }

}})

app.post("/logout", (req,res)=>{
  if (req.loggedIn === true){
    try{
      res.clearCookie("login")
      res.clearCookie("email")
      res.json({msg : "Logout Successful"})
    }catch(err){
      res.json({msg : err})
    }
  }else{
    res.json({msg : "NotloggedIn"})
  }
})

app.post("/me", (req,res)=>{
    if(req.loggedIn){
      res.json({msg: "loggedIn", email : req.useremail})
    }else{
      res.json({msg : "NotloggedIn"})
    }
})

app.post("/add-blog", async(req,res)=>{
    if(req.loggedIn === true){
      let email = req.useremail
      let title = req.body.title
      let content = req.body.content
      if(!title || !content){
        res.json({msg : "All Fields are required."})
      }else{
        try{
           let db = client.db("Quora-Clone")
          let Blogs = db.collection("Blogs")
          let result = await Blogs.insertOne({email, title, content})
          if(result.acknowledged){
            res.json({msg : "success"})
          }else{
            res.json({msg : "An error occurred! Please try again."})
          }
        }catch(err){
          console.error(err)
          res.json({msg : `An Error occured. Please try again ${err}`})
        }
       
      }
    }else{
      res.json({msg : "User Not logged In"})
    }
})

app.post("/profile", async(req,res)=>{
  if(req.loggedIn===true){
      let email = req.useremail
      try{
        let db = client.db("Quora-Clone")
        let Blogs = db.collection("Blogs")
        let blogs = await Blogs.find({email}).toArray()
        let Users = db.collection("Users")
        let details = await Users.findOne({email})
        res.json({msg : blogs, name : details.name, bio : details.bio})
      }catch(err){
        console.error(err)
        res.json({msg : "An Error Occured. Please try again.", email})
      }
     
  }else{
    res.json({msg : "Not Logged In"})
  }
})

app.post("/getblogs", async(req,res)=>{
   let db = client.db("Quora-Clone")
   let Blogs = db.collection("Blogs")
   let blogs = await Blogs.find({}).toArray()
   res.status(200).json({blogs})
})

app.post("/changeinfo", async(req,res)=>{
      let email = req.useremail
      let username = req.body.username
      let bio = req.body.bio
      try{
        let db = client.db("Quora-Clone")
        let users = db.collection("Users")
        let user = await users.findOne({email})
        if(!user){
          res.status(400).json({msg : "User not Found"})
        }else{
            let result = await users.updateOne({email :email}, {$set : {name : username,  bio : bio}})
            if(result.acknowledged){
              res.status(200).json({msg : "Username Updated"})
            }else{
              res.status(500).json({msg : "Something went wrong"})
            }}
      }catch(err){
        console.log(err)
        res.status(500).json({msg : "Something went wrong"})
      }
      
})

app.post("/uploadphoto", uploads.single("photo") ,async(req,res)=>{
  if(req.loggedIn){
      let email = req.useremail
      res.json({ message: "Photo uploaded successfully!" });
  }else{
    res.status(400).json({msg : "User not logged In."})
  }
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
