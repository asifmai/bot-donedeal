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
    config.price = req.body.price;
    config.doors = req.body.doors;
    config.fuelType = req.body.fuelType;
    config.sellerType = req.body.sellerType;
    config.forSale = req.body.forSale;
    config.countryOfRegistration = req.body.countryOfRegistration;
    await getConfig.set(config);
    axios.get(`${botLink}/restart`);
  
    res.redirect('/'); 
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
