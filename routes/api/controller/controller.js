const router = require('express').Router();
const controller = new (require('../../../classes/controller.js'))();

// body : {state:'on' or 'off'}
router.post('/power', (req, res)=>{
  var body = req.body || undefined;
  if(body.state == 'on'){
    controller.powerOn();
  } else if(body.state == 'off'){
    controller.powerOff();
  }
  res.status(200).send({success:true, message:"Good"});
})

// body: {temperature:Number, speed:String, mode:String}
router.post('/', (req, res)=>{
  var body = req.body || undefined;
  controller.send(body.temperature, body.speed, body.mode);
  res.status(200).send({success:true, message:"Good"});
})

module.exports = router;
