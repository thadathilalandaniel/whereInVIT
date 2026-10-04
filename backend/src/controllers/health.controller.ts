import { Request, Response } from 'express';

export const getHealth = (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "whereInVIT backend is running",
  });
};
