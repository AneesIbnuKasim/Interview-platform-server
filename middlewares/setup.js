// const express = require('express')
// const requestLogger = require('./requestLogger')
// const helmet = require('helmet')
// const cors = require('cors')
// const config = require('../config/config')

// const setupMiddleware = (app)=>{
//     app.use(helmet({crossOriginResourcePolicy:{policy:'cross-origin'}}))

//     app.use(requestLogger)

//     app.use(express.json({ limit: '10mb' }));
//     app.use(express.urlencoded({ extended: true, limit: '10mb' }))

//     app.use('/uploads', express.static('uploads'));

//     // In server.js (or wherever your Express app is initialized)
// app.get('/health', (req, res) => {
//   res.status(200).json({ success: true, message: 'OK' });
// });

// // Optional: redirect root / to /health
// app.get('/', (req, res) => {
//   res.redirect('/health');
// });

//     const corsOptions = {
//     origin: config.CORS.ORIGIN,
//     credentials: config.CORS.CREDENTIALS,
//     optionsSuccessStatus: 200,
//     methods: config.CORS.METHODS,
//     allowedHeaders: config.CORS.ALLOWED_HEADERS
//   }
//     app.use(cors(corsOptions))
// }

// module.exports = setupMiddleware


const express = require('express')
const requestLogger = require('./requestLogger')
const helmet = require('helmet')
const cors = require('cors')
const config = require('../config/config')

const setupMiddleware = (app) => {
  // Security headers
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

  // Logging
  app.use(requestLogger)

  // Body parsers
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // Static files
  app.use('/uploads', express.static('uploads'))

  const corsOptions = {
    origin: config.CORS.ORIGIN,
    credentials: config.CORS.CREDENTIALS,
    optionsSuccessStatus: 200,
    methods: config.CORS.METHODS,
    allowedHeaders: config.CORS.ALLOWED_HEADERS
  }

//   const corsOptions = {
//   origin: (origin, callback) => {
//     if (!origin || config.CORS.ORIGIN.includes(origin)) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   },
//   credentials: true,
//   methods: config.CORS.METHODS,
//   allowedHeaders: config.CORS.ALLOWED_HEADERS
// }

  app.use(cors(corsOptions))

app.get('/', (req, res) => {
  res.status(200).send('OK')
})

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is up' })
})
}

module.exports = setupMiddleware