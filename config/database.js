const mongoose = require('mongoose')
const config  = require('./config')
const logger = require('../utils/logger')

class DatabaseConnection {
    constructor() {
        this.isConnected = false
    }
    async connect() {
        try {
          if (this.isConnected) {
            logger.info('db connected already')
            return
        }

        const options = {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMs: 5000,
            socketTimeoutMs: 45000,
            family: 4
        }

        await mongoose.connect(config.MONGODB_URI,options)

        this.isConnected = true
        logger.info(`mongodb connected successfully`)
        mongoose.connection.on('error',(err)=>{
        logger.error('db connection error:',err)
        })

        mongoose.connection.on('disconnect',()=>{
          logger.warn('DB connection disconnected')
          this.isConnected = false
        })

        mongoose.connection.on('reconnect',()=>{
          logger.info('DB connection reconnected')
          this.isConnected = true
        })
    }
       catch (error) {
            logger.error('db connection failed: ',error)
        }
}

  async disconnect() {
     try {
       await mongoose.connection.close()
      this.isConnected = false
      logger.info('db disconnected gracefully')
    }
     catch (error) {
      logger.error('Error during mongoDb disconnection', error) 
     }
 }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    }
  }
}

const dbConnection = new DatabaseConnection()

process.on('SIGINT',async()=>{
  await dbConnection.disconnect()
  process.exit(0)
})

module.exports = dbConnection