const { Router } = require('express');
const api = require('./api');
const adminRoutes = require('./admin');

const router = Router();

router.use('/', api);
router.use('/admin', adminRoutes);

module.exports = router;
