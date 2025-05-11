import { db } from './index';
import { products } from './schema';
import { addProductToVectorStore, closeVectorStore } from './vector-store';

async function generateEmbeddings() {
  console.log('Iniciando geração de embeddings...');
  
  try {
    // Buscar todos os produtos
    const allProducts = await db.select().from(products);
    console.log(`Encontrados ${allProducts.length} produtos para processar`);

    // Gerar embeddings para cada produto
    for (const product of allProducts) {
      console.log(`Processando produto: ${product.name}`);
      await addProductToVectorStore(product);
    }

    console.log('Geração de embeddings concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar embeddings:', error);
    throw error;
  } finally {
    await closeVectorStore();
  }
}

// Executar o script
if (require.main === module) {
  generateEmbeddings().catch(console.error);
} 