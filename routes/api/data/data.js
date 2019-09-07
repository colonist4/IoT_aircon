const router = require('express').Router();
const dht11 = new (require('../../../classes/dht11.js'))();

router.post('/', (req, res)=>{
  var {from ,to} = req.body || null;
  // console.log(req.body)
  if(from!=null && to!=null){
    dht11.getRecentData(from, to)
    .then((data)=>{
      // console.log(data);
      res.status(200).send({success:true, message:data});
    }, (err)=>{
      res.status(400).send({success:false, message:err.message});
    })
  } else{
      res.status(400).send({success:false, message:"Please send correct dates"});
  }
});
module.exports = router;
