"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidateModel = void 0;
const query_entity_1 = require("../../entities/core/query.entity");
const response_entity_1 = require("../../entities/core/response.entity");
const constants_util_1 = require("../../utils/constants.util");
const master_model_1 = __importDefault(require("../master.model"));
class CandidateModel extends master_model_1.default {
    constructor() {
        super();
    }
    async fetch(params, limit = 1) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        let query = `
            SELECT 
                z.*,
                v.party_name,
                v.party_logo,
                zm.zone_name
            FROM 
                election.candidate_master z
            LEFT JOIN 
                election.party_master v 
            ON 
                z.party_id = v.party_id
            LEFT JOIN 
                election.zone_master zm 
            ON 
                z.zone_id = zm.zone_id
        `;
        const values = [];
        let index = 1;
        const whereConditions = [];
        try {
            // Dynamic WHERE clauses
            if (params.candidate_id) {
                whereConditions.push(`z.candidate_id = $${index}`);
                values.push(params.candidate_id);
                index += 1;
            }
            if (params.party_id) {
                whereConditions.push(`z.party_id = $${index}`);
                values.push(params.party_id);
                index += 1;
            }
            if (params.zone_id) {
                whereConditions.push(`z.zone_id = $${index}`);
                values.push(params.zone_id);
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
                whereConditions.push(`(v.name ILIKE $${index} OR zm.zone_name ILIKE $${index})`);
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
                }
                else if (params.sorting_field === 'vidhan_name' || params.sorting_field === 'lok_id') {
                    sortField = `v.${params.sorting_field}`;
                }
                else if (params.sorting_field === 'zone_name') {
                    sortField = `zm.${params.sorting_field}`;
                }
                else {
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
            if (queryModel.status === constants_util_1.Constants.SUCCESS) {
                resModel.status = queryModel.status;
                resModel.info = `OK: DB Query: ${queryModel.info} : ${queryModel.tat} : ${queryModel.message}`;
                resModel.data = queryModel;
            }
            else {
                resModel.status = constants_util_1.Constants.ERROR;
                resModel.info = `ERROR: DB Query: ${JSON.stringify(queryModel)}`;
            }
        }
        catch (error) {
            resModel.status = -33;
            resModel.info = `catch : ${resModel.info} : ${JSON.stringify(error)}`;
            this.logger.error(`DB Fetch Error: ${query} - Error: ${JSON.stringify(error)}`, 'candidateModel: fetch');
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
}
exports.CandidateModel = CandidateModel;
