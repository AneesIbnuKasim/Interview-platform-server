const logger = require('../utils/logger')

const requestLogger = (req, res, next)=>{
    const startTime = Date.now()
    logger.info(`incoming requests: ${req.method} ${req.originalUrl} from ${req.ip}`)

    const originalEnd = res.end
    res.end = function(chunk,encoding) {
        const duration = Date.now() - startTime
        logger.info(`response completed: ${req.method} ${req.originalUrl} - ${res.statusCode} ${duration}`)
        originalEnd.call(this,chunk,encoding)
    }
    next()
}

module.exports = requestLogger