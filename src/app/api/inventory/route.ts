import { NextRequest, NextResponse } from 'next/server';
import { getProductsServer } from '@/server/services/product.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;

    const result = await getProductsServer({
      search,
      category,
      limit: 100,
    });

    const inventoryList = result.products.map((p) => ({
      productId: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      unit: p.unit,
      currentStock: p.currentStock,
      minStock: p.minStock,
      status: p.status,
      isLowStock: p.currentStock <= p.minStock,
      stockValue: Math.round(p.currentStock * p.purchasePrice * 100) / 100,
    }));

    return NextResponse.json({ success: true, inventory: inventoryList, total: inventoryList.length });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}
