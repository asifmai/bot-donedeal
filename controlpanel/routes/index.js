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
    config.area = req.body.area;
    config.price_from = req.body.price_from;
    config.price_to = req.body.price_to;
    config.year_from = req.body.year_from;
    config.year_to = req.body.year_to;
    config.verifications = req.body.verifications;
    config.transmission = req.body.transmission;
    config.engine_from = req.body.engine_from;
    config.engine_to = req.body.engine_to;
    config.mileage_from = req.body.mileage_from;
    config.mileage_to = req.body.mileage_to;

    await getConfig.set(config);
    axios.get(`${botLink}/restart`);
  
    res.redirect('/'); 
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
