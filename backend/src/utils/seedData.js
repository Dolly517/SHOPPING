const { User, Product, Cart } = require('../models');

const seedData = async () => {
  try {
    const userCount = await User.count();
    if (userCount > 0) return; // Already seeded

    console.log('🌱 Seeding initial data...');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@shopwave.com',
      password: 'admin123',
      role: 'admin',
    });
    await Cart.create({ userId: admin.id });

    // Create demo user
    const user = await User.create({
      name: 'John Doe',
      email: 'user@shopwave.com',
      password: 'user123',
      role: 'user',
    });
    await Cart.create({ userId: user.id });

    // Create sample products
    const products = [
      {
        name: 'iPhone 15 Pro Max',
        description: 'The latest Apple iPhone with A17 Pro chip, titanium design, and a 48MP camera system with 5x optical zoom.',
        price: 1199.99,
        stock: 50,
        category: 'Electronics',
        brand: 'Apple',
        featured: true,
        rating: 4.8,
        numReviews: 124,
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&q=80',
      },
      {
        name: 'MacBook Pro 16"',
        description: 'Powerful laptop with M3 Max chip, 16-inch Liquid Retina XDR display, 18 hours battery life.',
        price: 2499.99,
        stock: 30,
        category: 'Electronics',
        brand: 'Apple',
        featured: true,
        rating: 4.9,
        numReviews: 89,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
      },
      {
        name: 'Samsung 4K OLED TV 55"',
        description: 'Crystal clear 4K OLED display with HDR, Smart TV capabilities, and immersive sound.',
        price: 1299.99,
        stock: 25,
        category: 'Electronics',
        brand: 'Samsung',
        featured: true,
        rating: 4.6,
        numReviews: 67,
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=400&q=80',
      },
      {
        name: 'Sony WH-1000XM5 Headphones',
        description: 'Industry-leading noise cancellation with 30-hour battery life and exceptional audio quality.',
        price: 349.99,
        stock: 75,
        category: 'Electronics',
        brand: 'Sony',
        featured: false,
        rating: 4.7,
        numReviews: 203,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
      },
      {
        name: 'Nike Air Max 270',
        description: 'Comfortable sneakers with visible Air unit in the heel for all-day cushioning.',
        price: 149.99,
        stock: 100,
        category: 'Clothing',
        brand: 'Nike',
        featured: true,
        rating: 4.5,
        numReviews: 312,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
      },
      {
        name: 'Levi\'s 501 Original Jeans',
        description: 'Classic straight-leg jeans with button fly and 100% cotton denim construction.',
        price: 79.99,
        stock: 150,
        category: 'Clothing',
        brand: 'Levis',
        featured: false,
        rating: 4.3,
        numReviews: 456,
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80',
      },
      {
        name: 'Gaming Chair Pro',
        description: 'Ergonomic gaming chair with lumbar support, adjustable armrests, and recline up to 180°.',
        price: 399.99,
        stock: 40,
        category: 'Furniture',
        brand: 'DXRacer',
        featured: false,
        rating: 4.4,
        numReviews: 178,
        image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&q=80',
      },
      {
        name: 'Instant Pot Duo 7-in-1',
        description: 'Multi-use pressure cooker that replaces 7 kitchen appliances - pressure cooker, slow cooker, rice cooker, and more.',
        price: 89.99,
        stock: 80,
        category: 'Kitchen',
        brand: 'Instant Pot',
        featured: true,
        rating: 4.6,
        numReviews: 892,
        image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80',
      },
      {
        name: 'Dyson V15 Vacuum',
        description: 'Cordless vacuum with laser dust detection and advanced filtration for a truly deep clean.',
        price: 699.99,
        stock: 35,
        category: 'Home',
        brand: 'Dyson',
        featured: false,
        rating: 4.8,
        numReviews: 143,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
      },
      {
        name: 'Canon EOS R5 Camera',
        description: 'Professional mirrorless camera with 45MP full-frame sensor and 8K RAW video capability.',
        price: 3899.99,
        stock: 20,
        category: 'Electronics',
        brand: 'Canon',
        featured: true,
        rating: 4.9,
        numReviews: 56,
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80',
      },
      {
        name: 'Yoga Mat Premium',
        description: 'Non-slip eco-friendly yoga mat with alignment lines and superior cushioning for all types of yoga.',
        price: 59.99,
        stock: 200,
        category: 'Sports',
        brand: 'Manduka',
        featured: false,
        rating: 4.7,
        numReviews: 267,
        image: 'https://images.unsplash.com/photo-1601925228782-55cf3b7bc5b8?w=400&q=80',
      },
      {
        name: 'PlayStation 5',
        description: 'Next-gen gaming console with ultra-high-speed SSD, 3D audio, and haptic feedback controller.',
        price: 499.99,
        stock: 15,
        category: 'Electronics',
        brand: 'Sony',
        featured: true,
        rating: 4.9,
        numReviews: 1204,
        image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400&q=80',
      },
    ];

    await Product.bulkCreate(products);
    console.log('✅ Sample data seeded successfully');
    console.log('👤 Admin: admin@shopwave.com / admin123');
    console.log('👤 User: user@shopwave.com / user123');
  } catch (error) {
    console.error('❌ Seed error:', error.message);
  }
};

module.exports = seedData;
