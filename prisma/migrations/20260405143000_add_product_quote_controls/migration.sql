ALTER TABLE "Product"
ADD COLUMN "is_quote_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "min_quote_quantity" INTEGER,
ADD COLUMN "starting_quote_price" DOUBLE PRECISION;
