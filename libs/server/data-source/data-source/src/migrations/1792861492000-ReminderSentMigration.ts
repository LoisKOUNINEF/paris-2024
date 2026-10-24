import { MigrationInterface, QueryRunner } from "typeorm";

export class ReminderSentMigration1792861492000 implements MigrationInterface {
    name = 'ReminderSentMigration1792861492000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "anonymization_reminder_sent_at" TIMESTAMP WITH TIME ZONE
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "inactivity_reminder_sent_at" TIMESTAMP WITH TIME ZONE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "inactivity_reminder_sent_at"
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "anonymization_reminder_sent_at"
        `);
    }

}
