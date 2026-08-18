export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());
    const userRole = req.user.role.toUpperCase();

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${userRole}' is not authorized to perform this action.`
      });
    }

    next();
  };
};
