import { Request, Response } from 'express';
import httpStatus from 'http-status';

import ApiError from '../utils/ApiError'; // Custom error handling
import catchAsync from '../utils/catchAsync'; // Wrapper for async functions

const handleGoogleAuth = catchAsync(async (req: Request, res: Response) => {
  const user = req.user; 
  if (!user) {
      throw new ApiError('Authentication failed',
          httpStatus.UNAUTHORIZED,);
  }

  res.status(httpStatus.OK).json({
    message: 'Login successful',
    
  });
});

 const logout = catchAsync(async (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      throw new ApiError('Logout failed', httpStatus.INTERNAL_SERVER_ERROR, );
    }
    res.status(httpStatus.OK).json({
      message: 'Logout successful',
    });
  });
});

export const googleAuthController={
    handleGoogleAuth,
    logout
}