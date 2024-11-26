import { PrismaClient, Token } from '@prisma/client';
import { TokenTypes } from '../config/token';
const prisma = new PrismaClient();

// Define a toJSON function to sanitize the token data
export const toJSON = <T extends Record<string, any>>(data: T): T => {
  const result = { ...data };

  // Remove private fields, if marked (e.g., define a private fields array)
  const privateFields = ['password']; // Add other private fields here
  privateFields.forEach((field) => delete result[field]);

  // Remove metadata fields if present
  delete result.__v;
  delete result.createdAt;
  delete result.updatedAt;

  return result;
};

// Update createToken to accept the blacklisted parameter
const createToken = async (
  userId: number,
  token: string,
  type: TokenTypes,
  expires: Date,
  blacklisted: boolean = false  // Make sure this parameter is included here
): Promise<Token> => {
  try {
    const createdToken = await prisma.token.create({
      data: {
        userId,
        token,
        type,
        expires,
        blacklisted, // Store the blacklisted flag
      },
    });

    return toJSON(createdToken);  // Apply toJSON to the created token
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error creating token: ${error.message}`);
    }
    throw new Error("Unknown error occurred while creating token.");
  }
};


// Get token by userId and type
const getTokenByUserAndType = async (userId: number, type: TokenTypes): Promise<Token | null> => {
  try {
    const token = await prisma.token.findFirst({
      where: {
        userId,
        type,
        blacklisted: false,
      },
    });

    return token ? toJSON(token) : null;  // Apply toJSON to the token if found
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error fetching token: ${error.message}`);
    }
    throw new Error("Unknown error occurred while fetching token.");
  }
};

// Get all tokens for a user
const getTokensByUser = async (userId: number): Promise<Token[]> => {
  try {
    const tokens = await prisma.token.findMany({
      where: {
        userId,
        blacklisted: false,
      },
    });

    return tokens.map(toJSON);  // Apply toJSON to each token
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error fetching tokens for user: ${error.message}`);
    }
    throw new Error("Unknown error occurred while fetching tokens for user.");
  }
};

// Blacklist a token
const blacklistToken = async (tokenId: number): Promise<Token> => {
  try {
    const blacklistedToken = await prisma.token.update({
      where: { id: tokenId },
      data: { blacklisted: true },
    });

    return toJSON(blacklistedToken);  // Apply toJSON to the blacklisted token
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error blacklisting token: ${error.message}`);
    }
    throw new Error("Unknown error occurred while blacklisting token.");
  }
};

// Delete a token by its ID
const deleteToken = async (tokenId: number): Promise<Token> => {
  try {
    const deletedToken = await prisma.token.delete({
      where: { id: tokenId },
    });

    return toJSON(deletedToken);  // Apply toJSON to the deleted token
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error deleting token: ${error.message}`);
    }
    throw new Error("Unknown error occurred while deleting token.");
  }
};
// Add a method to fetch a token by its ID in TokenModel
const getTokenById = async (tokenId: number): Promise<Token | null> => {
  try {
    const token = await prisma.token.findUnique({
      where: { id: tokenId },  // Find token by ID
    });

    return token ? toJSON(token) : null;  // Apply toJSON if token found
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error fetching token by ID: ${error.message}`);
    }
    throw new Error("Unknown error occurred while fetching token by ID.");
  }
};

// Update a token's properties, such as setting it to blacklisted
const updateToken = async (tokenId: number, updateData: Partial<Token>): Promise<Token> => {
  try {
    const updatedToken = await prisma.token.update({
      where: { id: tokenId },  // Find token by ID
      data: updateData,         // Apply the update data
    });

    return toJSON(updatedToken);  // Apply toJSON to the updated token
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error updating token: ${error.message}`);
    }
    throw new Error("Unknown error occurred while updating token.");
  }
};

export const TokenModel = {
  createToken,
  getTokenByUserAndType,
  getTokensByUser,
  getTokenById,
  updateToken,
  blacklistToken,
  deleteToken,
};
