module.exports = {
    SITE_URL: process.env.SITE_URL || 'http://localhost:3000/',
    MONGO_URL: process.env.MONGODB_URI || 'mongodb://localhost:27017/intec-offers',
    SERVER_PORT: process.env.PORT || 3000,
    EMAIL_CONFIG: process.env.SMTP_URL || "smtps://[USER]:[PASSWORD]@[HOST]/?pool=true"
}