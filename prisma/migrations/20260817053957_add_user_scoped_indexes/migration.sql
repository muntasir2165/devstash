-- CreateIndex
CREATE INDEX "Collection_userId_isFavorite_idx" ON "Collection"("userId", "isFavorite");

-- CreateIndex
CREATE INDEX "Item_userId_isPinned_idx" ON "Item"("userId", "isPinned");

-- CreateIndex
CREATE INDEX "Item_userId_isFavorite_idx" ON "Item"("userId", "isFavorite");

-- CreateIndex
CREATE INDEX "Item_userId_itemTypeId_idx" ON "Item"("userId", "itemTypeId");
