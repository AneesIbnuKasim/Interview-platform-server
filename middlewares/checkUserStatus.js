const { decode } = require("jsonwebtoken")
const jwt = require('jsonwebtoken')
const { verifyUserToken, verifyAdminToken } = require("../utils/jwt")
const User = require("../models/User")
const Admin = require("../models/Admin")
const { NotFoundError, AuthorizationError } = require("../utils/errors")
const checkUserStatus = async(req, res, next)=>{
    try {
        
        const authHeader = req.headers.authorization
        
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return next()
        }
        
        const token = authHeader.substring(7)
        
        let decoded
        let account
        try {
            decoded = verifyUserToken(token)
            account = await User.findById(decoded.id)
        } catch (error) {
            try {
                decoded = verifyAdminToken(token)
                account = await Admin.findById(decoded.id)
                
            } catch (error) {
                return next()
            }
        }
        
        if (!account) {
            logger.error('STATUS ERROR: User not found')
            throw NotFoundError('User not found')
        }
        
        if (account.status === 'banned') {
            logger.error('User account is banned, Contact support')
            throw new AuthorizationError('Your account is banned, Please contact support')
        }
        
        next()
    } catch (error) {
        logger.error('Check user status error')
        throw error
    }
}

module.exports = checkUserStatus