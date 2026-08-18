import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding University Canteen Database...');

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const manager = await prisma.user.create({
    data: {
      name: 'Chef Gordon (Canteen Manager)',
      email: 'manager@canteen.edu',
      passwordHash,
      role: 'MANAGER',
      institutionId: 'MGR-001',
      department: 'Hospitality & Dining',
      phone: '+1 555-0100',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Manager'
    }
  });

  const teacher = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Connor (Faculty)',
      email: 'teacher@canteen.edu',
      passwordHash,
      role: 'TEACHER',
      institutionId: 'FAC-204',
      department: 'Computer Science & AI',
      phone: '+1 555-0199',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Teacher'
    }
  });

  const student = await prisma.user.create({
    data: {
      name: 'Alex Johnson (Student)',
      email: 'student@canteen.edu',
      passwordHash,
      role: 'STUDENT',
      institutionId: 'STU-8842',
      department: 'Software Engineering',
      phone: '+1 555-0144',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Student'
    }
  });

  console.log('✅ Users seeded:');
  console.log('   - Manager: manager@canteen.edu (password123)');
  console.log('   - Teacher: teacher@canteen.edu (password123)');
  console.log('   - Student: student@canteen.edu (password123)');

  // 2. Create Categories
  const breakfast = await prisma.category.create({
    data: { name: 'Breakfast', description: 'Fresh morning meals, pancakes, wraps & eggs', icon: 'Sun' }
  });
  const lunch = await prisma.category.create({
    data: { name: 'Lunch & Meals', description: 'Nutritious lunch platters, bowls & rice dishes', icon: 'Utensils' }
  });
  const snacks = await prisma.category.create({
    data: { name: 'Snacks & Quick Bites', description: 'Burgers, sandwiches, fries & rolls', icon: 'Pizza' }
  });
  const beverages = await prisma.category.create({
    data: { name: 'Beverages & Coffee', description: 'Artisan coffees, fresh juices, teas & sodas', icon: 'Coffee' }
  });
  const desserts = await prisma.category.create({
    data: { name: 'Desserts & Sweets', description: 'Cookies, brownies, cakes & ice cream', icon: 'IceCream' }
  });

  console.log('✅ Categories seeded: 5 categories');

  // 3. Create Menu Items
  const menuItemsData = [
    // Breakfast
    {
      name: 'Loaded Avocado & Egg Toast',
      description: 'Toasted sourdough bread topped with creamy smashed avocado, poached organic eggs, and chilli flakes.',
      price: 4.50,
      categoryId: breakfast.id,
      imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=60',
      stockQuantity: 25,
      isAvailable: true,
      isVeg: true,
      prepTimeMinutes: 8,
      calories: 380
    },
    {
      name: 'Fluffy Buttermilk Pancakes',
      description: 'Stack of 3 golden buttermilk pancakes served with pure maple syrup and fresh blueberries.',
      price: 5.00,
      categoryId: breakfast.id,
      imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&auto=format&fit=crop&q=60',
      stockQuantity: 30,
      isAvailable: true,
      isVeg: true,
      prepTimeMinutes: 10,
      calories: 460
    },
    {
      name: 'Crispy Bacon & Cheddar Bagel',
      description: 'Toasted sesame bagel stuffed with crispy bacon strips, folded eggs, and melted aged cheddar.',
      price: 5.50,
      categoryId: breakfast.id,
      imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60',
      stockQuantity: 18,
      isAvailable: true,
      isVeg: false,
      prepTimeMinutes: 7,
      calories: 520
    },

    // Lunch & Meals
    {
      name: 'Grilled Teriyaki Chicken Rice Bowl',
      description: 'Char-grilled chicken thigh glazed with house teriyaki sauce over steamed jasmine rice with broccoli and edamame.',
      price: 7.50,
      categoryId: lunch.id,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
      stockQuantity: 35,
      isAvailable: true,
      isVeg: false,
      prepTimeMinutes: 12,
      calories: 620
    },
    {
      name: 'Mediterranean Falafel Bowl',
      description: 'Crispy spiced falafel balls on quinoa, Greek salad, hummus, pickled cabbage, and tahini drizzle.',
      price: 6.80,
      categoryId: lunch.id,
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60',
      stockQuantity: 20,
      isAvailable: true,
      isVeg: true,
      prepTimeMinutes: 10,
      calories: 490
    },
    {
      name: 'Classic Paneer Butter Masala Combo',
      description: 'Rich tomato cream curry with cottage cheese cubes, served with 2 butter naans and fragrant jeera rice.',
      price: 7.00,
      categoryId: lunch.id,
      imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60',
      stockQuantity: 22,
      isAvailable: true,
      isVeg: true,
      prepTimeMinutes: 15,
      calories: 680
    },

    // Snacks
    {
      name: 'Neubrutal Double Smash Cheeseburger',
      description: 'Double beef patties smashed crispy with double American cheese, caramelized onions, pickles & secret sauce.',
      price: 6.50,
      categoryId: snacks.id,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
      stockQuantity: 40,
      isAvailable: true,
      isVeg: false,
      prepTimeMinutes: 10,
      calories: 740
    },
    {
      name: 'Peri-Peri Loaded Crinkle Fries',
      description: 'Crispy golden crinkle cut fries tossed in spicy peri-peri seasoning and drizzled with cheese sauce.',
      price: 3.50,
      categoryId: snacks.id,
      imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=60',
      stockQuantity: 50,
      isAvailable: true,
      isVeg: true,
      prepTimeMinutes: 6,
      calories: 420
    },
    {
      name: 'Crispy Veggie Spring Rolls (4 pcs)',
      description: 'Hand-rolled vegetable spring rolls with shredded cabbage, carrots, and sweet chili dipping dip.',
      price: 3.80,
      categoryId: snacks.id,
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
      stockQuantity: 4, // low stock test
      isAvailable: true,
      isVeg: true,
      prepTimeMinutes: 6,
      calories: 310
    },

    // Beverages
    {
      name: 'Iced Caramel Macchiato',
      description: 'Freshly brewed espresso shots layered with vanilla syrup, cold whole milk, and buttery caramel drizzle.',
      price: 3.80,
      categoryId: beverages.id,
      imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=60',
      stockQuantity: 60,
      isAvailable: true,
      isVeg: true,
      prepTimeMinutes: 4,
      calories: 220
    },
    {
      name: 'Sparkling Fresh Lime Mint Soda',
      description: 'Zesty fresh lime juice, crushed mint leaves, cane sugar syrup, and fizzy sparkling soda.',
      price: 2.50,
      categoryId: beverages.id,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60',
      stockQuantity: 45,
      isAvailable: true,
      isVeg: true,
      prepTimeMinutes: 3,
      calories: 90
    },
    {
      name: 'Matcha Green Tea Latte',
      description: 'Ceremonial grade Japanese Uji matcha whisked with oat milk and honey.',
      price: 4.20,
      categoryId: beverages.id,
      imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=60',
      stockQuantity: 30,
      isAvailable: true,
      isVeg: true,
      prepTimeMinutes: 4,
      calories: 160
    },

    // Desserts
    {
      name: 'Fudgy Triple Chocolate Brownie',
      description: 'Warm, gooey dark chocolate brownie loaded with Belgian chocolate chunks and sea salt flakes.',
      price: 3.20,
      categoryId: desserts.id,
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60',
      stockQuantity: 15,
      isAvailable: true,
      isVeg: true,
      prepTimeMinutes: 2,
      calories: 390
    },
    {
      name: 'New York Style Berry Cheesecake',
      description: 'Classic creamy baked cheesecake on graham cracker crust with raspberry coulis.',
      price: 4.80,
      categoryId: desserts.id,
      imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=60',
      stockQuantity: 8,
      isAvailable: true,
      isVeg: true,
      prepTimeMinutes: 2,
      calories: 430
    }
  ];

  const createdMenuItems = [];
  for (const item of menuItemsData) {
    const mi = await prisma.menuItem.create({ data: item });
    createdMenuItems.push(mi);
  }

  console.log(`✅ Menu items seeded: ${createdMenuItems.length} items`);

  // 4. Create Sample Orders
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-749210',
      userId: teacher.id,
      status: 'PREPARING',
      totalAmount: 11.30,
      pickupTime: '12:30 PM (Faculty Break)',
      isPriority: true,
      notes: 'Please pack in eco-friendly containers. Extra napkins.',
      items: {
        create: [
          { menuItemId: createdMenuItems[3].id, quantity: 1, priceAtOrder: 7.50 }, // Teriyaki Chicken Bowl
          { menuItemId: createdMenuItems[9].id, quantity: 1, priceAtOrder: 3.80 }  // Iced Caramel Macchiato
        ]
      }
    }
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-883194',
      userId: student.id,
      status: 'READY',
      totalAmount: 10.00,
      pickupTime: 'Immediate (ASAP)',
      isPriority: false,
      notes: 'Less spicy please!',
      items: {
        create: [
          { menuItemId: createdMenuItems[6].id, quantity: 1, priceAtOrder: 6.50 }, // Smash Burger
          { menuItemId: createdMenuItems[7].id, quantity: 1, priceAtOrder: 3.50 }  // Peri-peri Fries
        ]
      }
    }
  });

  const order3 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-912405',
      userId: student.id,
      status: 'COMPLETED',
      totalAmount: 4.50,
      pickupTime: '09:00 AM',
      isPriority: false,
      items: {
        create: [
          { menuItemId: createdMenuItems[0].id, quantity: 1, priceAtOrder: 4.50 } // Avocado Toast
        ]
      }
    }
  });

  console.log('✅ Sample orders seeded: 3 orders');
  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
