import { Request, Response, NextFunction } from 'express';
import * as venueService from '../services/venue.service';

export const getVenues = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const venues = await venueService.getActiveVenues();
    res.json({
      success: true,
      data: venues,
    });
  } catch (error) {
    next(error);
  }
};
