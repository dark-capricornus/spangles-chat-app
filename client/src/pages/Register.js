import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const result = await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
        fullName: data.fullName
      }, rememberMe);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            width: '100%',
            maxWidth: 400,
            borderRadius: 2
          }}
        >
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography component="h1" variant="h4" color="primary" fontWeight="bold">
              Social Media
            </Typography>
            <Typography variant="h5" sx={{ mt: 2 }}>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Join our community today
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="fullName"
              label="Full Name"
              name="fullName"
              autoComplete="name"
              autoFocus
              disabled={loading}
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
              {...register('fullName', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Full name must be at least 2 characters'
                },
                maxLength: {
                  value: 100,
                  message: 'Full name must be less than 100 characters'
                }
              })}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              disabled={loading}
              error={!!errors.username}
              helperText={errors.username?.message}
              {...register('username', {
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters'
                },
                maxLength: {
                  value: 30,
                  message: 'Username must be less than 30 characters'
                },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Username can only contain letters, numbers, and underscores'
                }
              })}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              disabled={loading}
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              disabled={loading}
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              disabled={loading}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value =>
                  value === password || 'Passwords do not match'              })}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  name="rememberMe"
                  color="primary"
                />
              }
              label="Keep me signed in for 30 days"
              sx={{ mt: 1, mb: 1 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, height: 48 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Create Account'
              )}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link
                component={RouterLink}
                to="/login"
                variant="body2"
                sx={{ textDecoration: 'none' }}
              >
                Already have an account? Sign In
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
