import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderPaymentIntentMigration1792861857000 implements MigrationInterface {
    name = 'OrderPaymentIntentMigration1792861857000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "order"
            ADD "payment_intent_id" text
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_order_payment_intent_id" ON "order" ("payment_intent_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."UQ_order_payment_intent_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "order" DROP COLUMN "payment_intent_id"
        `);
    }

}
