import { MigrationInterface, QueryRunner } from "typeorm";

export class EmailValidationMigration1747976094700 implements MigrationInterface {
    name = 'EmailValidationMigration1747976094700'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "email_verified" boolean NOT NULL DEFAULT false
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "email_verification_token" text
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "email_verification_token"
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "email_verified"
        `);
    }

}
