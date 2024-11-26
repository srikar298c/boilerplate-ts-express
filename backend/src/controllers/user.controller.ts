import httpStatus from 'http-status';
import { Request, Response } from 'express';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { userService } from '../services';
import { User as PrismaUser } from '@prisma/client';
import { paginate } from '../prismaClient'; 

type UserFilter = {
  name?: string;
  role?: string;
};

type UserQueryOptions = {
  sortBy?: string;
  limit?: number;
  page?: number;
};
const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req: Request, res: Response) => {
  const filter: UserFilter = pick(req.query, ['name', 'role']);
  
  // Convert string query params to appropriate types
  const options: UserQueryOptions = {
    sortBy: pick(req.query, ['sortBy'])?.sortBy as string,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
  };
  
  // Use the paginate function from your prismaClient utility
  const result = await paginate<PrismaUser>('user', filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getUserById(Number(req.params.userId));
  if (!user) {
    throw new ApiError('User not found',httpStatus.NOT_FOUND, );
  }
  res.send(user);
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.updateUser(Number(req.params.userId), req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  await userService.deleteUser(Number(req.params.userId));
  res.status(httpStatus.NO_CONTENT).send();
});

export const userController = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};