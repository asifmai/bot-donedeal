var express = require('express');
var router = express.Router();
const axios = require('axios');
const getConfig = require('../helpers/getconfig');
const {botLink} = require('../helpers/config');

/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    const config = await getConfig.get();
    res.render('index', {config});
  } catch (error) {
    console.log(error);
  }
});

/* GET home page. */
router.post('/', async (req, res, next) => {
  try {
    const config = await getConfig.get();
    config.repeat = req.body.repeat;
    config.bodyType = req.body.bodyType;
    config['car-finance'] = req.body['car-finance'];
    config.numDoors = req.body.numDoors;
    config.fuelType = req.body.fuelType;
    config.source = req.body.source;
    config.adType = req.body.adType;
    config.country = req.body.country;
    await getConfig.set(config);
    axios.get(`${botLink}/restart`);
  
    res.redirect('/'); 
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
