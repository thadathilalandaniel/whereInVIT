import { prisma } from '../utils/prisma';

export const getActiveCategories = async () => {
  return await prisma.category.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
};
