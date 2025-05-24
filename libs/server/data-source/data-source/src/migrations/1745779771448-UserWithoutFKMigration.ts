import { MigrationInterface, QueryRunner } from "typeorm";

export class UserWithoutFKMigration1745779771448 implements MigrationInterface {
    name = 'UserWithoutFKMigration1745779771448'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "cart_id"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "cart_id" text NOT NULL DEFAULT 'cart_id'
        `);
    }

}
