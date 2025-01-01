const { OAuth2Client } = require('google-auth-library');
const User = require('../models/userModel'); // Assuming a Sequelize model for users

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, reply) => {
  const { token } = req.body;

  console.log('JWT token:', token);
  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;
    console.log('JWT token:', payload);

    // Check if the user exists in the database
    let user = await User.findOne({ where: { googleId: sub } });

    if (!user) {
      // Create a new user if it doesn't exist
      user = await User.create({
        googleId: sub,
        email,
        name,
        picture,
      });
    }

    // Generate a JWT token using fastify-jwt
    const jwtToken = reply.jwtSign({ userId: user.id }, { expiresIn: '1h' });

    // Send response
    reply.code(200).send({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
      token: jwtToken, // Send the token for further requests
    });
  } catch (error) {
    console.error('Error during Google login:', error);
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};
