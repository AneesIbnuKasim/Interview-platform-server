const Admin = require("../models/Admin")
const User = require("../models/User")
const logger = require('./logger')


const seedAdmin = async()=>{
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com'
        const existingAdmin = await Admin.findByEmail(adminEmail)
        
    if (!existingAdmin) {
        const admin = new Admin({
        name: 'Admin',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        status: 'active'
      })

      await admin.save()
      logger.info(`Admin data user created with email:${adminEmail}`)
    }
    else {
      logger.info('Admin user already exist')
    }
    } catch (error) {
        logger.error('Error seeding admin data')
    }
}

const seedSampleUsers = async()=>{
    try {
        if (process.env.NODE_ENV !== 'development') {
        return 
    }

    const sampleUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user',
        status: 'active'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'user',
        status: 'active'
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: 'password123',
        role: 'user',
        status: 'banned'
      }
    ]

    for( let userData of sampleUsers) {
        const existingUser = await User.findByEmail(userData.email)

        if (!existingUser) {
            const user = new User(userData)
            await user.save()
            logger.info(`Sample user created: ${userData.email}`)
        }
        else logger.info('Sample users already exists')
    }

    } catch (error) {
        logger('Error seeding sample users data')
    }
}

const runSeeders = async()=>{
    try {
        await seedAdmin()
        await seedSampleUsers()
        logger.info('Database seeding completed')
    } catch (error) {
        logger.error('Database seeding failed')
    }
}

module.exports = {
    seedAdmin,
    seedSampleUsers,
    runSeeders
}