import { MigrationInterface, QueryRunner } from "typeorm";

export class TicketHashedTokenMigration1745963703883 implements MigrationInterface {
    name = 'TicketHashedTokenMigration1745963703883'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "ticket"
            ADD "hashed_token" text NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "ticket" DROP COLUMN "hashed_token"
        `);
    }

}
