import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, isDatabaseConnected } from '@/lib/db';
import { CategoryModel } from '@/models/Category';
import { getSessionFromRequest } from '@/lib/auth/session';
import { requireAdmin, createAuthErrorResponse } from '@/lib/auth/rbac';

const DEFAULT_CATEGORIES = [
  { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', order: 1, isActive: true },
  { name: 'Dairy & Eggs', slug: 'dairy-eggs', order: 2, isActive: true },
  { name: 'Bakery & Bread', slug: 'bakery-bread', order: 3, isActive: true },
  { name: 'Grocery & Staples', slug: 'grocery-staples', order: 4, isActive: true },
  { name: 'Beverages', slug: 'beverages', order: 5, isActive: true },
  { name: 'Snacks & Sweets', slug: 'snacks-sweets', order: 6, isActive: true },
  { name: 'Personal Care', slug: 'personal-care', order: 7, isActive: true },
  { name: 'Household & Cleaning', slug: 'household-cleaning', order: 8, isActive: true },
  { name: 'Frozen Foods', slug: 'frozen-foods', order: 9, isActive: true },
];

export async function GET() {
  try {
    await connectToDatabase();
    if (isDatabaseConnected()) {
      const categories = await CategoryModel.find({ isActive: true }).sort({ order: 1 });
      if (categories.length > 0) {
        return NextResponse.json({ success: true, categories });
      }
    }
    return NextResponse.json({ success: true, categories: DEFAULT_CATEGORIES });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    requireAdmin(session);

    const body = await req.json();
    const { name, slug, description, image, order } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    await connectToDatabase();
    if (isDatabaseConnected()) {
      const newCat = await CategoryModel.create({
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        image,
        order: order || 0,
        isActive: true,
      });
      return NextResponse.json({ success: true, category: newCat }, { status: 201 });
    }

    return NextResponse.json({
      success: true,
      category: { name, slug, description, image, order: order || 0, isActive: true },
    });
  } catch (err: any) {
    return createAuthErrorResponse(err);
  }
}
