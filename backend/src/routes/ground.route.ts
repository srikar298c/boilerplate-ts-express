import { Router } from 'express';
import { groundServices } from '../services'; // Import service functions
import auth from '../middlewares/auth'; // Your RBAC authentication middleware
import { validateRequest } from '../middlewares/validate';
import { groundValidation } from '../validations';
import { groundController } from '../controllers';
const router = Router();

// -- Ground Routes --

// Get all grounds
router.get('/', auth('getUsers'), groundController.getAllGrounds);

router.post(
  '/',
  auth('manageUsers'), // Only 'admin' can manage grounds
  validateRequest(groundValidation.groundSchema), // Validate body data using Zod
  groundController.createGround
);

router.put(
  '/:id',
  auth('manageUsers'), // Only 'admin' can update grounds
  validateRequest(groundValidation.groundSchema), // Validate body data using Zod
  groundController.updateGround
);

// Delete a ground
router.delete('/:id', auth('manageUsers'), groundController.deleteGround);

// Add slots to a ground (optional validation can be added here)
router.post('/:groundId/slots', auth('manageUsers'), groundController.addSlotsToGround);

export default router;