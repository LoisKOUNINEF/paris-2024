import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderCreationMigration1745230461869 implements MigrationInterface {
    name = 'OrderCreationMigration1745230461869'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "bundle" DROP CONSTRAINT "CHK_bundle_ticket_amount"
        `);
        await queryRunner.query(`
            ALTER TABLE "bundle" DROP CONSTRAINT "CHK_bundle_price"
        `);
        await queryRunner.query(`
            CREATE TABLE "order" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "total_price" integer NOT NULL,
                "user_id" text NOT NULL,
                CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_order_user_id" ON "order" ("user_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "bundle"
            ADD CONSTRAINT "CHK_d87aa069a6eca2f96707411053" CHECK ("ticket_amount" > 0)
        `);
        await queryRunner.query(`
            ALTER TABLE "bundle"
            ADD CONSTRAINT "CHK_a1bd78e4904d240b302bac779a" CHECK ("price" > 0)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "bundle" DROP CONSTRAINT "CHK_a1bd78e4904d240b302bac779a"
        `);
        await queryRunner.query(`
            ALTER TABLE "bundle" DROP CONSTRAINT "CHK_d87aa069a6eca2f96707411053"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_order_user_id"
        `);
        await queryRunner.query(`
            DROP TABLE "order"
        `);
        await queryRunner.query(`
            ALTER TABLE "bundle"
            ADD CONSTRAINT "CHK_bundle_price" CHECK ((price > 0))
        `);
        await queryRunner.query(`
            ALTER TABLE "bundle"
            ADD CONSTRAINT "CHK_bundle_ticket_amount" CHECK ((ticket_amount > 0))
        `);
    }

}
