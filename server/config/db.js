const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI;


const connectDb = async () => { 
    try {
        await mongoose.connect(mongoURI)
        console.log('✅✅mongodb connected');
        
    } catch (error) {
        console.error('❌❌mongodb connection failed:', error.message);
    }
}
module.exports = connectDb;