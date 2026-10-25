const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const { Item } = require('../models/Item');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_lost_found';

const seedDatabase = async () => {
  try {
    console.log('\n==========================================');
    console.log('🌱 Starting Campus Lost & Found Seed Script');
    console.log('==========================================');
    console.log(`Connecting to MongoDB at: ${MONGO_URI}`);

    await mongoose.connect(MONGO_URI);
    console.log('✓ MongoDB connection established.');

    // 1. Clear existing data
    console.log('Clearing existing users and items collections...');
    await User.deleteMany({});
    await Item.deleteMany({});
    console.log('✓ Collections wiped clean.');

    // 2. Hash shared password: Demo@123
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('Demo@123', salt);

    // 3. Create 3 Demo Students
    console.log('Creating demo student user accounts...');
    const users = await User.create([
      {
        name: 'Rahul Sharma',
        email: 'rahul@campus.edu',
        passwordHash: demoPasswordHash,
        phone: '+91 98765 43210'
      },
      {
        name: 'Priya Patel',
        email: 'priya@campus.edu',
        passwordHash: demoPasswordHash,
        phone: '+91 98765 43211'
      },
      {
        name: 'Amit Verma',
        email: 'amit@campus.edu',
        passwordHash: demoPasswordHash,
        phone: '+91 98765 43212'
      }
    ]);

    const [rahul, priya, amit] = users;
    console.log(`✓ Created 3 users:`);
    users.forEach(u => console.log(`   - ${u.name} (${u.email}) [Password: Demo@123]`));

    // Helper to calculate date N days ago
    const daysAgo = (days) => {
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d;
    };

    // 4. Create 14 realistic items with 5 intentional matching pairs
    console.log('\nPopulating campus items (including 5 high-scoring match pairs)...');
    const items = await Item.create([
      // -------------------------------------------------------------
      // MATCH PAIR 1: Laptop Bag (Category: Bags, Black, Library)
      // -------------------------------------------------------------
      {
        type: 'lost',
        title: 'Black HP 15-inch Laptop Bag',
        description: 'Padded black HP laptop bag with red zipper accent left under desk 14 on 2nd floor reading hall. Contains notebook and charger.',
        category: 'Bags',
        color: 'Black',
        locationName: 'Library 2nd floor reading hall',
        campusZone: 'Library',
        dateOccurred: daysAgo(4),
        status: 'open',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
        postedBy: rahul._id
      },
      {
        type: 'found',
        title: 'Black HP laptop backpack near library desks',
        description: 'Found a black laptop bag with HP logo and red zipper tag near quiet study desks on floor 2 of the central library.',
        category: 'Bags',
        color: 'Black',
        locationName: 'Library 2nd floor quiet desks',
        campusZone: 'Library',
        dateOccurred: daysAgo(3),
        status: 'open',
        imageUrl: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80',
        postedBy: priya._id
      },

      // -------------------------------------------------------------
      // MATCH PAIR 2: boAt Bluetooth Headphones (Category: Electronics, Blue, Canteen)
      // -------------------------------------------------------------
      {
        type: 'lost',
        title: 'Blue boAt Rockerz Bluetooth Headphones',
        description: 'Lost my matte blue over-ear boAt headphones at canteen table near juice counter during lunch break.',
        category: 'Electronics',
        color: 'Blue',
        locationName: 'Canteen juice counter area',
        campusZone: 'Canteen',
        dateOccurred: daysAgo(6),
        status: 'open',
        imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
        postedBy: amit._id
      },
      {
        type: 'found',
        title: 'Blue boAt wireless headphones in canteen',
        description: 'Found a pair of blue over-ear boAt Bluetooth headphones sitting on a chair in the central canteen area.',
        category: 'Electronics',
        color: 'Blue',
        locationName: 'Central Canteen tables',
        campusZone: 'Canteen',
        dateOccurred: daysAgo(5),
        status: 'open',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        postedBy: rahul._id
      },

      // -------------------------------------------------------------
      // MATCH PAIR 3: College ID Card (Category: ID & Cards, Academic Block)
      // -------------------------------------------------------------
      {
        type: 'lost',
        title: 'Student ID Card - Priya Patel (CS Dept)',
        description: 'Lost my student ID card with blue campus lanyard somewhere between Room 302 and the 3rd floor staircase.',
        category: 'ID & Cards',
        color: 'Blue',
        locationName: 'Academic Block 3rd floor corridor',
        campusZone: 'Academic Block',
        dateOccurred: daysAgo(2),
        status: 'open',
        imageUrl: 'https://images.unsplash.com/photo-1589330694653-dad6d3240a2b?auto=format&fit=crop&w=800&q=80',
        postedBy: priya._id
      },
      {
        type: 'found',
        title: 'College ID card found near Room 302',
        description: 'Found student ID card belonging to Computer Science student near the 3rd floor staircase in Academic Block A.',
        category: 'ID & Cards',
        color: 'Blue',
        locationName: 'Academic Block 3rd floor staircase',
        campusZone: 'Academic Block',
        dateOccurred: daysAgo(2),
        status: 'open',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        postedBy: amit._id
      },

      // -------------------------------------------------------------
      // MATCH PAIR 4: Scientific Calculator (Category: Books & Stationery, Black, Academic Block)
      // -------------------------------------------------------------
      {
        type: 'lost',
        title: 'Casio fx-991EX Scientific Calculator',
        description: 'Left my black Casio scientific calculator with sticker on back cover in Physics Lab 2 after practical exam.',
        category: 'Books & Stationery',
        color: 'Black',
        locationName: 'Academic Block Physics Lab 2',
        campusZone: 'Academic Block',
        dateOccurred: daysAgo(7),
        status: 'open',
        imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80',
        postedBy: rahul._id
      },
      {
        type: 'found',
        title: 'Casio scientific calculator left in Lab',
        description: 'Found black Casio scientific calculator on workbench #4 in Physics Lab during evening cleanup.',
        category: 'Books & Stationery',
        color: 'Black',
        locationName: 'Academic Block Physics Lab',
        campusZone: 'Academic Block',
        dateOccurred: daysAgo(6),
        status: 'open',
        imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
        postedBy: priya._id
      },

      // -------------------------------------------------------------
      // MATCH PAIR 5: Bike Key with Carabiner (Category: Keys, Silver, Parking)
      // -------------------------------------------------------------
      {
        type: 'lost',
        title: 'Honda bike key with metal carabiner',
        description: 'Set of two keys with black Honda rubber fob and silver carabiner lost in student two-wheeler parking lot.',
        category: 'Keys',
        color: 'Silver',
        locationName: 'Student Two-Wheeler Parking Lot B',
        campusZone: 'Parking',
        dateOccurred: daysAgo(1),
        status: 'open',
        imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80',
        postedBy: amit._id
      },
      {
        type: 'found',
        title: 'Honda two-wheeler bike key with keychain',
        description: 'Picked up a Honda motorcycle key with carabiner clip lying on pavement near two-wheeler parking gate.',
        category: 'Keys',
        color: 'Silver',
        locationName: 'Parking Lot B entrance gate',
        campusZone: 'Parking',
        dateOccurred: daysAgo(1),
        status: 'open',
        imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
        postedBy: rahul._id
      },

      // -------------------------------------------------------------
      // ADDITIONAL STANDALONE ITEMS & RESOLVED SAMPLES
      // -------------------------------------------------------------
      {
        type: 'lost',
        title: 'Hydro Flask Water Bottle 750ml',
        description: 'Dark green insulated metal water bottle with small scratch on base left on bleachers during basketball practice.',
        category: 'Accessories',
        color: 'Green',
        locationName: 'Indoor Basketball Court bleachers',
        campusZone: 'Sports Ground',
        dateOccurred: daysAgo(5),
        status: 'open',
        imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
        postedBy: priya._id
      },
      {
        type: 'found',
        title: 'Grey Stainless Steel Water Bottle',
        description: 'Found grey thermal water flask on bench outside cafe in hostel courtyard.',
        category: 'Accessories',
        color: 'Grey',
        locationName: 'Hostel 3 courtyard bench',
        campusZone: 'Hostel',
        dateOccurred: daysAgo(4),
        status: 'open',
        imageUrl: 'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=800&q=80',
        postedBy: amit._id
      },
      {
        type: 'lost',
        title: 'Blue Denim Jacket with Sherpa Collar',
        description: 'Blue denim jacket left on chair in auditorium row F during cultural fest rehearsal.',
        category: 'Clothing',
        color: 'Blue',
        locationName: 'Main Auditorium Row F',
        campusZone: 'Auditorium',
        dateOccurred: daysAgo(10),
        status: 'resolved',
        imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
        postedBy: rahul._id
      },
      {
        type: 'found',
        title: 'Engineering Mathematics Textbook (Vol 2)',
        description: 'BS Grewal Higher Engineering Mathematics book found on table near newspaper stand.',
        category: 'Books & Stationery',
        color: 'Yellow',
        locationName: 'Library ground floor newspaper lounge',
        campusZone: 'Library',
        dateOccurred: daysAgo(9),
        status: 'resolved',
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
        postedBy: priya._id
      }
    ]);

    console.log(`✓ Inserted ${items.length} realistic campus items.`);
    console.log('\n==========================================');
    console.log('✨ Seed Completed Successfully!');
    console.log('Demo Credentials for Viva / Testing:');
    console.log('   Email: rahul@campus.edu | Password: Demo@123');
    console.log('   Email: priya@campus.edu | Password: Demo@123');
    console.log('   Email: amit@campus.edu  | Password: Demo@123');
    console.log('==========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Script Error:', error);
    process.exit(1);
  }
};

seedDatabase();
