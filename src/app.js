require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors'); // Use require for CORS
const userRoutes = require('./routes/userRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const bookRoutes = require('./routes/bookRoutes');
const sequelize = require('./config/db');

// register our jwt decorator:
fastify.register(require('@fastify/jwt'), {
  secret: process.env.devsecrete  || 'optionalsecretkey',
})

// Add JWT authentication decorator
fastify.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify(); // Verifies the JWT token in the request
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

// Register routes
fastify.register(userRoutes, { prefix: '/api/user' });
fastify.register(libraryRoutes, { prefix: '/api/library' });
fastify.register(bookRoutes, { prefix: '/api/book' });

fastify.register(require('@fastify/diagnostics-channel'), {})

// Register CORS
/*await fastify.register(cors, {
  // Add your CORS options here if needed
});*/

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
