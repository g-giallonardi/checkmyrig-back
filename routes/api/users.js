const UserModel = require("../../databases/models/user.model");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const {key, keyPub} = require('../../keys/index')

const router = require("express").Router();

router.get("/", async (req, res) => {
  console.log('GET /users')
  try {
    const users = await UserModel.find({}).exec()
    res.json(users);
  } catch (err) {
    res.status(400).json("Oopsy! Something wrong happened...");
  }
});

router.post("/", async (req, res) => {
  console.log(req.body)
  const { email, username, password } = req.body;
  const newUser = new UserModel({
    email,
    username,
    password: await bcrypt.hash(password, 8),
  });

  try {
    const user = await newUser.save();
    res.json(user);
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      res.status(400).json("Email or username already use");
    } else {
      res.status(400).json("Oopsy! Something wrong happened...");
    }

  }
});

router.post("/auth", async (req, res) => {
  console.log('POST /auth')
  const { username, password } = req.body;
  const user = await UserModel.findOne({username}).exec();
  try {
    if(user){
      if( bcrypt.compareSync(password, user.password)){
        const token = jwt.sign({}, key,
            {subject : user._id.toString(),
              expiresIn: 3600 * 24,
              algorithm: 'RS256'
            }
        )
        res.cookie('token',token,{httpOnly:true})
        res.json(user._id)
      }
      else{
        res.status(400).json("Bad username and/or password");
      }
    } else {
      console.log(2)
      res.status(400).json("Bad username and/or password");
    }
  } catch (err) {
    console.log(3)
    res.status(400).json("Bad username and/or password");
  }
});

router.get("/auth/current", async (req, res) => {
  console.log('GET /current')
  const {token} = req.cookies
  console.log(token)

  try{
    const decodedUser = jwt.verify(token, keyPub)
    const currentUser = await UserModel.findById(decodedUser.sub).select('-password -__v').exec()
    console.log(decodedUser)
    if(currentUser) {
      res.json(currentUser)
    }else{
      res.status(400).json(null)
    }
  } catch{
      res.status(400).json(null)
  }
});

module.exports = router;