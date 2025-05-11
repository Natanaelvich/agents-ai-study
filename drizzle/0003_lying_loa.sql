CREATE INDEX "embedding_idx" ON "product_embeddings" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
ALTER TABLE "product_embeddings" DROP COLUMN "updated_at";