import { MigrationInterface, QueryRunner } from "typeorm";

export class ItemJunctionUniqueCartBundleMigration1793005165000 implements MigrationInterface {
    name = 'ItemJunctionUniqueCartBundleMigration1793005165000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // merge duplicate cart lines created by concurrent add-to-cart requests into the oldest one
        await queryRunner.query(`
            WITH "duplicates" AS (
                SELECT
                    "id",
                    FIRST_VALUE("id") OVER "line" AS "kept_id",
                    SUM("quantity") OVER (PARTITION BY "cart_id", "bundle_id") AS "total"
                FROM "item_junction"
                WHERE "cart_id" IS NOT NULL
                WINDOW "line" AS (PARTITION BY "cart_id", "bundle_id" ORDER BY "created_at", "id")
            )
            UPDATE "item_junction"
            SET "quantity" = "duplicates"."total"
            FROM "duplicates"
            WHERE "item_junction"."id" = "duplicates"."kept_id"
            AND "duplicates"."id" = "duplicates"."kept_id"
        `);
        await queryRunner.query(`
            DELETE FROM "item_junction"
            WHERE "id" IN (
                SELECT "id" FROM (
                    SELECT
                        "id",
                        ROW_NUMBER() OVER (PARTITION BY "cart_id", "bundle_id" ORDER BY "created_at", "id") AS "position"
                    FROM "item_junction"
                    WHERE "cart_id" IS NOT NULL
                ) AS "lines"
                WHERE "lines"."position" > 1
            )
        `);
        // order lines have a null cart_id and are not constrained
        await queryRunner.query(`
            ALTER TABLE "item_junction"
            ADD CONSTRAINT "UQ_item_junction_cart_bundle" UNIQUE ("cart_id", "bundle_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "item_junction" DROP CONSTRAINT "UQ_item_junction_cart_bundle"
        `);
    }

}
