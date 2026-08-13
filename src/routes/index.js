const express = require('express');
const clinicalRoutes = require('./clinical');

const router = express.Router();
router.use('/clinical', clinicalRoutes);

module.exports = router;
