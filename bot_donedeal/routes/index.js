var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/restart', function(req, res, next) {
  console.log('Restarting Bot...');
  process.exit(0);
});

module.exports = router;
