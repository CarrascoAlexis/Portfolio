const { Router } = require('express');
const api = require('./api');

const router = Router();

router.use('/', api);

module.exports = router;
