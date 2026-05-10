
const authRoutes = require('./auth')
const adminRoutes = require('./admin')
const productRoutes = require('./product')
const categoryRoutes = require('./category')
const userRoutes = require('./user')
const searchRoutes = require('./search')
const cartRoutes = require('./cart')
const couponRoutes = require('./coupon')
const paymentRoutes = require('./payment')
const orderRoutes = require('./order')
const analyticsRoutes = require('./analytics')
const chatRoutes = require('./chat')
const bannerRoutes = require('./banner')

const setupRoutes = (app)=>{
    app.use('/api/auth', authRoutes)
    app.use('/api/admin', adminRoutes)
    app.use('/api/user', userRoutes)
    app.use('/api/products',productRoutes)
    app.use('/api/category',categoryRoutes)
    app.use('/api/payments',paymentRoutes)
    app.use('/api/search',searchRoutes)
    app.use('/api/cart',cartRoutes)
    app.use('/api/coupon',couponRoutes)
    app.use('/api/orders',orderRoutes)
    app.use('/api/analytics',analyticsRoutes)
    app.use('/api/chat',chatRoutes)
    app.use('/api/banner',bannerRoutes)
}

module.exports = {
    setupRoutes
}