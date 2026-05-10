const { ValidationError, ErrorFactory } = require('../utils/errors')
const logger = require('../utils/logger')
const { sendValidationError, sendSuccess, sendError } = require('../utils/response')

class BaseController {
    // static asyncHandler = (fn)=>{
    //     return (req, res, next)=>{
    //         return Promise.resolve(fn(req, res, next))
    //         .catch(next)
    //     }
    // }

    static asyncHandler(fn) {
    return (req, res, next) => {
        try {
            const promise = fn(req, res, next);
            return Promise.resolve(promise).catch(next);
        } catch (err) {
            return next(err);
        }
    };
}

    static validateRequest(schema, data) {

        const { error, value } = schema.validate(data, {abortEarly: false}, { convert: true })

        if(error) {
            throw new ValidationError(error.details.map(item => item.message))
        }
        return value
    }

    static handleValidationError(res, error) {
        return sendValidationError(res, {error})
    }

    static sendSuccess(res, message, data=null, statusCode=200) {
        return sendSuccess(res, message, data, statusCode)
    }

    static sendError(res, message, statusCode=500, details=null) {
        return sendError(res, message, statusCode, details)
    }

    static sanitizeUser = (user)=>{
        if (!user) return null

        const sanitized = user.toObject ? user.toObject() : user
        delete sanitized.password
        delete sanitized._v

        return sanitized
    }

    static logAction(action, user=null, details=[]) {
        const logData = {
            action,
            timestamp: new Date().toISOString(),
            ...details
        }

        if(user) {
            logData.user = {
                id: user._id || user.id,
                email: user.email,
                role: user.role
            }
        }
        logger.info(`Controller action: ${action}`,logData)
    }
}

module.exports = BaseController

