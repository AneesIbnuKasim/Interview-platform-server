const express = require('express')
const { authenticateAdmin } = require('../middlewares/auth')
const AnalyticsController = require('../controllers/AnalyticsController')
const router = express.Router()

router.get('/', authenticateAdmin, AnalyticsController.fetchAnalytics)


module.exports = router