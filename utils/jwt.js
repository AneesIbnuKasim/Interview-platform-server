const jwt = require('jsonwebtoken')
const logger = require('../utils/logger')
const config = require('../config/config')
const { AuthorizationError } = require('./errors')

const generateUserToken = (payload)=>{
    logger.warn('payload:',payload.role)
    
    try {
        return jwt.sign(payload,
            config.JWT.USER_SECRET,{
            expiresIn: config.JWT.EXPIRES_IN
            })
    } catch (error) {
        logger.error('Error creating user token',error)
        throw new Error('Token generation failed')
    }
}

const generateAdminToken = (payload)=>{
   try {
         return jwt.sign(payload, 
        config.JWT.ADMIN_SECRET, {
            expiresIn: config.JWT.EXPIRES_IN
        }
    )
   } catch (error) {
        logger.error('Error creating admin token', error)
        throw new Error('Admin token generation failed')
   }
}

const generateResetToken = (payload)=>{
    try {
        return jwt.sign(payload,
            config.JWT.RESET_SECRET,{
            expiresIn: config.JWT.RESET_EXPIRES_IN
            })
    } catch (error) {
        logger.error('Error creating reset token',error)
        throw new Error('Token generation failed')
    }
}

const verifyUserToken = (token)=>{
    try {
      if (!config.JWT.USER_SECRET) {
      throw new Error('JWT_USER_SECRET not configured');
    }
    return jwt.verify(token, config.JWT.USER_SECRET)
    } catch (error) {
        logger.error('User token verification failed')
        throw new Error('User token verification failed')
    }
}

const verifyAdminToken = (token)=>{
    try {
        if (!config.JWT.ADMIN_SECRET) {
            throw new Error('JWT_ADMIN_SECRET not configured');
        }
        
    return jwt.verify(token, config.JWT.ADMIN_SECRET)
    } catch (error) {
        logger.error('Admin token verification failed')
        throw new AuthorizationError('Admin token verification failed')
    }
}

const verifyResetToken = (token)=>{
    try {
        if (!config.JWT.RESET_SECRET) {
            throw new Error('JWT_RESET_SECRET not configured')
        }
        return jwt.verify(token, config.JWT.RESET_SECRET)
    } catch (error) {
        logger.error('Reset token verification failed')
        throw new Error('Token expired or not valid')
        }
}

module.exports = {
    generateUserToken,
    generateAdminToken,
    verifyUserToken,
    verifyAdminToken,
    generateResetToken,
    verifyResetToken
}