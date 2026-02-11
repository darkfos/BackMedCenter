import { createClient } from "redis";

import { dbConfig } from "@/conf/dbConfig";

class CacheClient {
  private client: any;

  constructor() {
    this.connect();
  }

  async connect() {
    this.client = await createClient({ url: dbConfig.redis_url }).connect();
  }

  get redisClient() {
    return this.client;
  }

  cache(key: string) {
    const client = this.client;

    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) {
      const cacheData = client.get(key);
      const orMethod = descriptor.value;

      console.log("test #1");

      if (cacheData) {
        return descriptor;
      }

      return descriptor;
    };
  }
}

export default new CacheClient();
