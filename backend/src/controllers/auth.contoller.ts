import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync'; // Assuming catchAsync is a utility for async error handling
import { authService, userService, tokenService, emailService } from '../services'; // Prisma services

/**
 * Register a new user
 */
const register = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body); // Prisma user creation
  const tokens = await tokenService.generateAuthTokens(user); // Generate JWT tokens
  res.status(httpStatus.CREATED).send({ user, tokens });
});

/**
 * Login a user with email and password
 */
const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await authService.loginWithEmailAndPassword(email, password); // User login
  const tokens = await tokenService.generateAuthTokens(user); 
  res.status(httpStatus.OK).send({ user, tokens });
});

/**
 * Logout user by blacklisting refresh token
 */
const logout = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken); // Blacklist the refresh token
  res.status(httpStatus.NO_CONTENT).send(); // No content on successful logout
});

/**
 * Refresh authentication tokens (access and refresh tokens)
 */
const refreshTokens = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshAuth(refreshToken); // Generate new tokens
  res.send({ ...tokens });
});

/**
 * Generate a password reset token and send email
 */
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const resetPasswordToken = await tokenService.generateResetPasswordToken(email); // Generate reset token
  await emailService.sendResetPasswordEmail(email, resetPasswordToken); // Send reset email
  res.status(httpStatus.NO_CONTENT).send(); // No content after sending email
});

/**
 * Reset user's password using a token
 */
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.query; // Token from query params
  const { password } = req.body; // New password from request body
  await authService.resetPassword(token as string, password); // Reset password using token
  res.status(httpStatus.NO_CONTENT).send(); // No content after successful reset
});

// const sendUserVerificationEmail = catchAsync(async (req: Request, res: Response) => {
//   // Ensure user exists and has an email
//   if (!req.user || !req.user.email) {
//     throw new ApiError('User not found', httpStatus.UNAUTHORIZED);
//   }

//   const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  
//   // Send email to the user with the verification token
//   await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);

//   // No content response after sending the email
//   res.status(httpStatus.NO_CONTENT).send();
// });
/**
 * Verify email using the token
 */
const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.query; // Token from query params
  await authService.verifyEmail(token as string); // Verify email using the token
  res.status(httpStatus.NO_CONTENT).send(); // No content after successful verification
});

export const authController= {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail
};
