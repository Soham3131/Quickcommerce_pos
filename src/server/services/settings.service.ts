import { connectToDatabase, isDatabaseConnected } from '@/lib/db';
import { StoreSettingsModel } from '@/models/StoreSettings';
import { dataStore } from '../storage/dataStore';
import { StoreSettings } from '@/types';
import { INITIAL_SETTINGS } from '@/data/settings';

function normalizeSettings(doc: any): StoreSettings {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  return {
    ...obj,
    _id: undefined,
    __v: undefined,
  };
}

export async function getStoreSettingsServer(): Promise<StoreSettings> {
  await connectToDatabase();
  if (isDatabaseConnected()) {
    let settings = await StoreSettingsModel.findOne();
    if (!settings) {
      settings = await StoreSettingsModel.create(INITIAL_SETTINGS);
    }
    return normalizeSettings(settings);
  }
  return dataStore.settings || INITIAL_SETTINGS;
}

export async function updateStoreSettingsServer(
  updates: Partial<StoreSettings>,
  actorName: string
): Promise<StoreSettings> {
  await connectToDatabase();

  if (isDatabaseConnected()) {
    let settings = await StoreSettingsModel.findOne();
    if (!settings) {
      settings = await StoreSettingsModel.create({ ...INITIAL_SETTINGS, ...updates });
    } else {
      Object.assign(settings, updates);
      await settings.save();
    }
    return normalizeSettings(settings);
  } else {
    dataStore.settings = {
      ...dataStore.settings,
      ...updates,
    };
    return dataStore.settings;
  }
}
