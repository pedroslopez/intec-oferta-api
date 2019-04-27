module.exports = {
    MONGO_URL: process.env.MONGODB_URI || 'mongodb://localhost:27017/intec-offers',
    SERVER_PORT: process.env.PORT || 3000
}