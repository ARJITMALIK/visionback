"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyModel = void 0;
const query_entity_1 = require("../../entities/core/query.entity");
const response_entity_1 = require("../../entities/core/response.entity");
const constants_util_1 = require("../../utils/constants.util");
const master_model_1 = __importDefault(require("../master.model"));
class SurveyModel extends master_model_1.default {
    constructor() {
        super();
    }
    async fetch(params, limit = 1) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        let query = `
            SELECT 
                sm.*,
                zm.zone_name,
                u1.name as ot_name,
                u1.mobile as ot_mobile,
                u1.profile as ot_profile,
                u1.role as ot_role,
                u1.parent as ot_parent_id,
                u2.name as ot_parent_name,
                u2.mobile as ot_parent_mobile,
                u2.profile as ot_parent_profile,
                u2.role as ot_parent_role
            FROM election.survery_master sm
            LEFT JOIN election.zone_master zm ON sm.booth_id = zm.zone_id
            LEFT JOIN users.users_master u1 ON sm.ot_id = u1.user_id
            LEFT JOIN users.users_master u2 ON u1.parent = u2.user_id
            WHERE 1=1
        `;
        let countQuery = `
            SELECT COUNT(*) as total
            FROM election.survery_master sm
            LEFT JOIN election.zone_master zm ON sm.booth_id = zm.zone_id
            LEFT JOIN users.users_master u1 ON sm.ot_id = u1.user_id
            LEFT JOIN users.users_master u2 ON u1.parent = u2.user_id
            WHERE 1=1
        `;
        const values = [];
        const countValues = [];
        let index = 1;
        let countIndex = 1;
        try {
            // Build WHERE conditions
            let whereClause = '';
            // filter with sur_id
            if (params.sur_id) {
                whereClause += ` AND sm.sur_id = $${countIndex}`;
                values.push(params.sur_id);
                countValues.push(params.sur_id);
                index += 1;
                countIndex += 1;
            }
            if (params.citizen_name) {
                whereClause += ` AND sm.citizen_name = $${countIndex}`;
                values.push(params.citizen_name);
                countValues.push(params.citizen_name);
                index += 1;
                countIndex += 1;
            }
            if (params.citizen_mobile) {
                whereClause += ` AND sm.citizen_mobile = $${countIndex}`;
                values.push(params.citizen_mobile);
                countValues.push(params.citizen_mobile);
                index += 1;
                countIndex += 1;
            }
            if (params.election_id) {
                whereClause += ` AND sm.election_id = $${countIndex}`;
                values.push(params.election_id);
                countValues.push(params.election_id);
                index += 1;
                countIndex += 1;
            }
            if (params.ot_parent_name) {
                whereClause += ` AND u2.name = $${countIndex}`;
                values.push(params.ot_parent_name);
                countValues.push(params.ot_parent_name);
                index += 1;
                countIndex += 1;
            }
            if (params.ot_id) {
                whereClause += ` AND sm.ot_id = $${countIndex}`;
                values.push(params.ot_id);
                countValues.push(params.ot_id);
                index += 1;
                countIndex += 1;
            }
            if (params.zc_id) {
                whereClause += ` AND u1.parent = $${countIndex}`;
                values.push(params.zc_id);
                countValues.push(params.zc_id);
                index += 1;
                countIndex += 1;
            }
            if (params.booth_id) {
                whereClause += ` AND sm.booth_id = $${countIndex}`;
                values.push(params.booth_id);
                countValues.push(params.booth_id);
                index += 1;
                countIndex += 1;
            }
            // --- DATE FILTERING START ---
            if (params.start_date) {
                whereClause += ` AND sm.date >= $${countIndex}`;
                values.push(params.start_date);
                countValues.push(params.start_date);
                index += 1;
                countIndex += 1;
            }
            if (params.end_date) {
                whereClause += ` AND sm.date <= $${countIndex}`;
                values.push(params.end_date);
                countValues.push(params.end_date);
                index += 1;
                countIndex += 1;
            }
            // --- DATE FILTERING END ---
            // search filter - Updated to ILIKE
            if (params.search) {
                whereClause += ` AND (sm.citizen_name ILIKE $${countIndex} OR u1.name ILIKE $${countIndex} OR u2.name ILIKE $${countIndex})`;
                values.push(`%${params.search}%`);
                countValues.push(`%${params.search}%`);
                index += 1;
                countIndex += 1;
            }
            // Apply WHERE clause to both queries
            query += whereClause;
            countQuery += whereClause;
            // Get total count first
            const countResult = await this.sql.executeQuery(countQuery, countValues);
            const totalCount = countResult.status === constants_util_1.Constants.SUCCESS && countResult.rows && countResult.rows.length > 0
                ? parseInt(countResult.rows[0].total)
                : 0;
            // sorting
            if (params.sorting_type && params.sorting_field) {
                let sortField = params.sorting_field;
                if (['sur_id', 'citizen_name', 'citizen_mobile', 'election_id', 'ot_id', 'booth_id', 'date'].includes(params.sorting_field)) {
                    sortField = `sm.${params.sorting_field}`;
                }
                // No change needed for aliased fields
                query += ` ORDER BY ${sortField} ${params.sorting_type}`;
            }
            // pagination
            if (params.limit) {
                query += ` LIMIT $${index} OFFSET $${index + 1}`;
                values.push(parseInt(params.limit), parseInt(params.page || 0) * parseInt(params.limit));
            }
            // Execute the main query
            queryModel = await this.sql.executeQuery(query, values);
            if (queryModel.status === constants_util_1.Constants.SUCCESS) {
                resModel.status = queryModel.status;
                resModel.info = `OK: DB Query: ${queryModel.info} : ${queryModel.tat} : ${queryModel.message}`;
                resModel.data = {
                    ...queryModel,
                    count: totalCount
                };
            }
            else {
                resModel.status = constants_util_1.Constants.ERROR;
                resModel.info = `ERROR: DB Query: ${JSON.stringify(queryModel)}`;
            }
        }
        catch (error) {
            resModel.status = -33;
            resModel.info = `catch : ${resModel.info} : ${JSON.stringify(error)}`;
            this.logger.error(`DB Fetch Error: ${query} - Error: ${JSON.stringify(error)}`, 'SurveyModel: fetch');
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
}
exports.SurveyModel = SurveyModel;
