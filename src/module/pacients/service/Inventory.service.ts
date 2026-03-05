import { Repository } from "typeorm";
import { dbSource } from "@/db/data-source.js";
import { InventoryItem } from "@/module/pacients/entity/InventoryItem.entity.js";

export interface CreateInventoryItemBody {
  name: string;
  quantity?: number;
  threshold?: number;
}

export class InventoryService {
  private static get repository(): Repository<InventoryItem> {
    return dbSource.getRepository(InventoryItem);
  }

  static async getAll(): Promise<Array<{ id: number; name: string; quantity: number; threshold: number }>> {
    const rows = await this.repository.find({ order: { id: "ASC" } });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      quantity: r.quantity,
      threshold: r.threshold,
    }));
  }

  static async create(body: CreateInventoryItemBody): Promise<InventoryItem | null> {
    const item = this.repository.create({
      name: body.name.trim(),
      quantity: Math.max(0, Number(body.quantity) ?? 0),
      threshold: Math.max(0, Number(body.threshold) ?? 0),
    });
    return await this.repository.save(item);
  }

  static async addQuantity(id: number, amount: number): Promise<boolean> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) return false;
    item.quantity = Math.max(0, item.quantity + amount);
    await this.repository.save(item);
    return true;
  }

  static async update(
    id: number,
    data: { name?: string; quantity?: number; threshold?: number }
  ): Promise<boolean> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) return false;
    if (data.name !== undefined) item.name = data.name.trim();
    if (data.quantity !== undefined) item.quantity = Math.max(0, data.quantity);
    if (data.threshold !== undefined) item.threshold = Math.max(0, data.threshold);
    await this.repository.save(item);
    return true;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
