const express = require('express')
const AdminController = require('../controllers/adminController')
const { authenticateAdmin } = require('../middlewares/auth')
const CategoryController = require('../controllers/CategoryController')
const ProductController = require('../controllers/ProductController')
const { default:upload } = require('../config/multer')
const OrderController = require('../controllers/orderController')
const checkUserStatus = require('../middlewares/checkUserStatus')
const loginLimiter = require('../middlewares/rateLimiter')

const router = express.Router()

router.post('/login', loginLimiter , AdminController.login)

// orders

router.get('/orders', authenticateAdmin, OrderController.fetchOrders)
router.put('/orders/:orderId', authenticateAdmin, OrderController.updateStatus)

//admin profile
router.get('/me', authenticateAdmin, AdminController.getProfile)
router.put('/profile', authenticateAdmin, AdminController.updateProfile)
router.put('/avatar', upload.single('avatar'), authenticateAdmin, AdminController.updateAvatar)

//users
router.get('/users', AdminController.getUsers)
router.patch('/users/:userId/ban', AdminController.banUser)
router.patch('/users/:userId/UNban', AdminController.unBanUser)

//orders
router.get('/orders', authenticateAdmin, OrderController.fetchOrders)

module.exports = router