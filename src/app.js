require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors'); // Use require for CORS
const userRoutes = require('./routes/userRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const bookRoutes = require('./routes/bookRoutes');
const sequelize = require('./config/db');

// register our jwt decorator:
fastify.register(require('@fastify/jwt'), {
  secret: process.env.devsecrete
})

// Register routes
fastify.register(userRoutes, { prefix: '/api/user' });
fastify.register(libraryRoutes, { prefix: '/api/librarie' });
fastify.register(bookRoutes, { prefix: '/api/book' });

// Register CORS
(async () => {
  try {
    await fastify.register(cors, {
      // Add your CORS options here if needed
    });
    console.log('CORS registered successfully');
  } catch (err) {
    console.error('Error registering CORS:', err);
    process.exit(1);
  }
})();

// Database connection
sequelize
  .authenticate()
  .then(() => fastify.log.info('Database connected'))
  .catch((err) => fastify.log.error('Database connection failed:', err));

// Declare a route
fastify.get('/', function (request, reply) {
  reply.send('It works...');
});

// Export the instance for server.js
module.exports = fastify;
