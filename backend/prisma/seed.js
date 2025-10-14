// backend/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create demo organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'demo-tennis-club' },
    update: {},
    create: {
      name: 'Demo Tennis Club',
      slug: 'demo-tennis-club',
      description: 'Club sportivo demo per testing',
      email: 'info@demotennisclub.com',
      phone: '+39 02 1234567',
      address: {
        street: 'Via dello Sport 123',
        city: 'Milano',
        postalCode: '20100',
        country: 'Italia'
      },
      businessHours: {
        monday: { open: '08:00', close: '22:00' },
        tuesday: { open: '08:00', close: '22:00' },
        wednesday: { open: '08:00', close: '22:00' },
        thursday: { open: '08:00', close: '22:00' },
        friday: { open: '08:00', close: '22:00' },
        saturday: { open: '09:00', close: '20:00' },
        sunday: { open: '09:00', close: '18:00' }
      },
      timezone: 'Europe/Rome',
      subscriptionPlan: 'premium',
      subscriptionStatus: 'ACTIVE'
    }
  });

  console.log(`✅ Organization created: ${organization.name}`);

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('Admin123!', 12);
  const adminUser = await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId: organization.id,
        email: 'admin@demotennisclub.com'
      }
    },
    update: {},
    create: {
      organizationId: organization.id,
      email: 'admin@demotennisclub.com',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'Demo',
      phone: '+39 333 1234567',
      role: 'ADMIN',
      isActive: true,
      emailVerifiedAt: new Date()
    }
  });

  console.log(`✅ Admin user created: ${adminUser.email}`);

  // Create manager user
  const managerPasswordHash = await bcrypt.hash('Manager123!', 12);
  const managerUser = await prisma.user.upsert({
    where: {
      organizationId_email: {
        organizationId: organization.id,
        email: 'manager@demotennisclub.com'
      }
    },
    update: {},
    create: {
      organizationId: organization.id,
      email: 'manager@demotennisclub.com',
      passwordHash: managerPasswordHash,
      firstName: 'Marco',
      lastName: 'Bianchi',
      phone: '+39 333 7654321',
      role: 'MANAGER',
      isActive: true,
      emailVerifiedAt: new Date()
    }
  });

  console.log(`✅ Manager user created: ${managerUser.email}`);

  // Create member users
  const memberPasswordHash = await bcrypt.hash('Member123!', 12);
  
  const members = [
    { firstName: 'Mario', lastName: 'Rossi', email: 'mario.rossi@example.com' },
    { firstName: 'Giulia', lastName: 'Verdi', email: 'giulia.verdi@example.com' },
    { firstName: 'Luca', lastName: 'Ferrari', email: 'luca.ferrari@example.com' },
    { firstName: 'Sara', lastName: 'Romano', email: 'sara.romano@example.com' }
  ];

  for (const member of members) {
    await prisma.user.upsert({
      where: {
        organizationId_email: {
          organizationId: organization.id,
          email: member.email
        }
      },
      update: {},
      create: {
        organizationId: organization.id,
        email: member.email,
        passwordHash: memberPasswordHash,
        firstName: member.firstName,
        lastName: member.lastName,
        phone: `+39 ${Math.floor(Math.random() * 900000000 + 100000000)}`,
        role: 'MEMBER',
        isActive: true,
        emailVerifiedAt: new Date()
      }
    });
  }

  console.log(`✅ ${members.length} member users created`);

  // Create tennis fields
  const tennisField1 = await prisma.field.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      organizationId: organization.id,
      name: 'Campo Tennis 1',
      description: 'Campo in terra rossa coperto con illuminazione',
      fieldType: 'TENNIS',
      hourlyRate: 25.00,
      peakHourRate: 35.00,
      memberDiscountPercent: 10,
      isActive: true,
      availableFrom: '08:00',
      availableUntil: '22:00',
      surfaceType: 'clay',
      indoor: true,
      lighting: true,
      minBookingDuration: 60,
      maxBookingDuration: 120,
      advanceBookingDays: 30,
      cancellationHours: 24,
      equipmentIncluded: ['net', 'balls'],
      amenities: ['locker_room', 'shower', 'parking']
    }
  });

  const tennisField2 = await prisma.field.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      organizationId: organization.id,
      name: 'Campo Tennis 2',
      description: 'Campo in terra rossa scoperto',
      fieldType: 'TENNIS',
      hourlyRate: 20.00,
      peakHourRate: 30.00,
      memberDiscountPercent: 10,
      isActive: true,
      availableFrom: '08:00',
      availableUntil: '20:00',
      surfaceType: 'clay',
      indoor: false,
      lighting: false,
      minBookingDuration: 60,
      maxBookingDuration: 120,
      advanceBookingDays: 30,
      cancellationHours: 24,
      equipmentIncluded: ['net'],
      amenities: ['parking']
    }
  });

  // Create padel fields
  const padelField1 = await prisma.field.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      organizationId: organization.id,
      name: 'Campo Padel 1',
      description: 'Campo padel coperto con illuminazione LED',
      fieldType: 'PADEL',
      hourlyRate: 30.00,
      peakHourRate: 40.00,
      memberDiscountPercent: 15,
      isActive: true,
      availableFrom: '08:00',
      availableUntil: '23:00',
      surfaceType: 'synthetic_turf',
      indoor: true,
      lighting: true,
      minBookingDuration: 60,
      maxBookingDuration: 120,
      advanceBookingDays: 30,
      cancellationHours: 12,
      equipmentIncluded: ['balls', 'rackets'],
      amenities: ['locker_room', 'shower', 'parking', 'bar']
    }
  });

  const padelField2 = await prisma.field.upsert({
    where: { id: '00000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000004',
      organizationId: organization.id,
      name: 'Campo Padel 2',
      description: 'Campo padel scoperto',
      fieldType: 'PADEL',
      hourlyRate: 25.00,
      peakHourRate: 35.00,
      memberDiscountPercent: 15,
      isActive: true,
      availableFrom: '08:00',
      availableUntil: '21:00',
      surfaceType: 'synthetic_turf',
      indoor: false,
      lighting: true,
      minBookingDuration: 60,
      maxBookingDuration: 120,
      advanceBookingDays: 30,
      cancellationHours: 12,
      equipmentIncluded: ['balls'],
      amenities: ['parking']
    }
  });

  console.log('✅ 4 fields created (2 tennis, 2 padel)');

  // Create sample bookings (future dates)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const memberUser = await prisma.user.findFirst({
    where: {
      organizationId: organization.id,
      role: 'MEMBER'
    }
  });

  if (memberUser) {
    const booking1 = await prisma.booking.create({
      data: {
        organizationId: organization.id,
        fieldId: tennisField1.id,
        userId: memberUser.id,
        startTime: tomorrow,
        endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000),
        status: 'CONFIRMED',
        basePrice: 25.00,
        discountAmount: 2.50,
        taxAmount: 4.95,
        totalAmount: 27.45,
        paymentStatus: 'COMPLETED',
        participants: [
          { name: 'Mario Rossi', email: memberUser.email }
        ]
      }
    });

    console.log(`✅ Sample booking created for tomorrow at ${tomorrow.toLocaleString()}`);
  }

  // Create sample membership
  const membership = await prisma.membership.create({
    data: {
      organizationId: organization.id,
      userId: memberUser.id,
      name: 'Abbonamento Mensile',
      description: 'Abbonamento mensile con 10% sconto',
      membershipType: 'monthly',
      price: 50.00,
      currency: 'EUR',
      startsAt: today,
      expiresAt: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
      autoRenew: false,
      bookingCredits: 0,
      discountPercent: 10,
      priorityBooking: false,
      status: 'ACTIVE'
    }
  });

  console.log('✅ Sample membership created');

  console.log('\n🎉 Database seeding completed successfully!\n');
  console.log('📝 Test Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 Admin:');
  console.log('   Email: admin@demotennisclub.com');
  console.log('   Password: Admin123!');
  console.log('');
  console.log('👤 Manager:');
  console.log('   Email: manager@demotennisclub.com');
  console.log('   Password: Manager123!');
  console.log('');
  console.log('👤 Member:');
  console.log('   Email: mario.rossi@example.com');
  console.log('   Password: Member123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });