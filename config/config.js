module.exports = {
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGO_URI || "mongodb://localhost:27017/Ventaro",
  NODE_ENV: process.env.NODE_ENV || "production",

  BCRYPT_ROUND: 12,

  JWT: {
    USER_SECRET:
      process.env.JWT_USER_SECRET || "your_super_secret_user_jwt_key",
    ADMIN_SECRET:
      process.env.JWT_ADMIN_SECRET || "your_super_secret_admin_jwt_key",
    RESET_SECRET:
      process.env.JWT_RESET_SECRET || "your_super_secret_reset_jwt_key",
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    RESET_EXPIRES_IN: process.env.JWT_RESET_EXPIRES_IN || "10m",
  },

  CORS: {
    ORIGIN: ["https://ventaro.space", "https://www.ventaro.space", "http://localhost:5173", "http://localhost:5175"],
    CREDENTIALS: true,
    METHODS: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    ALLOWED_HEADERS: ["Content-Type", "Authorization", "X-Requested-With"],
  },

  EMAIL: process.env.EMAIL,
  APP_PASSWORD: process.env.APP_PASSWORD,

  DEFAULT_ADMIN: {
    EMAIL: process.env.ADMIN_EMAIL || "admin@admin.com",
    PASSWORD: process.env.ADMIN_PASSWORD || "admin123",
    NAME: "Administrator",
  },

  LOGGING: {
    LEVEL: "info",
    MAX_FILES: 5,
    MAX_SIZE: "20m",
  },

  FREE_SHIPPING_THRESHOLD: 499,
  DELIVERY_FEE: 40,
  COD_FEE: 10,

  RAZORPAY: {
    API_KEY: process.env.RAZORPAY_API_KEY || "rzp_test_RvNYsDtZ30gj1z",
    SECRET_KEY: process.env.RAZORPAY_KEY_SECRET || "Bx1ZZ3zR2COEWaDEHA5l68du",
  },

  ORDER_STATUS: {
    PENDING: "PENDING", // order created, payment not done
    SHIPPED: "SHIPPED",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED",
    RETURN_INITIATED: "RETURN_INITIATED",
    RETURNED: "RETURNED",
  },

  PAYMENT_STATUS: {
    PENDING: "PENDING", // order created, payment not done
    PAID: "PAID", // payment successful
    FAILED: "FAILED",
    REFUND_INITIATED: "REFUND_INITIATED",
    REFUNDED: "REFUNDED",
  },

  OPENAI_API_KEY: process.env.OPEN_API_KEY,

  AWS: {
    ACCESS_KEY: process.env.AWS_ACCESS_KEY_ID,
    SECRET_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    REGION: process.env.AWS_REGION,
    BUCKET_NAME: process.env.AWS_BUCKET_NAME,
  },
};
