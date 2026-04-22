-- CreateTable
CREATE TABLE "ShippingEvent" (
    "id" SERIAL NOT NULL,
    "shippingId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShippingEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ShippingEvent" ADD CONSTRAINT "ShippingEvent_shippingId_fkey" FOREIGN KEY ("shippingId") REFERENCES "Shipping"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
