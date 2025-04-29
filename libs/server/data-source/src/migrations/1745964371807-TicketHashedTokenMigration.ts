import { MigrationInterface, QueryRunner } from "typeorm";

export class TicketHashedTokenMigration1745964371807 implements MigrationInterface {
    name = 'TicketHashedTokenMigration1745964371807'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ticket_qrCode"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ticket_tokenHash" ON "ticket" ("hashed_token")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ticket_tokenHash"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ticket_qrCode" ON "ticket" ("qr_code")
        `);
    }

}
