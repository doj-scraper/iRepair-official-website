-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('admin', 'wholesale', 'retail');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'SHIPPED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(2) NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Model" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(4) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "brandId" TEXT NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phone" (
    "id" TEXT NOT NULL,
    "generation" VARCHAR(4) NOT NULL,
    "variantCode" VARCHAR(4) NOT NULL,
    "variantName" VARCHAR(20),
    "externalModelId" VARCHAR(20),
    "modelId" TEXT NOT NULL,

    CONSTRAINT "Phone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bucket" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(20) NOT NULL,

    CONSTRAINT "Bucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartType" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(2) NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "bucketId" INTEGER NOT NULL,

    CONSTRAINT "PartType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartQuality" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(2) NOT NULL,
    "name" VARCHAR(20) NOT NULL,

    CONSTRAINT "PartQuality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartMaster" (
    "id" TEXT NOT NULL,
    "sku" VARCHAR(20) NOT NULL,
    "searchIndex" TEXT NOT NULL,
    "partTypeId" TEXT NOT NULL,
    "qualityId" TEXT NOT NULL,
    "primaryPhoneId" TEXT NOT NULL,
    "supplier" VARCHAR(50),
    "cost" INTEGER,
    "price" INTEGER,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "PartMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneCompatibility" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "phoneId" TEXT NOT NULL,

    CONSTRAINT "PhoneCompatibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartAlias" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "supplier" VARCHAR(50) NOT NULL,
    "supplierSku" VARCHAR(50) NOT NULL,
    "supplierName" TEXT,

    CONSTRAINT "PartAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockLedger" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "change" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "reason" VARCHAR(50) NOT NULL,
    "reference" VARCHAR(100),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "shop_name" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "role" "AppRole" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "partId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "stripe_session" TEXT,
    "total_amount" INTEGER NOT NULL DEFAULT 0,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "sku_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_code_key" ON "Brand"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Model_brandId_code_key" ON "Model"("brandId", "code");

-- CreateIndex
CREATE INDEX "Phone_modelId_idx" ON "Phone"("modelId");

-- CreateIndex
CREATE INDEX "Phone_externalModelId_idx" ON "Phone"("externalModelId");

-- CreateIndex
CREATE UNIQUE INDEX "Phone_modelId_generation_variantCode_key" ON "Phone"("modelId", "generation", "variantCode");

-- CreateIndex
CREATE UNIQUE INDEX "Bucket_name_key" ON "Bucket"("name");

-- CreateIndex
CREATE INDEX "PartType_bucketId_idx" ON "PartType"("bucketId");

-- CreateIndex
CREATE UNIQUE INDEX "PartType_bucketId_code_key" ON "PartType"("bucketId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "PartQuality_code_key" ON "PartQuality"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PartMaster_sku_key" ON "PartMaster"("sku");

-- CreateIndex
CREATE INDEX "PartMaster_stock_idx" ON "PartMaster"("stock");

-- CreateIndex
CREATE INDEX "PartMaster_partTypeId_qualityId_idx" ON "PartMaster"("partTypeId", "qualityId");

-- CreateIndex
CREATE INDEX "PartMaster_createdAt_idx" ON "PartMaster"("createdAt");

-- CreateIndex
CREATE INDEX "PhoneCompatibility_phoneId_idx" ON "PhoneCompatibility"("phoneId");

-- CreateIndex
CREATE INDEX "PhoneCompatibility_partId_idx" ON "PhoneCompatibility"("partId");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneCompatibility_partId_phoneId_key" ON "PhoneCompatibility"("partId", "phoneId");

-- CreateIndex
CREATE INDEX "PartAlias_supplierSku_idx" ON "PartAlias"("supplierSku");

-- CreateIndex
CREATE INDEX "PartAlias_partId_idx" ON "PartAlias"("partId");

-- CreateIndex
CREATE UNIQUE INDEX "PartAlias_supplier_supplierSku_key" ON "PartAlias"("supplier", "supplierSku");

-- CreateIndex
CREATE INDEX "StockLedger_partId_createdAt_idx" ON "StockLedger"("partId", "createdAt");

-- CreateIndex
CREATE INDEX "StockLedger_partId_idx" ON "StockLedger"("partId");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_key" ON "user_roles"("user_id", "role");

-- CreateIndex
CREATE INDEX "CartItem_userId_idx" ON "CartItem"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_userId_partId_key" ON "CartItem"("userId", "partId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_stripe_session_key" ON "orders"("stripe_session");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_sku_id_idx" ON "order_items"("sku_id");

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phone" ADD CONSTRAINT "Phone_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartType" ADD CONSTRAINT "PartType_bucketId_fkey" FOREIGN KEY ("bucketId") REFERENCES "Bucket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartMaster" ADD CONSTRAINT "PartMaster_partTypeId_fkey" FOREIGN KEY ("partTypeId") REFERENCES "PartType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartMaster" ADD CONSTRAINT "PartMaster_qualityId_fkey" FOREIGN KEY ("qualityId") REFERENCES "PartQuality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartMaster" ADD CONSTRAINT "PartMaster_primaryPhoneId_fkey" FOREIGN KEY ("primaryPhoneId") REFERENCES "Phone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneCompatibility" ADD CONSTRAINT "PhoneCompatibility_partId_fkey" FOREIGN KEY ("partId") REFERENCES "PartMaster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneCompatibility" ADD CONSTRAINT "PhoneCompatibility_phoneId_fkey" FOREIGN KEY ("phoneId") REFERENCES "Phone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartAlias" ADD CONSTRAINT "PartAlias_partId_fkey" FOREIGN KEY ("partId") REFERENCES "PartMaster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLedger" ADD CONSTRAINT "StockLedger_partId_fkey" FOREIGN KEY ("partId") REFERENCES "PartMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_partId_fkey" FOREIGN KEY ("partId") REFERENCES "PartMaster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
