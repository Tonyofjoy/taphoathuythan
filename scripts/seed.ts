import mongoose from 'mongoose';
import connectDB from '../lib/mongodb';
import Admin from '../lib/models/Admin';
import Category from '../lib/models/Category';
import { hashPassword } from '../lib/auth';

async function seed() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Create admin user
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const hashedPassword = await hashPassword('admin123');
      await Admin.create({
        username: 'admin',
        password: hashedPassword,
        name: 'Quản trị viên',
        role: 'super_admin',
      });
      console.log('✅ Created admin user (username: admin, password: admin123)');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create sample categories
    const categories = [
      { name: 'Đồ uống', slug: 'do-uong', order: 1 },
      { name: 'Món chính', slug: 'mon-chinh', order: 2 },
      { name: 'Món phụ', slug: 'mon-phu', order: 3 },
      { name: 'Tráng miệng', slug: 'trang-mieng', order: 4 },
    ];

    for (const cat of categories) {
      const existing = await Category.findOne({ slug: cat.slug });
      if (!existing) {
        await Category.create(cat);
        console.log(`✅ Created category: ${cat.name}`);
      }
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Login to admin at http://localhost:3000/admin/login');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('2. Start adding products!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
