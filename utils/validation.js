const Joi = require('joi')

const commonPatterns = {
    name: Joi.string().min(2).max(100).trim().required(),
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(8).max(128).required(),
    phone: Joi.number().optional(),
    objectId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    price: Joi.number().required(),
    sizes: Joi.array().items(Joi.string()).optional(),
    images: Joi.array().items(Joi.string().uri()).min(1),
    status: Joi.string().valid('active', 'banned', 'inactive'),
    role: Joi.string().valid('user', 'admin'),
    description: Joi.string().min(8).required(),
}

const customMessages = {
    'string.min': '{#label} must be at least {#limit} characters long',
    'string.max': '{#label} cannot exceed {#limit} characters',
    'string.email': 'please provide a valid email address',
    'any.required': '{#label} is required',
    'any.only': '{#label} must be one of {#valid}',
    'string.pattern.base': '{#label} format is invalid'
}

const strongPasswordValidation = Joi.string()
.min(8)
.max(128)
.pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
.messages({
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
})

const registerValidation = Joi.object({
    name: commonPatterns.name.messages(customMessages),
    email: commonPatterns.email.messages(customMessages),
    password: strongPasswordValidation
})

const phoneValidation = Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Phone must be a valid 10-digit number',
      ...customMessages
    })

const updateProfileValidation = Joi.object({
    name: commonPatterns.name.messages(customMessages),
    phone: Joi.string().optional().pattern(/^[0-9]{10}$/)
})

const pinCodeValidation = Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      'string.pattern.base': 'Pin Code must be a valid 6-digit number',
      ...customMessages
    })

const loginValidation = Joi.object({
    email: commonPatterns.email.messages(customMessages),
    password: commonPatterns.password.messages(customMessages)
})

const adminLoginValidation = loginValidation

const changePasswordValidation = Joi.object({
    currentPassword: commonPatterns.password.messages(customMessages),
    newPassword: strongPasswordValidation
})

const resetPasswordValidation = Joi.object({
    resetToken: Joi.string().required().messages(customMessages),
    newPassword: strongPasswordValidation,
    userId: Joi.string().required().messages(customMessages)

})

const emailValidation = Joi.object({
    email: commonPatterns.email.messages(customMessages)
})

const categoryValidation = Joi.object({
    name: commonPatterns.name.messages(customMessages),
    description: commonPatterns.description.messages(customMessages)
})

const productValidation = Joi.object({
    name: commonPatterns.name.messages(customMessages),
    description: commonPatterns.description.messages(customMessages),
    brandName: commonPatterns.name.messages(customMessages) ,
    sellingPrice: commonPatterns.price.messages(customMessages),
    originalPrice: Joi.number().min(Joi.ref('sellingPrice')).optional(),
    categoryId: commonPatterns.objectId.messages(customMessages),
    stock: commonPatterns.price.messages(customMessages),
    isFeatured: Joi.boolean().optional(),
})




// const addressValidation = Joi.object({
//     fullName: commonPatterns.name.messages(customMessages),
//     phone: phoneValidation,
//     pinCode: pinCodeValidation,
//     state: Joi.string().required().messages(customMessages),
//     city: commonPatterns.name.messages(customMessages),
//     addressLine: commonPatterns.name.messages(customMessages),
//     label: Joi.string().optional().valid('Home','Work','Other').messages(customMessages),
//     isDefault: Joi.boolean().optional().messages(customMessages)
// })
const addressValidation = Joi.object({
    fullName: Joi.string().required().messages({'string.pattern.base':'Full name is required', ...customMessages}),
    phone: phoneValidation,
    pinCode: pinCodeValidation,
    state: Joi.string().required().messages(customMessages),
    city: commonPatterns.name.messages(customMessages),
    addressLine: commonPatterns.name.messages(customMessages),
    label: Joi.string().optional().valid('Home','Work','Other').messages(customMessages),
    isDefault: Joi.boolean().optional().messages(customMessages)
})

const couponValidation = Joi.object({
    code: Joi.string().required().messages({'string.pattern.base':'Coupon code is required', ...customMessages}),
    discountType: Joi.required().messages(customMessages),
    discountValue: Joi.number().required().messages(customMessages),
    maxDiscountAmount: Joi.number().empty('').optional(),
    minOrderAmount: Joi.number().empty('').optional(),
    usageLimit: Joi.number().empty('').optional(),
    usedCount: Joi.number().empty('').optional(),
    perUserLimit: Joi.number().empty('').optional(),
    applicableCategories: Joi.array().items(commonPatterns.objectId).messages(customMessages),
    // applicableProducts: Joi.number().optional(),

    startDate: Joi.date().required().messages(customMessages),
    endDate: Joi.date().required().messages(customMessages),
    isActive: Joi.boolean().optional().messages(customMessages)
})

module.exports = {
    registerValidation,
    loginValidation,
    strongPasswordValidation,
    changePasswordValidation,
    emailValidation,
    resetPasswordValidation,
    adminLoginValidation,
    categoryValidation,
    productValidation,
    updateProfileValidation,
    addressValidation,
    couponValidation
}