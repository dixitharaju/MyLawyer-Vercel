// MongoDB Configuration
process.env.MONGODB_URI = 'mongodb+srv://mini_adMin_PrJect:<password>@miniprojectcluster.ussrnq5.mongodb.net/lawyerconnect?retryWrites=true&w=majority&appName=MiniProjectCluster';
process.env.DB_NAME = 'lawyerconnect';

// Server Configuration
process.env.PORT = process.env.PORT || '5000';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

console.log('Configuration loaded:');
console.log('- Database:', process.env.DB_NAME);
console.log('- MongoDB URI configured');
console.log('- Port:', process.env.PORT);
console.log('- Environment:', process.env.NODE_ENV);








