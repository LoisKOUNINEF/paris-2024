import { MigrationInterface, QueryRunner } from "typeorm";

// each of these columns already has a unique constraint, which postgres backs with its own index
export class DropRedundantIndexesMigration1793005166000 implements MigrationInterface {
    name = 'DropRedundantIndexesMigration1793005166000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS "public"."IDX_user_email"
        `);
        await queryRunner.query(`
            DROP INDEX IF EXISTS "public"."IDX_cart_guest_token"
        `);
        await queryRunner.query(`
            DROP INDEX IF EXISTS "public"."IDX_cart_user_id"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX "IDX_cart_user_id" ON "cart" ("user_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_cart_guest_token" ON "cart" ("guest_token")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_user_email" ON "user" ("email")
        `);
    }

}
