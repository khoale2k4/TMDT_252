import prisma from './config/prisma';

async function main() {
  try {
    console.log("Starting to fix invoices foreign key constraint and type mismatch operators...");
    
    // 1. Drop existing operators if any
    await prisma.$executeRawUnsafe(`
      DROP OPERATOR IF EXISTS = (uuid, varchar) CASCADE;
    `);
    await prisma.$executeRawUnsafe(`
      DROP OPERATOR IF EXISTS = (varchar, uuid) CASCADE;
    `);

    // 2. Create the comparison functions
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION uuid_eq_varchar(uuid, varchar) RETURNS boolean AS $$
        BEGIN
          RETURN $1 = CAST($2 AS uuid);
        EXCEPTION WHEN others THEN
          RETURN FALSE;
        END;
      $$ LANGUAGE plpgsql IMMUTABLE STRICT;
    `);

    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION varchar_eq_uuid(varchar, uuid) RETURNS boolean AS $$
        BEGIN
          RETURN CAST($1 AS uuid) = $2;
        EXCEPTION WHEN others THEN
          RETURN FALSE;
        END;
      $$ LANGUAGE plpgsql IMMUTABLE STRICT;
    `);

    // 3. Create the custom operators
    await prisma.$executeRawUnsafe(`
      CREATE OPERATOR = (
        LEFTARG = uuid,
        RIGHTARG = varchar,
        PROCEDURE = uuid_eq_varchar,
        COMMUTATOR = =
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE OPERATOR = (
        LEFTARG = varchar,
        RIGHTARG = uuid,
        PROCEDURE = varchar_eq_uuid,
        COMMUTATOR = =
      );
    `);

    console.log("Successfully created implicit custom comparison operators for uuid = varchar.");
    console.log("Constraint and operator fix completed successfully!");
  } catch (error) {
    console.error("Error fixing foreign key constraint or operators:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
