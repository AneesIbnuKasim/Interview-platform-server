const Admin = require('../models/Admin')
const User = require('../models/User')
const { verifyUserToken, verifyAdminToken } = require('../utils/jwt')
const logger = require('../utils/logger')
const { sendError } = require('../utils/response')

//middleware to authenticate user 
const authenticateUser = async(req, res, next)=>{
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return sendError(res, 'Access token required', 401)
        }

        const token = authHeader.substring(7)

        const decoded = verifyUserToken(token)

        const user = await User.findById(decoded.id)

        if (!user) {
            return sendError(res, 'User not found', 401)
        }

        if (user.status === 'banned') {
            return sendError(res, 'User has been banned', 403)
        }

        req.user = user
        next()
    } catch (error) {
        logger.error('User authentication failed')
        sendError(res, 'User token invalid or expired', 401)
    }
}
    //middleware to authenticate admin 
    const authenticateAdmin = async(req, res, next)=>{
        try {
            const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer')) {
            logger.error('Admin auth: Missing or invalid authorization header', authHeader)
            return sendError(res, 'Access token required', 401)
        }

        const token = authHeader.substring(7)
        
        
        if (!token) {
            logger.warn('Admin auth: Empty token after Bearer prefix');
            return sendError(res, 'Access token required', 401);
        }
        
        const decoded = verifyAdminToken(token)
        logger.info('Admin token verified successfully', { adminId: decoded.id });

        const admin = await Admin.findById(decoded.id)
        
        if (!admin || admin.role !== 'admin') {
            logger.warn('Admin auth: Admin not found or not an admin',{
                userId: decoded.id,
                userExists: !!admin,
                role: decoded.role
            })
            return sendError(res, 'Admin not found', 403)
        }

        if (admin.status === 'banned') {
            logger.warn('Admin auth: admin account is banned', { adminId : admin._id})
            sendError(res, 'Admin has been banned', 403)
        }

        req.admin = admin
        next()
        }
         catch (error) {
            logger.error('Admin authentication error')
            sendError(res, 'Invalid or expired admin token', 401)
        }
    }

    //middleware to verify admin privileges for admin only routes
    const requireAdmin = (req, res, next)=>{
        if (!req.user || !req.user.role === 'admin') {
            return sendError(res, 'Admin privileges required', 403)
        }
        next()
        }

module.exports = {
    authenticateUser,
    authenticateAdmin,
    requireAdmin
}