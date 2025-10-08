// In-memory storage for OAuth state management
// This eliminates the need for the kv_store_b1e42adc table

interface StoredValue {
  timestamp: number;
  expires: number;
}

const memoryStore = new Map<string, StoredValue>();

// Set stores a key-value pair in memory
export const set = async (key: string, value: any): Promise<void> => {
  memoryStore.set(key, value);
};

// Get retrieves a key-value pair from memory
export const get = async (key: string): Promise<any> => {
  return memoryStore.get(key);
};

// Delete deletes a key-value pair from memory
export const del = async (key: string): Promise<void> => {
  memoryStore.delete(key);
};

// Sets multiple key-value pairs in memory
export const mset = async (keys: string[], values: any[]): Promise<void> => {
  keys.forEach((key, index) => {
    memoryStore.set(key, values[index]);
  });
};

// Gets multiple key-value pairs from memory
export const mget = async (keys: string[]): Promise<any[]> => {
  return keys.map(key => memoryStore.get(key));
};

// Deletes multiple key-value pairs from memory
export const mdel = async (keys: string[]): Promise<void> => {
  keys.forEach(key => memoryStore.delete(key));
};

// Search for key-value pairs by prefix
export const getByPrefix = async (prefix: string): Promise<any[]> => {
  const results: any[] = [];
  for (const [key, value] of memoryStore.entries()) {
    if (key.startsWith(prefix)) {
      results.push(value);
    }
  }
  return results;
};
