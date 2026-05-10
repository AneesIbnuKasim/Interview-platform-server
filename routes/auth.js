const express = require('express')
const AuthController = require('../controllers/authController')
const { authenticateUser } = require('../middlewares/auth')
const loginLimiter = require('../middlewares/rateLimiter')

const router = express.Router()

router.post('/register', AuthController.register)
router.post('/login', loginLimiter, AuthController.login)
router.post('/verify-otp', loginLimiter, AuthController.verifyOtp)
router.post('/forgot-password', loginLimiter, AuthController.requestPasswordReset)
router.post('/verify-reset-otp', loginLimiter, AuthController.verifyOtp)
router.put('/reset-password', loginLimiter, AuthController.resetPassword)

module.exports = router