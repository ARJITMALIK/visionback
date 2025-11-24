import { QueryEntity } from "../../entities/core/query.entity";
import { ResponseEntity } from "../../entities/core/response.entity";
import { Constants } from "../../utils/constants.util";
import MasterModel from "../master.model";

export class AssignmentModel extends MasterModel {

    constructor() {
        super();
    }

    async fetch(params: any, limit: number = 1) {
        const startMS = new Date().getTime();
        const resModel = { ...ResponseEntity };
        let queryModel = { ...QueryEntity };
        let query = `
            SELECT
                a.*,
                b.zone_name,
                u.name as user_name
            FROM
                election.assignment a
            LEFT JOIN
                election.zone_master b ON a.booth_id = b.zone_id
            LEFT JOIN
                users.users_master u ON a.zc_id = u.user_id
            WHERE `;
        const values: any[] = [];
        let index = 1;

        try {
            // filter with assignment_id
            if (params.assignment_id) {
                query += `a.assignment_id = $${index} AND `;
                values.push(params.assignment_id);
                index += 1;
            }

            if (params.booth_id) {
                query += `a.booth_id = $${index} AND `;
                values.push(params.booth_id);
                index += 1;
            }

            if (params.zc_id) {
                query += `a.zc_id = $${index} AND `;
                values.push(params.zc_id);
                index += 1;
            }
        
            // filter with status
            if (params.status && params.status.length > 0) {
                const placeholders = params.status.map(() => `$${index++}`).join(', ');
                query += `a.status IN (${placeholders}) AND `;
                values.push(...params.status);
            }

            // search filter
            if (params.search) {
                query += `(b.booth_name LIKE $${index} OR u.name LIKE $${index})`;
                values.push(`%${params.search}%`);
                index += 1;
            }

            // Remove trailing 'AND' or 'WHERE' if no conditions are applied
            if (query.endsWith('WHERE ')) {
                query = query.slice(0, -6);
            } else {
                query = query.slice(0, -4);
            }

            // sorting
            if (params.sorting_type && params.sorting_field) {
                query += ` ORDER BY ${params.sorting_field} ${params.sorting_type}`;
            }

            // pagination
            if (params.limit) {
                query += ` LIMIT $${index} OFFSET $${index + 1}`;
                values.push(parseInt(params.limit), parseInt(params.page || 0) * parseInt(params.limit));
            }

            // Execute the query
            queryModel = await this.sql.executeQuery(query, values);

            // Build the response based on query success or failure
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
            this.logger.error(`DB Fetch Error: ${query} - Error: ${JSON.stringify(error)}`, 'AssignmentModel: fetch');
        } finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }

        return resModel;
    }
}