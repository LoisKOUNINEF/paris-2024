import { MigrationInterface, QueryRunner } from "typeorm";

export class UserCreationMigration1743626456683 implements MigrationInterface {
    name = 'UserCreationMigration1743626456683'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'staff', 'customer')
        `);
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "secretKey" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "firstName" text NOT NULL,
                "lastName" text NOT NULL,
                "email" text NOT NULL,
                "password" text NOT NULL,
                "role" "public"."user_role_enum" NOT NULL DEFAULT 'customer',
                "cartId" text NOT NULL DEFAULT 'cartId',
                "isAnonymized" boolean NOT NULL DEFAULT false,
                "lastLoginAt" TIMESTAMP WITH TIME ZONE NOT NULL,
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"),
                CREATE INDEX IDX_user_email ON "user" ("email")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "user"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."user_role_enum"
        `);
    }

}
