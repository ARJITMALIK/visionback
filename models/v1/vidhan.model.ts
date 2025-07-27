import { QueryEntity } from "../../entities/core/query.entity";
import { ResponseEntity } from "../../entities/core/response.entity";
import { Constants } from "../../utils/constants.util";
import MasterModel from "../master.model";

export class VidhanModel extends MasterModel {

    constructor() {
        super();
    }

    async fetch(params: any, limit: number = 1) {
        const startMS = new Date().getTime();
        const resModel = { ...ResponseEntity };
        let queryModel = { ...QueryEntity };

        let query = `
            SELECT 
                v.*, 
                l.lok_name, 
                l.state 
            FROM 
                election.vidhan_master v
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
            if (params.lok_id) {
                whereConditions.push(`v.lok_id = $${index}`);
                values.push(params.lok_id);
                index += 1;
            }

            if (params.vidhan_id) {
                whereConditions.push(`v.vidhan_id = $${index}`);
                values.push(params.vidhan_id);
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
                query += ` ORDER BY v.${params.sorting_field} ${params.sorting_type.toUpperCase()}`;
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
            this.logger.error(`DB Fetch Error: ${query} - Error: ${JSON.stringify(error)}`, 'vidhanModel: fetch');
        } finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }

        return resModel;
    }
}
