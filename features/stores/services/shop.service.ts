import type { ShopDisplay } from '@/features/stores/types';
import type { ProductDisplay, Category } from '@/features/products/types';
import httpService from '@/shared/httpService';

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeShop(shop: any): ShopDisplay {
   return {
     id: shop.id,
     owner_id: shop.owner_id,
     shop_name: shop.shop_name,
     description: shop.description,
     address: shop.address,
     latitude: shop.latitude,
     longitude: shop.longitude,
     phone_number: shop.phone_number,
     area_id: shop.area_id,
     logo_url: shop.logo_url,
     is_active: shop.is_active,
     created_at: shop.created_at,
     updated_at: shop.updated_at,
     images: shop.images ?? [],
     averageRating: toNumber(shop.averageRating ?? shop.avg_rating),
     reviewCount: toNumber(shop.reviewCount ?? shop.review_count),
     deliveryTime: shop.deliveryTime ?? shop.delivery_time,
     location: shop.location,
   };
 }

function normalizeProduct(raw: any): ProductDisplay {
  // Handle both nested product structure and flat structure
  const productData = raw?.product ?? raw;
  const productImages = Array.isArray(productData?.product_images)
    ? productData.product_images
    : [];
  const primaryProductImage =
    productImages.find((img: any) => img?.is_primary) ?? productImages[0];

  return {
    id: toNumber(raw?.id ?? productData?.id),
    product_id: toNumber(productData?.id ?? raw?.product_id ?? raw?.id),
    category_id: toNumber(productData?.category_id),
    product_name: String(productData?.product_name ?? ''),
    description: String(productData?.description ?? ''),
    brand: productData?.brand ? String(productData.brand) : undefined,
    unit: productData?.unit ? String(productData.unit) : undefined,
    price: toNumber(raw?.price ?? productData?.price),
    created_at: String(productData?.created_at ?? ''),
    updated_at: String(productData?.updated_at ?? ''),
    shop_id: toNumber(raw?.shop_id ?? 0),
    shop_name: String(raw?.shop?.shop_name ?? ''),
    shop_price: toNumber(raw?.price ?? productData?.price),
    stock: toNumber(raw?.available_stock ?? raw?.stock),
    images: productImages.map((img: any) => ({
      id: toNumber(img?.id),
      product_id: toNumber(img?.product_id),
      image_url: img?.image_url,
      is_primary: Boolean(img?.is_primary),
      created_at: String(img?.created_at ?? ''),
      updated_at: String(img?.updated_at ?? ''),
    })),
    primaryImage: primaryProductImage?.image_url ?? undefined,
    category: productData?.category
      ? {
          id: toNumber(productData.category?.id),
          category_name: String(productData.category?.category_name ?? ''),
        }
      : undefined,
  };
}

function groupProductsByCategory(products: ProductDisplay[]): { category_name: string; products: ProductDisplay[] }[] {
  const groups: { category_name: string; products: ProductDisplay[] }[] = [];
  const seen = new Set<string>();

  for (const product of products) {
    const catName = product.category?.category_name || 'Uncategorized';
    if (!seen.has(catName)) {
      seen.add(catName);
      groups.push({ category_name: catName, products: [] });
    }
    const group = groups.find((g) => g.category_name === catName);
    if (group) {
      group.products.push(product);
    }
  }

  return groups;
}

export const shopService = {
async getShopProduct(shopProductId: number | string): Promise<ProductDisplay | null> {
  try {
    const response = await httpService.get(`/shop-products/${shopProductId}`);
    const payload = response.data?.data ?? response.data ?? null;
    return payload ? normalizeProduct(payload) : null;
  } catch (error) {
    console.log(error);
    return null;
  }
},
async getShops(areaId?: number, limit = 20, offset = 0): Promise<ShopDisplay[]> {
  try {
    const response = await httpService.get('/shops', {
      params: { area_id: areaId, limit, offset },
    });

    const shops = response.data.map((shop: any) =>
      normalizeShop(shop)
    );

    return shops;

  } catch (error) {
    console.log("SHOP ERROR:", error);
    return [];
  }
},
async getShopProducts(shopId: number, limit = 20, offset = 0): Promise<{
   products: ProductDisplay[];
   categories: { category_name: string; products: ProductDisplay[] }[];
 }> {
   try {
     const response = await httpService.get(`/shop-products`, {
       params: { shop_id: shopId, limit, offset },
     });

     const payload = response.data?.data ?? response.data ?? {};

     const products = Array.isArray(payload)
       ? payload.map(normalizeProduct)
       : [];

     return {
       products,
       categories: products.length
         ? groupProductsByCategory(products)
         : [],
     };

   } catch (error) {
     console.log(error);
     return { products: [], categories: [] };
   }
 }
};
