-- Índices para las consultas más frecuentes (catálogo, pedidos del usuario,
-- panel de administración, reseñas y sesiones de ofertas).

-- CreateIndex
CREATE INDEX "Product_category_subCategory_idx" ON "Product"("category", "subCategory");
CREATE INDEX "Product_isOffer_idx" ON "Product"("isOffer");
CREATE INDEX "Product_isFeatured_idx" ON "Product"("isFeatured");

-- CreateIndex
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- CreateIndex
CREATE INDEX "DealSession_active_startsAt_idx" ON "DealSession"("active", "startsAt");

-- CreateIndex
CREATE INDEX "Reclamacion_estado_createdAt_idx" ON "Reclamacion"("estado", "createdAt");
CREATE INDEX "Reclamacion_userId_idx" ON "Reclamacion"("userId");
