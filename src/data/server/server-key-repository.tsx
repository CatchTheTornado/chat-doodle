import { BaseRepository, IFilter, IQuery } from "./base-repository"
import { KeyDTO } from "../dto";
import { pool } from '@/data/server/db-provider'
import { getCurrentTS } from "@/lib/utils";
import { keys } from "./db-schema";
import { eq } from "drizzle-orm/sql";
import { create } from "./generic-repository";


export type KeysQuery = IQuery & { 
    filter: { keyHash?: string, emailHash?: string }
}
export default class ServerKeyRepository extends BaseRepository<KeyDTO> {


    // create a new config
    async create(item: KeyDTO): Promise<KeyDTO> {
        const db = (await this.db());
        return create(item, keys, db); // generic implementation
    }

    // update config
    async upsert(query:Record<string, any>, item: KeyDTO): Promise<KeyDTO> {        
        const db = (await this.db());
        let existingKey = db.select({ keyLocatorHash: keys.keyLocatorHash, keyHash: keys.keyHash, emailHash: keys.emailHash, updatedAt: keys.updatedAt, extra: keys.extra, acl: keys.acl, expiryDate: keys.expiryDate}).from(keys).where(eq(keys.keyLocatorHash, query['keyLocatorHash'])).get() as KeyDTO
        if (!existingKey) {
            existingKey = await this.create(item)
        } else {
            existingKey = item
            existingKey.updatedAt = getCurrentTS()
            db.update(keys).set(existingKey).where(eq(keys.keyLocatorHash, query['keyLocatorHash'])).run();
        }
        return Promise.resolve(existingKey as KeyDTO)   
    }

    async delete(query: IFilter): Promise<boolean> {
        const db = (await this.db());
        return db.delete(keys).where(eq(keys.keyLocatorHash, query['keyLocatorHash'])).run().changes > 0
    }

    async findAll(query: KeysQuery): Promise<KeyDTO[]> {
        const db = (await this.db());
        let dbQuery = db.select().from(keys);

        if(query?.filter){
            if(query.filter.emailHash){ 
                dbQuery.where(eq(keys.emailHash, query.filter.emailHash))

            }
            if(query.filter.keyHash){
                dbQuery.where(eq(keys.keyHash, query.filter.keyHash))
            }
            if(query.filter.keyLocatorHash){
                dbQuery.where(eq(keys.keyLocatorHash, query.filter.keyLocatorHash))
            }            
        }

        return Promise.resolve(dbQuery.all() as KeyDTO[])
    }

}