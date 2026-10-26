import { MigrationInterface, QueryRunner } from "typeorm";

export class PendingEmailMigration1793002613000 implements MigrationInterface {
    name = 'PendingEmailMigration1793002613000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "pending_email" text
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "pending_email"
        `);
    }

}
