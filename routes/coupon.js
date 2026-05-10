const express = require('express')
const { authenticateAdmin, authenticateUser } = require('../middlewares/auth')
const CategoryController = require('../controllers/CategoryController')
const CouponController = require('../controllers/couponController')

const router = express.Router()

//coupon api handlers
router.get('/', authenticateAdmin, CouponController.fetchCoupons)
router.post('/', authenticateAdmin, CouponController.addCoupon)
router.put('/:id',authenticateAdmin ,CouponController.updateCoupon)
router.delete('/:id', authenticateAdmin, CouponController.deleteCoupon)

//user ui
router.post('/validate', authenticateUser, CouponController.validateCoupon)

module.exports = router