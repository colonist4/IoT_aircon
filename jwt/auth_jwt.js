"use strict";

const jwt = require('jsonwebtoken');
const secret = require('../config/jwt_secret.js').secret;

const authMiddleware = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.query.token || req.cookies['IoT-token'];
  // console.log(`[AuthMiddleWare] ${token} ${req.url}`)
  if(!token) {
    if(req.url === "/"){
      return res.render('login.html')
    }
    return res.status(403).json({
      success: false,
      message: 'not logged in'
    });
  }

  const p = new Promise(
    (resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) =>{
        if(err) reject(err);
        resolve(decoded);
      });
    }
  );

  const onError = (error) => {
    if(error.message.includes('expire')) {
      error.message="다시 로그인 해주세요.";
      var cookieOption = {maxAge:0};
      res.cookie("IoT-username", ".", cookieOption);
      cookieOption["httpOnly"] = true;
      res.cookie("IoT-token", ".", cookieOption);
      res.render('login.html');
    } else{
      res.status(403).json({
        success: false,
        message: error.message
      });
    }

  }

  p.then((decoded) => {
    req.decoded = decoded;
    next();
  }).catch(onError)
}

const issueNewToken = (data, expire) => new Promise((resolve, reject)=>{
  jwt.sign(
                  {
                      _id: data.id,
                      username: data.username,
                  },
                  secret,
                  {
                      expiresIn: expire,
                      issuer: 'SeongJun',
                      subject: 'userInfo'
                  }, (err, token) => {
                      if (err) reject({err})
                      resolve(token)
                  })
});

exports.authMiddleware = authMiddleware;
exports.issuer = issueNewToken;
