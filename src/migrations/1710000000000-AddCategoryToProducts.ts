import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryToProducts1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "categoryId" integer;
      
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_products_category'
        ) THEN
          ALTER TABLE "products" 
          ADD CONSTRAINT "FK_products_category" 
          FOREIGN KEY ("categoryId") 
          REFERENCES "categories"("id") 
          ON DELETE SET NULL;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "FK_products_category";
      ALTER TABLE "products" DROP COLUMN IF EXISTS "categoryId";
    `);
  }
}
