const User = require('../models/userModel');

exports.getUsers = async (request, reply) => {
  try {
    const users = await User.findAll();
    reply.code(201).send(users);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.getUser = async (request, reply) => {
  try {
    const { userId } = request.params;
    const user = await User.findOne({ where: { id: userId } });
    reply.code(201).send(user);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.register = async (request, reply) => {
  console.log("User Routes ");
  const updated_at = new Date();

  try {
    const { name, email, password } = request.body;
    console.warn("user data: ", name, email, password);
    const user = await User.create({ 
      name: name, 
      email: email, 
      password: password, 
      created_at: created_at, 
      updated_at, created_at
    });

    reply.code(201).send(token, user);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

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
    reply.code(200).send({ message: 'Login successful', data: {
      id: user.id,
      username: user.name,
      email: user.email,
      picture: user.picture,
      token: token,
    }});
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.logout = async (request, reply) => {
  try {
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

    reply.code(200).send({ user });
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};