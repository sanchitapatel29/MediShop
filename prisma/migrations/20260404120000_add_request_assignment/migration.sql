ALTER TABLE "ProductRequest"
ADD COLUMN "assigned_to" INTEGER,
ADD COLUMN "claimed_at" TIMESTAMP(3),
ADD COLUMN "resolved_at" TIMESTAMP(3);

ALTER TABLE "ProductRequest"
ADD CONSTRAINT "ProductRequest_assigned_to_fkey"
FOREIGN KEY ("assigned_to") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "ProductRequest_assigned_to_idx" ON "ProductRequest"("assigned_to");
