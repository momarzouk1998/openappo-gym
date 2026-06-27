-- CreateTable
CREATE TABLE "platform_config" (
    "id" SERIAL NOT NULL,
    "starter_price" INTEGER NOT NULL DEFAULT 299,
    "pro_price" INTEGER NOT NULL DEFAULT 599,
    "addon_prices" JSONB NOT NULL DEFAULT '{"expenses":100,"staff":100,"trainers":100,"classes":150,"branches":150,"advanced_reports":80,"extra_branch":150}',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- Seed the singleton row with defaults
INSERT INTO "platform_config" ("id") VALUES (1);
