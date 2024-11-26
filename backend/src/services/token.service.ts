import jwt from 'jsonwebtoken';
import moment, { Moment } from 'moment';
import httpStatus from 'http-status';
import { config } from '../config/config';
import { userService } from '../services';
import { TokenModel } from '../models'; // Adjust this import to match your Prisma setup 
import ApiError from '../utils/ApiError';
import { TokenTypes } from '../config/token'; // Ensure TokenTypes is properly exported
import { Prisma, Token } from '@prisma/client';

interface TokenPayload {
  sub: string; // User ID
  iat: number; // Issued At
  exp: number; // Expiration Time
  type: TokenTypes; // Token Type (ACCESS, REFRESH, etc.)
}

interface AuthTokens {
  access: {
    token: string;
    expires: Date;
  };
  refresh: {
    token: string;
    expires: Date;
  };
}

/**
 * Generate a JWT token
 */
const generateToken = (
  userId: string,
  expires: Moment,
  type: TokenTypes,
  secret: string = config.jwt.secret
): string => {
  const payload: TokenPayload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

const saveToken = async (
  token: string,
  userId: string,
  expires: Moment,
  type: TokenTypes,
  blacklisted: boolean = false
): Promise<Token> => {
  return await TokenModel.createToken(
    Number(userId), // userId is converted to a number
    token,
    type,
    expires.toDate(),
    blacklisted // Now this is the 5th argument and it will work
  );
};


/**
 * Verify the validity of a token
 */
const verifyToken = async (token: string, type: TokenTypes): Promise<Token> => {
  try {
    const payload = jwt.verify(token, config.jwt.secret) as TokenPayload;

    const tokenDoc = await TokenModel.getTokenByUserAndType(Number(payload.sub), type); // Adjust `sub` to number if needed

    if (!tokenDoc || tokenDoc.blacklisted) {
      throw new ApiError('Invalid or expired token', httpStatus.UNAUTHORIZED);
    }

    return tokenDoc;
  } catch (error) {
    throw new ApiError('Invalid or expired token', httpStatus.UNAUTHORIZED);
  }
};

/**
 * Generate authentication tokens (access and refresh tokens)
 */
const generateAuthTokens = async (user: { id: string | number }): Promise<AuthTokens> => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');

  // Ensure user.id is a string when passing to generateToken
  const userId = String(user.id);  // Convert id to string if it's a number

  const accessToken = generateToken(userId, accessTokenExpires, TokenTypes.ACCESS);
  const refreshToken = generateToken(userId, refreshTokenExpires, TokenTypes.REFRESH);

  await saveToken(refreshToken, userId, refreshTokenExpires, TokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};


/**
 * Generate a reset password token
 */
const generateResetPasswordToken = async (email: string): Promise<string> => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError('No user found with this email', httpStatus.NOT_FOUND);
  }

  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateToken(String(user.id), expires, TokenTypes.RESET_PASSWORD);

  await saveToken(resetPasswordToken, String(user.id), expires, TokenTypes.RESET_PASSWORD);
  return resetPasswordToken;
};

/**
 * Generate a verify email token
 */
const generateVerifyEmailToken = async (user: { id: string }): Promise<string> => {
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = generateToken(user.id, expires, TokenTypes.VERIFY_EMAIL);

  await saveToken(verifyEmailToken, user.id, expires, TokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};

// Blacklist a token using the newly added getTokenById
const blacklistToken = async (tokenId: string): Promise<Token> => {
  const tokenDoc = await TokenModel.getTokenById(Number(tokenId)); // Fetch token by ID

  if (!tokenDoc) {
    throw new ApiError('Token not found', httpStatus.NOT_FOUND);
  }

  tokenDoc.blacklisted = true;
  await TokenModel.updateToken(tokenDoc.id, { blacklisted: true }); // Assuming you have an update method

  return tokenDoc;
};



export const tokenService = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
  blacklistToken
};
