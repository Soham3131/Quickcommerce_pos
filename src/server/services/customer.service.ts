import { connectToDatabase, isDatabaseConnected } from '@/lib/db';
import { CustomerModel, ICustomer } from '@/models/Customer';
import { dataStore } from '../storage/dataStore';
import { Customer, CustomerAddress } from '@/types';
import { INITIAL_CUSTOMER_ADDRESSES } from '@/data/customers';

function normalizeCustomer(doc: any): Customer {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  return {
    ...obj,
    id: obj._id ? obj._id.toString() : obj.id,
    _id: undefined,
    __v: undefined,
  };
}

export async function getCustomersServer(search?: string): Promise<Customer[]> {
  await connectToDatabase();

  if (isDatabaseConnected()) {
    const q: any = {};
    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      q.$or = [{ name: regex }, { phone: regex }, { email: regex }];
    }
    const docs = await CustomerModel.find(q).sort({ totalOrders: -1 });
    return docs.map(normalizeCustomer);
  }

  let list = Array.from(dataStore.customers.values());
  if (search) {
    const s = search.toLowerCase().trim();
    list = list.filter((c) => c.name.toLowerCase().includes(s) || c.phone.includes(s) || c.email.toLowerCase().includes(s));
  }
  return list;
}

export async function getCustomerByIdServer(id: string): Promise<Customer | null> {
  await connectToDatabase();
  if (isDatabaseConnected()) {
    try {
      const doc = await CustomerModel.findById(id);
      return doc ? normalizeCustomer(doc) : null;
    } catch {
      return null;
    }
  }
  return dataStore.customers.get(id) || null;
}

export async function createCustomerServer(data: Partial<Customer>): Promise<Customer> {
  await connectToDatabase();

  if (isDatabaseConnected()) {
    const doc = await CustomerModel.create({
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address || '',
      customerType: data.customerType || 'Regular',
      loyaltyPoints: data.loyaltyPoints || 0,
      totalOrders: 0,
      totalPurchases: 0,
      outstandingBalance: 0,
      addresses: [],
    });
    return normalizeCustomer(doc);
  } else {
    const id = `cust-${Date.now()}`;
    const newCustomer: Customer = {
      id,
      name: data.name || 'Customer',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      customerType: data.customerType || 'Regular',
      loyaltyPoints: data.loyaltyPoints || 0,
      totalOrders: 0,
      totalPurchases: 0,
      outstandingBalance: 0,
      createdAt: new Date().toISOString(),
    };
    dataStore.customers.set(id, newCustomer);
    return newCustomer;
  }
}

export async function getCustomerAddressesServer(customerId: string): Promise<CustomerAddress[]> {
  await connectToDatabase();
  if (isDatabaseConnected()) {
    const doc = await CustomerModel.findById(customerId);
    if (!doc || !doc.addresses) return [];
    return doc.addresses.map((a: any) => ({
      id: a.id,
      label: a.label,
      fullName: a.fullName,
      phone: a.phone,
      houseNo: a.houseNo,
      street: a.street,
      area: a.area,
      landmark: a.landmark,
      city: a.city,
      state: a.state,
      pincode: a.pincode,
      isDefault: Boolean(a.isDefault),
    }));
  }

  return INITIAL_CUSTOMER_ADDRESSES;
}

export async function addCustomerAddressServer(
  customerId: string,
  addressData: Omit<CustomerAddress, 'id'>
): Promise<CustomerAddress> {
  await connectToDatabase();
  const newId = `addr-${Date.now()}`;
  const newAddress: CustomerAddress = { ...addressData, id: newId };

  if (isDatabaseConnected()) {
    const doc = await CustomerModel.findById(customerId);
    if (doc) {
      if (newAddress.isDefault) {
        doc.addresses.forEach((a) => {
          a.isDefault = false;
        });
      }
      doc.addresses.push(newAddress as any);
      await doc.save();
    }
  }

  return newAddress;
}
