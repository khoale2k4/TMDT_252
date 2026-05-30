import prisma from './config/prisma';

async function main() {
  try {
    console.log("Starting to fix invoices foreign key constraint...");
    
    // 1. Dynamically find and drop ALL foreign key constraints on the invoices table
    await prisma.$executeRawUnsafe(`
      DO $$
      DECLARE
          r RECORD;
      BEGIN
          FOR r IN (
              SELECT constraint_name 
              FROM information_schema.table_constraints 
              WHERE table_name = 'invoices' AND constraint_type = 'FOREIGN KEY'
          ) LOOP
              EXECUTE 'ALTER TABLE invoices DROP CONSTRAINT ' || quote_ident(r.constraint_name);
          END LOOP;
      END $$;
    `);
    console.log("Successfully dropped all existing foreign key constraints on the invoices table.");

    // 2. Alter column booking_id type in invoices to VARCHAR(255) to match Booking.id (which is a string/text type in Prisma)
    await prisma.$executeRawUnsafe(`
      ALTER TABLE invoices 
      ALTER COLUMN booking_id TYPE VARCHAR(255);
    `);
    console.log("Successfully altered invoices.booking_id type to VARCHAR(255).");

    // 3. Add the correct foreign key constraint pointing to the Booking table (mapped from model Booking)
    await prisma.$executeRawUnsafe(`
      ALTER TABLE invoices 
      ADD CONSTRAINT invoices_booking_id_fkey 
      FOREIGN KEY (booking_id) 
      REFERENCES "Booking" (id) 
      ON DELETE CASCADE;
    `);
    console.log("Successfully added correct foreign key constraint pointing to Booking(id).");
    
    console.log("Constraint fix completed successfully!");
  } catch (error) {
    console.error("Error fixing foreign key constraint:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
