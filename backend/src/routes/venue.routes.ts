import { Router } from 'express';
import { getVenues } from '../controllers/venue.controller';

const router = Router();

router.get('/', getVenues);

export default router;
