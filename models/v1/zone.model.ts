import { QueryEntity } from "../../entities/core/query.entity";
import { ResponseEntity } from "../../entities/core/response.entity";
import { Constants } from "../../utils/constants.util";
import MasterModel from "../master.model";

export class ZoneModel extends MasterModel {

    constructor() {
        super();
    }

    async fetch(params: any, limit: number = 1) {
        const startMS = new Date().getTime();
        const resModel = { ...ResponseEntity };
        let queryModel = { ...QueryEntity };

        let query = `
            SELECT 
                z.*,
                v.vidhan_name,
                v.lok_id,
                l.state,
                l.lok_name
            FROM 
                election.zone_master z
            LEFT JOIN 
                election.vidhan_master v 
            ON 
                z.vidhan_id = v.vidhan_id
            LEFT JOIN 
                election.loksabha_master l 
            ON 
                v.lok_id = l.lok_id
        `;

        const values: any[] = [];
        let index = 1;
        const whereConditions: string[] = [];

        try {
            // Dynamic WHERE clauses
            if (params.vidhan_id) {
                whereConditions.push(`v.vidhan_id = $${index}`);
                values.push(params.vidhan_id);
                index += 1;
            }

            if (params.zone_id) {
                whereConditions.push(`z.zone_id = $${index}`);
                values.push(params.zone_id);
                index += 1;
            }

            if (params.lok_id) {
                whereConditions.push(`v.lok_id = $${index}`);
                values.push(params.lok_id);
                index += 1;
            }

            if (params.zc_id) {
                whereConditions.push(`z.zc_id = $${index}`);
                values.push(params.zc_id);
                index += 1;
            }

            if (params.ot_id) {
                whereConditions.push(`z.ot_id = $${index}`);
                values.push(params.ot_id);
                index += 1;
            }

            if (params.state) {
                whereConditions.push(`l.state ILIKE $${index}`);
                values.push(`%${params.state}%`);
                index += 1;
            }

            if (params.status && !Array.isArray(params.status)) {
                whereConditions.push(`v.status = $${index}`);
                values.push(params.status);
                index += 1;
            }

            if (params.status && Array.isArray(params.status) && params.status.length > 0) {
                const placeholders = params.status.map(() => `$${index++}`).join(', ');
                whereConditions.push(`v.status IN (${placeholders})`);
                values.push(...params.status);
            }

            if (params.search) {
                whereConditions.push(`v.name ILIKE $${index}`);
                values.push(`%${params.search}%`);
                index += 1;
            }

            // Apply WHERE conditions if any
            if (whereConditions.length > 0) {
                query += ' WHERE ' + whereConditions.join(' AND ');
            }

            // Sorting
            if (params.sorting_type && params.sorting_field) {
                // Allow sorting by fields from different tables
                let sortField = params.sorting_field;
                if (params.sorting_field === 'state') {
                    sortField = `l.${params.sorting_field}`;
                } else if (params.sorting_field === 'vidhan_name' || params.sorting_field === 'lok_id') {
                    sortField = `v.${params.sorting_field}`;
                } else {
                    sortField = `z.${params.sorting_field}`;
                }
                query += ` ORDER BY ${sortField} ${params.sorting_type.toUpperCase()}`;
            }

            // Pagination
            if (params.limit) {
                query += ` LIMIT $${index} OFFSET $${index + 1}`;
                values.push(parseInt(params.limit), parseInt(params.page || 0) * parseInt(params.limit));
            }

            // Execute the query
            queryModel = await this.sql.executeQuery(query, values);

            if (queryModel.status === Constants.SUCCESS) {
                resModel.status = queryModel.status;
                resModel.info = `OK: DB Query: ${queryModel.info} : ${queryModel.tat} : ${queryModel.message}`;
                resModel.data = queryModel;
            } else {
                resModel.status = Constants.ERROR;
                resModel.info = `ERROR: DB Query: ${JSON.stringify(queryModel)}`;
            }
        } catch (error) {
            resModel.status = -33;
            resModel.info = `catch : ${resModel.info} : ${JSON.stringify(error)}`;
            this.logger.error(`DB Fetch Error: ${query} - Error: ${JSON.stringify(error)}`, 'zoneModel: fetch');
        } finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }

        return resModel;
    }
}