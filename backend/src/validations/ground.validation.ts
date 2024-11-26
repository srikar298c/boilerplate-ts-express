import { z } from 'zod';

// Validation schema for creating a ground
const groundSchema = z.object({
  groundName: z.string().min(1, 'Ground name is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().optional(),
  type: z.string().min(1, 'Type is required'), // Consider making this an enum if you have predefined types
  availability: z.boolean().optional().default(true),
  media: z.string().url('Media must be a valid URL'),
  rating: z.number().min(0).max(5).optional(),
  totalPeopleRated: z.number().min(0).optional().default(0),
});

const slotSchema = z.object({
  groundId: z.number().int().positive('Ground ID must be a positive integer'),
  timeRange: z.string().min(1, 'Time range is required'),
  price: z.number().positive('Price must be a positive number'),
});

export const groundValidation = {
    groundSchema,
    slotSchema
}