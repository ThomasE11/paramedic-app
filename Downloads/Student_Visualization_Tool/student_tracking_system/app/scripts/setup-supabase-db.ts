import { readFileSync } from 'fs';
import { PrismaClient } from '@prisma/client';

const SUPABASE_URL = 'postgresql://postgres:StudentTrack2025%21Secure%23DB@db.yruncbkxlpjsgraojqsk.supabase.co:5432/postgres';

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...\n');
  
  // Create Prisma client with Supabase URL
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: SUPABASE_URL
      }
    }
  });

  try {
    // Test connection
    console.log('📡 Testing connection to Supabase...');
    await prisma.$connect();
    console.log('✅ Connected to Supabase successfully!\n');

    // Read schema SQL
    console.log('📄 Reading schema file...');
    const schemaSQL = readFileSync('/tmp/schema.sql', 'utf-8');
    
    // Split into individual statements
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SET') && !s.startsWith('SELECT pg_catalog'));

    console.log(`📝 Found ${statements.length} SQL statements\n`);

    // Execute each statement
    let successCount = 0;
    let skipCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip certain statements
      if (statement.includes('OWNER TO') || 
          statement.includes('_prisma_migrations') ||
          statement.startsWith('ALTER TABLE') && statement.includes('OWNER')) {
        skipCount++;
        continue;
      }

      try {
        await prisma.$executeRawUnsafe(statement + ';');
        successCount++;
        process.stdout.write(`\r✅ Executed ${successCount}/${statements.length - skipCount} statements`);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          skipCount++;
        } else {
          console.error(`\n❌ Error executing statement ${i + 1}:`, error.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
        }
      }
    }

    console.log(`\n\n✅ Schema setup complete!`);
    console.log(`   - Executed: ${successCount} statements`);
    console.log(`   - Skipped: ${skipCount} statements\n`);

    // Now import data
    console.log('📊 Importing data...');
    const dataSQL = readFileSync('/tmp/data.sql', 'utf-8');
    
    // Split data into statements
    const dataStatements = dataSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SET') && !s.startsWith('SELECT pg_catalog'));

    console.log(`📝 Found ${dataStatements.length} data statements\n`);

    let dataSuccessCount = 0;
    let dataSkipCount = 0;

    for (let i = 0; i < dataStatements.length; i++) {
      const statement = dataStatements[i];
      
      try {
        await prisma.$executeRawUnsafe(statement + ';');
        dataSuccessCount++;
        process.stdout.write(`\r✅ Imported ${dataSuccessCount}/${dataStatements.length} data statements`);
      } catch (error: any) {
        if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
          dataSkipCount++;
        } else {
          console.error(`\n❌ Error importing data ${i + 1}:`, error.message);
        }
      }
    }

    console.log(`\n\n✅ Data import complete!`);
    console.log(`   - Imported: ${dataSuccessCount} statements`);
    console.log(`   - Skipped: ${dataSkipCount} statements\n`);

    // Verify student count
    console.log('🔍 Verifying data...');
    const studentCount = await prisma.student.count();
    const userCount = await prisma.user.count();
    const moduleCount = await prisma.module.count();

    console.log(`✅ Database verification:`);
    console.log(`   - Students: ${studentCount}`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Modules: ${moduleCount}\n`);

    if (studentCount === 61) {
      console.log('🎉 SUCCESS! All 61 students migrated successfully!\n');
    } else {
      console.log(`⚠️  Warning: Expected 61 students, found ${studentCount}\n`);
    }

  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase()
  .then(() => {
    console.log('✅ Database setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  });

