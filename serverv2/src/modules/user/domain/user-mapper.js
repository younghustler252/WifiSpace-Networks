

export const mapUserToDTO = (user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    status: user.status,
    isVerified: user.isVerified,
    permissions: user.permissions?.map(p => p.name) || [],
    phone: user.phone || null,
    nin: user.nin ? '***hidden***' : null, // mask sensitive info
    address: user.address || null,
    dateOfBirth: user.dateOfBirth?.toISOString() || null,
    gender: user.gender || null,
    lastLoginAt: user.lastLoginAt?.toISOString() || null,
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null
});