const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // strictPopulate:false,
        });
        console.log(`MongoDB Connected: ${conn.connections[0].host} ${conn.connections[0].port} ${conn.connections[0].name}`);
    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit();
    }
};

module.exports = connectDB;