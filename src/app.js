const fastify = require('fastify')({ logger: true });
const userRoutes = require('./routes/userRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const bookRoutes = require('./routes/bookRoutes');
const sequelize = require('./config/db');

// Register routes
fastify.register(userRoutes, { prefix: '/api/users' });
fastify.register(libraryRoutes, { prefix: '/api/libraries' });
fastify.register(bookRoutes, { prefix: '/api/books' });

// Database connection
sequelize
  .authenticate()
  .then(() => fastify.log.info('Database connected'))
  .catch((err) => fastify.log.error('Database connection failed:', err));

  // Declare a route
fastify.get('/', function (request, reply) {
    reply.send( "It works..." );
  })

// Export the instance for server.js
module.exports = fastify;
