"use strict";
/*
    POST /api/auth/login
    {
        username,
        password
    }
*/
const tokenIssuer = require('../../jwt/auth_jwt').issuer;

exports.login = (req, res) => {
  var {username, password, expire} = req.body || null;
  console.log(`[Auth.js] 로그인요청:${username} 기한:${expire}`);
  var cookieOption = {}

  if(!expire){
    expire = "1d";
  } else{
    cookieOption["maxAge"] = parseInt(expire)*24*60*60*1000;
    // console.log(parseInt(expire)*24*60*60*1000);
  }
  if(!username || !password){
    res.status(400).send({success:false, message:"Please enter username"});
  }else if(password == "tjdwns12%" && username == "admin"){
    // res.cookie("intranet-id", "admin", cookieOption);
    // res.cookie("intranet-prev", "normal", cookieOption);
    tokenIssuer({id:0, username:"seongJun"}, expire)
    .then((token)=>{
      res.cookie("IoT-username", "seongJun", cookieOption);
      cookieOption["httpOnly"] = true;
      res.cookie("IoT-token",token, cookieOption);
      console.log("[Auth.js] Login Success")
      res.status(200).send({success:true, message:"Good"});
    }, (err) => {
      console.log(`[Auth.js] ${err.message}`);
      res.status(400).send({success:false, message:err.message});
    })
  } else{
    res.status(400).send({success:false, message:"Please enter corrent info"});
  }

}
