const User = require('./models/User');
const Venue = require('./models/Venue');
const Queue = require('./models/Queue');

async function seedDatabase() {
  try {
    const venueCount = await Venue.countDocuments();
    if (venueCount > 0) {
      console.log('Database already has venues. Skipping seed.');
      return;
    }

    console.log('Seeding MongoDB database with default venues and queues...');

    // 1. Create a default admin user and customer user
    const admin = new User({ name: 'Admin Staff', email: 'admin@queueit.com', role: 'admin' });
    await admin.save();

    const customer = new User({ name: 'Jane Doe', email: 'jane@gmail.com', role: 'customer' });
    await customer.save();

    // 2. Venue 1: Central Bank
    const bank = new Venue({ 
      name: 'Central Bank Branch', 
      location: 'Financial District, Block 4' 
    });
    await bank.save();

    const q1 = new Queue({ 
      name: 'General Enquiries', 
      venueId: bank._id, 
      averageServiceTime: 8,
      queue: []
    });
    await q1.save();
    
    const q2 = new Queue({ 
      name: 'Teller Services', 
      venueId: bank._id, 
      averageServiceTime: 12,
      queue: []
    });
    await q2.save();

    bank.queues.push(q1._id, q2._id);
    await bank.save();

    // 3. Venue 2: Metro Medical Center
    const clinic = new Venue({ 
      name: 'Metro Medical Center', 
      location: 'Building B, Ground Floor' 
    });
    await clinic.save();

    const q3 = new Queue({ 
      name: 'General Checkup Line', 
      venueId: clinic._id, 
      averageServiceTime: 15,
      queue: []
    });
    await q3.save();

    const q4 = new Queue({ 
      name: 'Pediatrics consultations', 
      venueId: clinic._id, 
      averageServiceTime: 20,
      queue: []
    });
    await q4.save();

    clinic.queues.push(q3._id, q4._id);
    await clinic.save();

    // 4. Venue 3: City Council
    const council = new Venue({ 
      name: 'City Council Office', 
      location: 'City Hall, Room 102' 
    });
    await council.save();

    const q5 = new Queue({ 
      name: 'License Renewal', 
      venueId: council._id, 
      averageServiceTime: 10,
      queue: []
    });
    await q5.save();

    const q6 = new Queue({ 
      name: 'Planning Permits', 
      venueId: council._id, 
      averageServiceTime: 25,
      isActive: false,
      queue: []
    });
    await q6.save();

    council.queues.push(q5._id, q6._id);
    await council.save();

    console.log('Database seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err.message);
  }
}

module.exports = seedDatabase;
