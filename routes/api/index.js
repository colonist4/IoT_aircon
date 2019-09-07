const router = require('express').Router();
const data = require('./data/data.js');
const controller = require('./controller/controller.js');

router.use('/data', data);
router.use('/controller', controller);

module.exports = router;
