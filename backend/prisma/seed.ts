import { PrismaClient, VenueCategory } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  'ID & Access Cards',
  'Keys',
  'Wallets & Card Holders',
  'Smartphones',
  'Books',
  'Bags & Backpacks',
  'Earphones & Headphones',
  'Chargers & Cables',
  'Calculators',
  'Laptops & Tablets',
  'Water Bottles & Flasks',
  'Spectacles',
  'Stationery',
  'USB & Storage Devices',
  'Clothing',
  'Sports Equipment',
  'Lab Equipment',
  'Electronic Components',
  'Documents & Certificates',
  'Cash & Cards',
  'Laptop Accessories',
  'Mobile Accessories',
  'Smartwatches & Wearables',
  'Umbrellas',
  'Footwear',
  'Jewellery & Accessories',
  'Gym Equipment & Accessories',
  'Musical Instruments',
  'Hostel Items',
  'Personal Care Items',
  'Other'
];

const venues = [
  // Academic Blocks
  { name: 'SJT', category: VenueCategory.ACADEMIC_BLOCK },
  { name: 'TT', category: VenueCategory.ACADEMIC_BLOCK },
  { name: 'PRP', category: VenueCategory.ACADEMIC_BLOCK },
  { name: 'SMV', category: VenueCategory.ACADEMIC_BLOCK },
  { name: 'MB', category: VenueCategory.ACADEMIC_BLOCK },
  { name: 'GDN', category: VenueCategory.ACADEMIC_BLOCK },
  { name: 'CDMM', category: VenueCategory.ACADEMIC_BLOCK },
  
  // Men's Hostels
  { name: 'MH A', category: VenueCategory.MENS_HOSTEL },
  { name: 'MH B', category: VenueCategory.MENS_HOSTEL },
  { name: 'MH B Annex', category: VenueCategory.MENS_HOSTEL },
  { name: 'MH C', category: VenueCategory.MENS_HOSTEL },
  { name: 'MH D', category: VenueCategory.MENS_HOSTEL },
  { name: 'MH D Annex', category: VenueCategory.MENS_HOSTEL },
  { name: 'MH E', category: VenueCategory.MENS_HOSTEL },
  { name: 'MH F', category: VenueCategory.MENS_HOSTEL },
  { name: 'MH G', category: VenueCategory.MENS_HOSTEL },
  { name: 'MH H', category: VenueCategory.MENS_HOSTEL },
  { name: 'MH J', category: VenueCategory.MENS_HOSTEL },
  { name: 'MH K', category: VenueCategory.MENS_HOSTEL },
  { name: 'MH L', category: VenueCategory.MENS_HOSTEL },
  { name: 'MH M', category: VenueCategory.MENS_HOSTEL },
  { name: 'MH M Annex', category: VenueCategory.MENS_HOSTEL },
  { name: 'MH N', category: VenueCategory.MENS_HOSTEL },
  { name: 'MH N Annex', category: VenueCategory.MENS_HOSTEL },
  { name: 'MH P', category: VenueCategory.MENS_HOSTEL },
  { name: 'MH Q', category: VenueCategory.MENS_HOSTEL },
  { name: 'MH R', category: VenueCategory.MENS_HOSTEL },
  { name: 'MH S', category: VenueCategory.MENS_HOSTEL },
  { name: 'MH T', category: VenueCategory.MENS_HOSTEL },
  
  // Ladies' Hostels
  { name: 'LH A', category: VenueCategory.LADIES_HOSTEL },
  { name: 'LH B', category: VenueCategory.LADIES_HOSTEL },
  { name: 'LH C', category: VenueCategory.LADIES_HOSTEL },
  { name: 'LH D', category: VenueCategory.LADIES_HOSTEL },
  { name: 'LH E', category: VenueCategory.LADIES_HOSTEL },
  { name: 'LH F', category: VenueCategory.LADIES_HOSTEL },
  { name: 'LH G', category: VenueCategory.LADIES_HOSTEL },
  { name: 'LH H', category: VenueCategory.LADIES_HOSTEL },
  { name: 'LH J', category: VenueCategory.LADIES_HOSTEL },
  { name: 'RGT H', category: VenueCategory.LADIES_HOSTEL },
  { name: 'LH GH (Annex)', category: VenueCategory.LADIES_HOSTEL },
  
  // Food & Dining
  { name: 'Gazebo', category: VenueCategory.FOOD_DINING },
  { name: 'Food Mall', category: VenueCategory.FOOD_DINING },
  { name: 'Darling Food Court (DC)', category: VenueCategory.FOOD_DINING },
  { name: 'One Food World', category: VenueCategory.FOOD_DINING },
  
  // Sports & Fitness
  { name: 'Outdoor Stadium', category: VenueCategory.SPORTS_FITNESS },
  { name: 'Indoor Gym', category: VenueCategory.SPORTS_FITNESS },
  { name: 'Outdoor Gym', category: VenueCategory.SPORTS_FITNESS },
  { name: 'Fitty Gym', category: VenueCategory.SPORTS_FITNESS },
  { name: 'Fitty Stag Gym', category: VenueCategory.SPORTS_FITNESS },
  { name: 'VIT Men\'s Swimming Pools', category: VenueCategory.SPORTS_FITNESS },
  
  // Campus Spots
  { name: 'Foodys', category: VenueCategory.CAMPUS_SPOT },
  { name: 'Woodys', category: VenueCategory.CAMPUS_SPOT },
  
  // Library
  { name: 'Central Library', category: VenueCategory.LIBRARY }
];

async function main() {
  console.log('Seeding data...');

  // Seed Categories
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Categories seeded.');

  // Seed Venues
  for (const venue of venues) {
    await prisma.venue.upsert({
      where: { name: venue.name },
      update: { category: venue.category },
      create: venue,
    });
  }
  console.log('Venues seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
