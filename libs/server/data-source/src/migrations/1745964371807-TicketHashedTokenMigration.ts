import { MigrationInterface, QueryRunner } from "typeorm";

export class TicketHashedTokenMigration1745964371807 implements MigrationInterface {
    name = 'TicketHashedTokenMigration1745964371807'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ticket_qrCode"
        `);
        await queryRunner.query(`
            ALTER TABLE "ticket" ADD "token_hash" text NOT NULL,
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ticket_tokenHash" ON "ticket" ("token_hash")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ticket_tokenHash"
        `);
        await queryRunner.query(`
            ALTER TABLE "ticket" DROP COLUMN "token_hash"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ticket_qrCode" ON "ticket" ("qr_code")
        `);
    }

}
