import { prisma } from '../utils/prisma';

export const getActiveVenues = async () => {
  return await prisma.venue.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      category: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
};
