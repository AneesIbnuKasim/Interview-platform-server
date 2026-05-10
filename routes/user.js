const express = require('express')
const { authenticateUser } = require('../middlewares/auth')
const UserController = require('../controllers/UserController')
const { default: upload } = require('../config/multer')
const checkUserStatus = require('../middlewares/checkUserStatus')

const router = express.Router()

router.get('/me', checkUserStatus, authenticateUser, UserController.getProfile)
router.get('/wallet', checkUserStatus, authenticateUser, UserController.fetchWallet)
router.put('/profile', checkUserStatus, authenticateUser, UserController.updateProfile)
router.put('/avatar', upload.single('avatar'), checkUserStatus, authenticateUser, UserController.updateAvatar)
router.post('/addresses', checkUserStatus, authenticateUser, UserController.addAddress)
router.put('/addresses/:id', checkUserStatus, authenticateUser, UserController.updateAddress)
router.delete('/addresses/:id', checkUserStatus, authenticateUser, UserController.deleteAddress)
router.put('/change-password', checkUserStatus, authenticateUser, UserController.changePassword)
router.get('/wishlist', checkUserStatus, authenticateUser, UserController.fetchWishlist)
router.post('/wishlist/:productId', checkUserStatus, authenticateUser, UserController.toggleWishlist)

module.exports = router