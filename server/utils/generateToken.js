const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    const payload = {
        id: user._id,
        role: user.role,
        fullName: `${user.firstName} ${user.lastName}`,
        wsnId: user.wsnId, // optional, handy for hotspot references
    };

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

module.exports = generateToken;
