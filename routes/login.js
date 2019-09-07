const router = require('express').Router();
const controller = require('./auth.js');

router.post('/auth', controller.login);
router.get('/logout', (req, res)=>{
  var cookieOption = {maxAge:0};
  // res.cookie("intranet-username", ".", cookieOption);
  res.cookie("IoT-username", ".", cookieOption);
  cookieOption["httpOnly"] = true;
  res.cookie("IoT-token", ".", cookieOption);
  res.status(200).send({success:true, message:"Good"});
})
module.exports = router;
