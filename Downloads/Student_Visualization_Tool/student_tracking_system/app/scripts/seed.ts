
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedLocations() {
  console.log('Seeding locations...');

  // Create basic locations for HCT Al Ain
  const locations = [
    {
      name: 'Classroom A-101',
      capacity: 30,
      type: 'classroom',
      building: 'Academic Building A',
      floor: '1st Floor',
      equipment: 'Projector, Whiteboard, Air Conditioning'
    },
    {
      name: 'Classroom A-102',
      capacity: 35,
      type: 'classroom',
      building: 'Academic Building A',
      floor: '1st Floor',
      equipment: 'Smart Board, Projector, Air Conditioning'
    },
    {
      name: 'Lab B-201',
      capacity: 20,
      type: 'lab',
      building: 'Academic Building B',
      floor: '2nd Floor',
      equipment: 'Medical Equipment, Computers, Simulation Mannequins'
    },
    {
      name: 'Practical Lab B-202',
      capacity: 25,
      type: 'lab',
      building: 'Academic Building B',
      floor: '2nd Floor',
      equipment: 'Clinical Simulation Equipment, Hospital Beds'
    },
    {
      name: 'Lecture Hall C-001',
      capacity: 100,
      type: 'classroom',
      building: 'Main Building C',
      floor: 'Ground Floor',
      equipment: 'Audio System, Large Projector, Tiered Seating'
    },
    {
      name: 'Skills Lab D-101',
      capacity: 15,
      type: 'lab',
      building: 'Skills Building D',
      floor: '1st Floor',
      equipment: 'Patient Simulators, Medical Devices, Emergency Equipment'
    }
  ];

  for (const location of locations) {
    // Check if location already exists
    const existingLocation = await prisma.location.findFirst({
      where: { name: location.name }
    });
    
    if (!existingLocation) {
      await prisma.location.create({
        data: location
      });
    }
  }

  console.log('✓ Locations seeded successfully');
}

async function main() {
  await seedLocations();
  // Create modules
  const modules = await Promise.all([
    prisma.module.upsert({
      where: { code: 'HEM3903' },
      update: {},
      create: {
        code: 'HEM3903',
        name: 'Ambulance Practicum III',
        description: 'Advanced ambulance practicum for third-year students'
      }
    }),
    prisma.module.upsert({
      where: { code: 'HEM2903' },
      update: {},
      create: {
        code: 'HEM2903',
        name: 'Ambulance 1 Practical Group',
        description: 'First-level ambulance practical training'
      }
    }),
    prisma.module.upsert({
      where: { code: 'HEM3923' },
      update: {},
      create: {
        code: 'HEM3923',
        name: 'Responder Practicum I',
        description: 'First responder practical training'
      }
    }),
    prisma.module.upsert({
      where: { code: 'AEM230' },
      update: {},
      create: {
        code: 'AEM230',
        name: 'Apply Clinical Practicum 1 Ambulance (Diploma)',
        description: 'Applied clinical practicum for diploma students'
      }
    })
  ]);

  // Create test instructor user
  const hashedPassword = await bcrypt.hash('johndoe123', 12);
  const instructor = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      name: 'John Doe',
      role: 'instructor'
    }
  });

  // Students for HEM3903 - Ambulance Practicum III (from CSV)
  const hem3903Students = [
    {
      studentId: 'H00459031',
      firstName: 'Saeed',
      lastName: 'Amer Salem Ahmed Alseiari',
      fullName: 'Saeed Amer Salem Ahmed Alseiari',
      email: 'h00459031@hct.ac.ae',
      phone: '+971501234567'
    },
    {
      studentId: 'H00467388',
      firstName: 'Nahian',
      lastName: 'Abdullah Ali Rashed Al Saadi',
      fullName: 'Nahian Abdullah Ali Rashed Al Saadi',
      email: 'h00467388@hct.ac.ae',
      phone: '+971501234568'
    },
    {
      studentId: 'H00491089',
      firstName: 'Bakhita',
      lastName: 'Saeed Rashed Hedairem Alketbi',
      fullName: 'Bakhita Saeed Rashed Hedairem Alketbi',
      email: 'h00491089@hct.ac.ae',
      phone: '+971501234569'
    },
    {
      studentId: 'H00491239',
      firstName: 'Sherina',
      lastName: 'Obaid Ali Rashed Aljahoori',
      fullName: 'Sherina Obaid Ali Rashed Aljahoori',
      email: 'h00491239@hct.ac.ae',
      phone: '+971501234570'
    },
    {
      studentId: 'H00491292',
      firstName: 'Alanood',
      lastName: 'Saif Jawaan Obaid Almansoori',
      fullName: 'Alanood Saif Jawaan Obaid Almansoori',
      email: 'h00491292@hct.ac.ae',
      phone: '+971501234571'
    },
    {
      studentId: 'H00491322',
      firstName: 'Mahra',
      lastName: 'Abdulla Saeed Bakhit Alshebli',
      fullName: 'Mahra Abdulla Saeed Bakhit Alshebli',
      email: 'h00491322@hct.ac.ae',
      phone: '+971501234572'
    },
    {
      studentId: 'H00491415',
      firstName: 'Shamsa',
      lastName: 'Salem Musabbeh Ahmed Alkaabi',
      fullName: 'Shamsa Salem Musabbeh Ahmed Alkaabi',
      email: 'h00491415@hct.ac.ae',
      phone: '+971501234573'
    },
    {
      studentId: 'H00513261',
      firstName: 'Yunis',
      lastName: 'Maaruf',
      fullName: 'Yunis Maaruf',
      email: 'h00513261@hct.ac.ae',
      phone: '+971501234574'
    }
  ];

  // Students for HEM2903 - Ambulance Practicum I (from CSV)
  const hem2903Students = [
    {
      studentId: 'H00541559',
      firstName: 'Afra',
      lastName: 'Subaih Humaid Salem Al Manei',
      fullName: 'Afra Subaih Humaid Salem Al Manei',
      email: 'h00541559@hct.ac.ae',
      phone: '+971501234580'
    },
    {
      studentId: 'H00467407',
      firstName: 'Nahyan',
      lastName: 'Ibrahim Abdulla Ibrahim Alblooshi',
      fullName: 'Nahyan Ibrahim Abdulla Ibrahim Alblooshi',
      email: 'h00467407@hct.ac.ae',
      phone: '+971501234581'
    },
    {
      studentId: 'H00467469',
      firstName: 'Qmasha',
      lastName: 'Imad Wadee Mohammed Aldhaheri',
      fullName: 'Qmasha Imad Wadee Mohammed Aldhaheri',
      email: 'h00467469@hct.ac.ae',
      phone: '+971501234582'
    },
    {
      studentId: 'H00467475',
      firstName: 'Aldana',
      lastName: 'Mohammed Manea Nasser Al Ahbabi',
      fullName: 'Aldana Mohammed Manea Nasser Al Ahbabi',
      email: 'h00467475@hct.ac.ae',
      phone: '+971501234583'
    },
    {
      studentId: 'H00491386',
      firstName: 'Sana',
      lastName: 'Mohammed Nasser Gharib Al Ahbabi',
      fullName: 'Sana Mohammed Nasser Gharib Al Ahbabi',
      email: 'h00491386@hct.ac.ae',
      phone: '+971501234584'
    },
    {
      studentId: 'H00491399',
      firstName: 'Shamayel',
      lastName: 'Ahmed Nashr Alsaadi',
      fullName: 'Shamayel Ahmed Nashr Alsaadi',
      email: 'h00491399@hct.ac.ae',
      phone: '+971501234585'
    },
    {
      studentId: 'H00498340',
      firstName: 'Zayed',
      lastName: 'Mubarak Khamis Kharboush Almansoori',
      fullName: 'Zayed Mubarak Khamis Kharboush Almansoori',
      email: 'h00498340@hct.ac.ae',
      phone: '+971501234586'
    },
    {
      studentId: 'H00510900',
      firstName: 'Athba',
      lastName: 'Saeed Ali Abed Alaryani',
      fullName: 'Athba Saeed Ali Abed Alaryani',
      email: 'h00510900@hct.ac.ae',
      phone: '+971501234587'
    },
    {
      studentId: 'H00541555',
      firstName: 'Mahra',
      lastName: 'Khalifa Mohammed Khalifa Alghafli',
      fullName: 'Mahra Khalifa Mohammed Khalifa Alghafli',
      email: 'h00541555@hct.ac.ae',
      phone: '+971501234588'
    },
    {
      studentId: 'H00542172',
      firstName: 'Talal',
      lastName: 'Mohammed Yousef Abdulla Alblooshi',
      fullName: 'Talal Mohammed Yousef Abdulla Alblooshi',
      email: 'h00542172@hct.ac.ae',
      phone: '+971501234589'
    },
    {
      studentId: 'H00542178',
      firstName: 'Ahmed',
      lastName: 'Tareq Mohmed Ali Alhosani',
      fullName: 'Ahmed Tareq Mohmed Ali Alhosani',
      email: 'h00542178@hct.ac.ae',
      phone: '+971501234590'
    },
    {
      studentId: 'H00542183',
      firstName: 'Shama',
      lastName: 'Juma Saeed Juma Alkaabi',
      fullName: 'Shama Juma Saeed Juma Alkaabi',
      email: 'h00542183@hct.ac.ae',
      phone: '+971501234591'
    },
    {
      studentId: 'H00542198',
      firstName: 'Fatima',
      lastName: 'Abdulla Salem Abdulla Alkaabi',
      fullName: 'Fatima Abdulla Salem Abdulla Alkaabi',
      email: 'h00542198@hct.ac.ae',
      phone: '+971501234592'
    },
    {
      studentId: 'H00542199',
      firstName: 'Shahd',
      lastName: 'Khaled Ali Mohammed Alblooshi',
      fullName: 'Shahd Khaled Ali Mohammed Alblooshi',
      email: 'h00542199@hct.ac.ae',
      phone: '+971501234593'
    },
    {
      studentId: 'H00542939',
      firstName: 'Mohammed',
      lastName: 'Bader Nasser Abdulla Alblooshi',
      fullName: 'Mohammed Bader Nasser Abdulla Alblooshi',
      email: 'h00542939@hct.ac.ae',
      phone: '+971501234594'
    }
  ];

  // Students for HEM3923 - Responder Practicum I (from CSV)
  const hem3923Students = [
    {
      studentId: 'H00441453',
      firstName: 'Abdulhamid',
      lastName: 'Bashar Abdulla Hasan Alhaddad',
      fullName: 'Abdulhamid Bashar Abdulla Hasan Alhaddad',
      email: 'h00441453@hct.ac.ae',
      phone: '+971501234595'
    },
    {
      studentId: 'H00459151',
      firstName: 'Aysha',
      lastName: 'Helal Humaid Anad Alkaabi',
      fullName: 'Aysha Helal Humaid Anad Alkaabi',
      email: 'h00459151@hct.ac.ae',
      phone: '+971501234596'
    },
    {
      studentId: 'H00461314',
      firstName: 'Fatima',
      lastName: 'Ali Saif Ablan Almazrouei',
      fullName: 'Fatima Ali Saif Ablan Almazrouei',
      email: 'h00461314@hct.ac.ae',
      phone: '+971501234597'
    },
    {
      studentId: 'H00461337',
      firstName: 'Alreem',
      lastName: 'Ahmed Saif Mohammed Alameri',
      fullName: 'Alreem Ahmed Saif Mohammed Alameri',
      email: 'h00461337@hct.ac.ae',
      phone: '+971501234598'
    },
    {
      studentId: 'H00490995',
      firstName: 'Mohammed',
      lastName: 'Nasser Khamis Salem Aleissaee',
      fullName: 'Mohammed Nasser Khamis Salem Aleissaee',
      email: 'h00490995@hct.ac.ae',
      phone: '+971501234599'
    },
    {
      studentId: 'H00495808',
      firstName: 'Elyazia',
      lastName: 'Jumaa Ahmad Haji',
      fullName: 'Elyazia Jumaa Ahmad Haji',
      email: 'h00495808@hct.ac.ae',
      phone: '+971501234600'
    }
  ];

  // Students for AEM230 - Apply Clinical Practicum 1 AMB (from CSV)
  const aem230Students = [
    {
      studentId: 'H00600088',
      firstName: 'Abdulla',
      lastName: 'Mohammed Abdulrahman Saeed Almeqbaali',
      fullName: 'Abdulla Mohammed Abdulrahman Saeed Almeqbaali',
      email: 'h00600088@hct.ac.ae',
      phone: '+971501234605'
    },
    {
      studentId: 'H00601780',
      firstName: 'Afra',
      lastName: 'Saeed Khassib Rashed Alsheryani',
      fullName: 'Afra Saeed Khassib Rashed Alsheryani',
      email: 'h00601780@hct.ac.ae',
      phone: '+971501234606'
    },
    {
      studentId: 'H00601770',
      firstName: 'Shouq',
      lastName: 'Hamad Obaid Hamad Alshamsi',
      fullName: 'Shouq Hamad Obaid Hamad Alshamsi',
      email: 'h00601770@hct.ac.ae',
      phone: '+971501234607'
    },
    {
      studentId: 'H00530541',
      firstName: 'Ahmed',
      lastName: 'Mohammed Khamis Saeed Alyahyaee',
      fullName: 'Ahmed Mohammed Khamis Saeed Alyahyaee',
      email: 'h00530541@hct.ac.ae',
      phone: '+971501234608'
    },
    {
      studentId: 'H00594076',
      firstName: 'Alanoud',
      lastName: 'Salem Saeed Shenain Alnuaimi',
      fullName: 'Alanoud Salem Saeed Shenain Alnuaimi',
      email: 'h00594076@hct.ac.ae',
      phone: '+971501234609'
    },
    {
      studentId: 'H00566881',
      firstName: 'Ali',
      lastName: 'Abdulla Ali Sulaiman Alameri',
      fullName: 'Ali Abdulla Ali Sulaiman Alameri',
      email: 'h00566881@hct.ac.ae',
      phone: '+971501234610'
    },
    {
      studentId: 'H00599984',
      firstName: 'Dheyab',
      lastName: 'Abdallah Ali Saif Almazruii',
      fullName: 'Dheyab Abdallah Ali Saif Almazruii',
      email: 'h00599984@hct.ac.ae',
      phone: '+971501234611'
    },
    {
      studentId: 'H00594033',
      firstName: 'Ghalya',
      lastName: 'Nasser Abdulrahman Nasser Al Ahbabi',
      fullName: 'Ghalya Nasser Abdulrahman Nasser Al Ahbabi',
      email: 'h00594033@hct.ac.ae',
      phone: '+971501234612'
    },
    {
      studentId: 'H00594105',
      firstName: 'Hamad',
      lastName: 'Salim Hamad Mattar Alnaaimi',
      fullName: 'Hamad Salim Hamad Mattar Alnaaimi',
      email: 'h00594105@hct.ac.ae',
      phone: '+971501234613'
    },
    {
      studentId: 'H00604014',
      firstName: 'Latifa',
      lastName: 'Yousef Sultan Abdulla Alshamsi',
      fullName: 'Latifa Yousef Sultan Abdulla Alshamsi',
      email: 'h00604014@hct.ac.ae',
      phone: '+971501234614'
    },
    {
      studentId: 'H00601777',
      firstName: 'Mahra',
      lastName: 'Mohammed Abdulla Khamis Alshamsi',
      fullName: 'Mahra Mohammed Abdulla Khamis Alshamsi',
      email: 'h00601777@hct.ac.ae',
      phone: '+971501234615'
    },
    {
      studentId: 'H00593951',
      firstName: 'Mahra',
      lastName: 'Saif Mohammed Yehal Aldhaheri',
      fullName: 'Mahra Saif Mohammed Yehal Aldhaheri',
      email: 'h00593951@hct.ac.ae',
      phone: '+971501234616'
    },
    {
      studentId: 'H00601791',
      firstName: 'Maitha',
      lastName: 'Ali Mubarak Mohammed Alshamsi',
      fullName: 'Maitha Ali Mubarak Mohammed Alshamsi',
      email: 'h00601791@hct.ac.ae',
      phone: '+971501234617'
    },
    {
      studentId: 'H00601746',
      firstName: 'Mariam',
      lastName: 'Mohammed Ateeq Altheeb Alshamsi',
      fullName: 'Mariam Mohammed Ateeq Altheeb Alshamsi',
      email: 'h00601746@hct.ac.ae',
      phone: '+971501234618'
    },
    {
      studentId: 'H00594069',
      firstName: 'Mariam',
      lastName: 'Mohammed Khalfan Saeed Alshamsi',
      fullName: 'Mariam Mohammed Khalfan Saeed Alshamsi',
      email: 'h00594069@hct.ac.ae',
      phone: '+971501234619'
    },
    {
      studentId: 'H00601795',
      firstName: 'Mariam',
      lastName: 'Obaid Hareb Obaid Alkaabi',
      fullName: 'Mariam Obaid Hareb Obaid Alkaabi',
      email: 'h00601795@hct.ac.ae',
      phone: '+971501234620'
    },
    {
      studentId: 'H00601771',
      firstName: 'Meera',
      lastName: 'Mohammed Rashed Khalifa Alkaabi',
      fullName: 'Meera Mohammed Rashed Khalifa Alkaabi',
      email: 'h00601771@hct.ac.ae',
      phone: '+971501234621'
    },
    {
      studentId: 'H00546028',
      firstName: 'Mohammed',
      lastName: 'Abdulla Mohammed Binreed Alsubousi',
      fullName: 'Mohammed Abdulla Mohammed Binreed Alsubousi',
      email: 'h00546028@hct.ac.ae',
      phone: '+971501234622'
    },
    {
      studentId: 'H00609157',
      firstName: 'Mohammed',
      lastName: 'Khalifa Abdulla Hareb Aldhaheri',
      fullName: 'Mohammed Khalifa Abdulla Hareb Aldhaheri',
      email: 'h00609157@hct.ac.ae',
      phone: '+971501234623'
    },
    {
      studentId: 'H00602802',
      firstName: 'Mohammed',
      lastName: 'Salim Abdallah Humaid Alomairi',
      fullName: 'Mohammed Salim Abdallah Humaid Alomairi',
      email: 'h00602802@hct.ac.ae',
      phone: '+971501234624'
    },
    {
      studentId: 'H00571107',
      firstName: 'Naji',
      lastName: 'Mohammed Bujair Salem Alameri',
      fullName: 'Naji Mohammed Bujair Salem Alameri',
      email: 'h00571107@hct.ac.ae',
      phone: '+971501234625'
    },
    {
      studentId: 'H00600056',
      firstName: 'Ranad',
      lastName: 'Sultan Khamis Khalfan Alyahyaee',
      fullName: 'Ranad Sultan Khamis Khalfan Alyahyaee',
      email: 'h00600056@hct.ac.ae',
      phone: '+971501234626'
    },
    {
      studentId: 'H00594034',
      firstName: 'Rouda',
      lastName: 'Ali Khamis Ali Alkaabi',
      fullName: 'Rouda Ali Khamis Ali Alkaabi',
      email: 'h00594034@hct.ac.ae',
      phone: '+971501234627'
    },
    {
      studentId: 'H00542166',
      firstName: 'Saeed',
      lastName: 'Mohammed Ali Rashed Almeqbaali',
      fullName: 'Saeed Mohammed Ali Rashed Almeqbaali',
      email: 'h00542166@hct.ac.ae',
      phone: '+971501234628'
    },
    {
      studentId: 'H00594180',
      firstName: 'Shamma',
      lastName: 'Ahmed Eid Obaid Alketbi',
      fullName: 'Shamma Ahmed Eid Obaid Alketbi',
      email: 'h00594180@hct.ac.ae',
      phone: '+971501234629'
    },
    {
      studentId: 'H00605422',
      firstName: 'Shamsa',
      lastName: 'Fahed Yousef Abdulla Alsawwafi',
      fullName: 'Shamsa Fahed Yousef Abdulla Alsawwafi',
      email: 'h00605422@hct.ac.ae',
      phone: '+971501234630'
    },
    {
      studentId: 'H00600102',
      firstName: 'Sultan',
      lastName: 'Khulaif Ali Mohammed Alhajeri',
      fullName: 'Sultan Khulaif Ali Mohammed Alhajeri',
      email: 'h00600102@hct.ac.ae',
      phone: '+971501234631'
    },
    {
      studentId: 'H00530550',
      firstName: 'Sultan',
      lastName: 'Salem Ali Ali Aljneibi',
      fullName: 'Sultan Salem Ali Ali Aljneibi',
      email: 'h00530550@hct.ac.ae',
      phone: '+971501234632'
    },
    {
      studentId: 'H00502212',
      firstName: 'Theyab',
      lastName: 'Obaid Ahmed Obaid Albadi',
      fullName: 'Theyab Obaid Ahmed Obaid Albadi',
      email: 'h00502212@hct.ac.ae',
      phone: '+971501234633'
    },
    {
      studentId: 'H00594158',
      firstName: 'Turfa',
      lastName: 'Mohammed Saif Alabed Alnuaimi',
      fullName: 'Turfa Mohammed Saif Alabed Alnuaimi',
      email: 'h00594158@hct.ac.ae',
      phone: '+971501234634'
    }
  ];

  // Create students for each module
  for (const studentData of hem3903Students) {
    await prisma.student.upsert({
      where: { email: studentData.email },
      update: {},
      create: {
        ...studentData,
        moduleId: modules[0].id
      }
    });
  }

  for (const studentData of hem2903Students) {
    await prisma.student.upsert({
      where: { email: studentData.email },
      update: {},
      create: {
        ...studentData,
        moduleId: modules[1].id
      }
    });
  }

  for (const studentData of hem3923Students) {
    await prisma.student.upsert({
      where: { email: studentData.email },
      update: {},
      create: {
        ...studentData,
        moduleId: modules[2].id
      }
    });
  }

  for (const studentData of aem230Students) {
    await prisma.student.upsert({
      where: { email: studentData.email },
      update: {},
      create: {
        ...studentData,
        moduleId: modules[3].id
      }
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`✅ Created ${modules.length} modules`);
  console.log(`✅ Created instructor user: john@doe.com`);
  console.log(`✅ Created ${hem3903Students.length + hem2903Students.length + hem3923Students.length + aem230Students.length} students`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
