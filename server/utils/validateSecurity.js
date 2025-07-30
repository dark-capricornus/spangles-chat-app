const validateProductionSecurity = () => {
  const errors = [];
  const warnings = [];

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET) {
      errors.push('JWT_SECRET environment variable is required in production');
    } else {
      if (process.env.JWT_SECRET.length < 32) {
        errors.push('JWT_SECRET must be at least 32 characters long in production');
      }
      if (process.env.JWT_SECRET === 'your_jwt_secret' || process.env.JWT_SECRET.includes('default')) {
        errors.push('Default JWT_SECRET detected. Please use a secure, unique secret in production');
      }
      if (!process.env.JWT_SECRET.match(/[A-Z]/) || !process.env.JWT_SECRET.match(/[a-z]/) || !process.env.JWT_SECRET.match(/[0-9]/)) {
        warnings.push('JWT_SECRET should contain uppercase, lowercase, and numeric characters for better security');
      }
    }

    if (!process.env.MONGODB_URI) {
      errors.push('MONGODB_URI environment variable is required in production');
    } else {
      if (process.env.MONGODB_URI.includes('localhost')) {
        warnings.push('Using localhost MongoDB in production. Consider using MongoDB Atlas or another cloud database');
      }
    }

    if (!process.env.PORT) {
      warnings.push('PORT environment variable not set. Using default port 5000');
    }
  }

  if (errors.length > 0) {
    console.error('\n🚨 SECURITY ERRORS - App will not start:');
    errors.forEach(error => console.error(`❌ ${error}`));
    console.error('\nPlease fix these security issues before starting the application.\n');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  SECURITY WARNINGS:');
    warnings.forEach(warning => console.warn(`⚠️  ${warning}`));
    console.warn('');
  }

  if (process.env.NODE_ENV === 'production' && errors.length === 0 && warnings.length === 0) {
    console.log('✅ Production security validation passed');
  }
};

module.exports = validateProductionSecurity;
