import { MigrationInterface, QueryRunner } from "typeorm";

export class ProperUuidTypeForRelationsMigration1745781705552 implements MigrationInterface {
    name = 'ProperUuidTypeForRelationsMigration1745781705552'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_cart_guest_token"
        `);
        await queryRunner.query(`
            ALTER TABLE "cart" DROP COLUMN "guest_token"
        `);
        await queryRunner.query(`
            ALTER TABLE "cart"
            ADD "guest_token" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "cart"
            ADD CONSTRAINT "UQ_cart_guest" UNIQUE ("guest_token")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_cart_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "cart" DROP COLUMN "user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "cart"
            ADD "user_id" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "cart"
            ADD CONSTRAINT "UQ_cart_user" UNIQUE ("user_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "item_junction" DROP COLUMN "bundle_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "item_junction"
            ADD "bundle_id" uuid NOT NULL
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_item_junction_cart_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "item_junction" DROP COLUMN "cart_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "item_junction"
            ADD "cart_id" uuid
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_item_junction_order_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "item_junction" DROP COLUMN "order_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "item_junction"
            ADD "order_id" uuid
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_order_user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "order" DROP COLUMN "user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "order"
            ADD "user_id" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "ticket" DROP COLUMN "order_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "ticket"
            ADD "order_id" uuid NOT NULL
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ticket_user"
        `);
        await queryRunner.query(`
            ALTER TABLE "ticket" DROP COLUMN "user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "ticket"
            ADD "user_id" uuid NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_cart_guest_token" ON "cart" ("guest_token")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_cart_user_id" ON "cart" ("user_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_item_junction_cart_id" ON "item_junction" ("cart_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_item_junction_order_id" ON "item_junction" ("order_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_order_user_id" ON "order" ("user_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ticket_user" ON "ticket" ("user_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ticket_user"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_order_user_id"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_item_junction_order_id"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_item_junction_cart_id"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_cart_user_id"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_cart_guest_token"
        `);
        await queryRunner.query(`
            ALTER TABLE "ticket" DROP COLUMN "user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "ticket"
            ADD "user_id" text NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ticket_user" ON "ticket" ("user_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "ticket" DROP COLUMN "order_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "ticket"
            ADD "order_id" text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "order" DROP COLUMN "user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "order"
            ADD "user_id" text NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_order_user_id" ON "order" ("user_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "item_junction" DROP COLUMN "order_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "item_junction"
            ADD "order_id" text
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_item_junction_order_id" ON "item_junction" ("order_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "item_junction" DROP COLUMN "cart_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "item_junction"
            ADD "cart_id" text
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_item_junction_cart_id" ON "item_junction" ("cart_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "item_junction" DROP COLUMN "bundle_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "item_junction"
            ADD "bundle_id" text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "cart" DROP CONSTRAINT "UQ_f091e86a234693a49084b4c2c86"
        `);
        await queryRunner.query(`
            ALTER TABLE "cart" DROP COLUMN "user_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "cart"
            ADD "user_id" text
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_cart_user_id" ON "cart" ("user_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "cart" DROP CONSTRAINT "UQ_080a7ebd9c62f21c551db764665"
        `);
        await queryRunner.query(`
            ALTER TABLE "cart" DROP COLUMN "guest_token"
        `);
        await queryRunner.query(`
            ALTER TABLE "cart"
            ADD "guest_token" text
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_cart_guest_token" ON "cart" ("guest_token")
        `);
    }

}
