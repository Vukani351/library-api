const User = require('../models/userModel');

exports.getUsers = async (request, reply) => {
  try {
    // const { name, email, password } = request.body;
    const users = await User.findAll();
    reply.code(201).send(users);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.getUser = async (request, reply) => {
  try {
    // to get user by password - const project:
    //  await Project.findOne({ where: { title: 'My Title' } });
    const { userId } = request.params;
    // your code here
    console.log("testing links: ", userId);
    // const { name, email, password } = request.body;
    const user = await User.findOne({ userId: userId });
    reply.code(201).send(user);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.register = async (request, reply) => {
  const updated_at = Date();
  const created_at = Date();

  try {
    const { name, email, password } = request.body;
    console.log("user data: ", name, email, password);
    const user = await User.create({ name: name, email: email, password: password});
    // const token = fastify.jwt.sign({ user })
    reply.code(201).send(token);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

// exports.login = async (request, reply) => {
//   try {
//     // let user login then provide them with a JWT token.
//     const { name, password } = request.params;
//     // your code here
//     console.log("testing links: ", name, password);
    
//     const users = await User.findOne({
//       name: name,
//       password: password,
//     });
//     const token = jwt.sign({ payload })
//     reply.code(201).send(users);
//   } catch (error) {
//     reply.code(500).send({ error: error.message });
//   }
// };

// Login user and generate JWT
exports.login = async (request, reply) => {
  try {
    const { email, password } = request.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return reply.code(401).send({ error: 'Invalid email or password' });
    }

    // Check if the provided password matches the stored one
    if (user.password !== password) {
      return reply.code(401).send({ error: 'Invalid email or password' });
    }

    // Sign a JWT
    const token = await reply.jwtSign({ id: user.id, email: user.email });
    reply.send({ message: 'Login successful', token: token });
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.logout = async (request, reply) => {
  try {
    // your code here
    
    reply.code(201).send("success");
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

// Protected route example
exports.getProfile = async (request, reply) => {
  try {
    const userId = request.user.id; // Extracted from JWT
    const user = await User.findByPk(userId);
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    reply.send({ user });
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};