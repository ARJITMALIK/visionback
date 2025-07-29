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
            LEFT JOIN users.users_master u1 ON sm.ot_id = u1.user_id
            LEFT JOIN users.users_master u2 ON u1.parent = u2.user_id
            WHERE 1=1
        `;
        const values = [];
        let index = 1;
        try {
            // filter with sur_id
            if (params.sur_id) {
                query += ` AND sm.sur_id = $${index}`;
                values.push(params.sur_id);
                index += 1;
            }
            if (params.citizen_name) {
                query += ` AND sm.citizen_name = $${index}`;
                values.push(params.citizen_name);
                index += 1;
            }
            if (params.citizen_mobile) {
                query += ` AND sm.citizen_mobile = $${index}`;
                values.push(params.citizen_mobile);
                index += 1;
            }
            if (params.election_id) {
                query += ` AND sm.election_id = $${index}`;
                values.push(params.election_id);
                index += 1;
            }
            if (params.ot_id) {
                query += ` AND sm.ot_id = $${index}`;
                values.push(params.ot_id);
                index += 1;
            }
            if (params.booth_id) {
                query += ` AND sm.booth_id = $${index}`;
                values.push(params.booth_id);
                index += 1;
            }
            // search filter - now includes user names as well
            if (params.search) {
                query += ` AND (sm.citizen_name LIKE $${index} OR u1.name LIKE $${index} OR u2.name LIKE $${index})`;
                values.push(`%${params.search}%`);
                index += 1;
            }
            // sorting - handle both survey fields and joined user fields
            if (params.sorting_type && params.sorting_field) {
                let sortField = params.sorting_field;
                // Map sorting fields to include table aliases
                if (['sur_id', 'citizen_name', 'citizen_mobile', 'election_id', 'ot_id', 'booth_id'].includes(params.sorting_field)) {
                    sortField = `sm.${params.sorting_field}`;
                }
                else if (['ot_name', 'ot_mobile', 'ot_profile', 'ot_role'].includes(params.sorting_field)) {
                    // These are already aliased in SELECT
                    sortField = params.sorting_field;
                }
                else if (['ot_parent_name', 'ot_parent_mobile', 'ot_parent_profile', 'ot_parent_role'].includes(params.sorting_field)) {
                    // These are already aliased in SELECT
                    sortField = params.sorting_field;
                }
                query += ` ORDER BY ${sortField} ${params.sorting_type}`;
            }
            // pagination
            if (params.limit) {
                query += ` LIMIT $${index} OFFSET $${index + 1}`;
                values.push(parseInt(params.limit), parseInt(params.page || 0) * parseInt(params.limit));
            }
            // Execute the query
            queryModel = await this.sql.executeQuery(query, values);
            // Build the response based on query success or failure
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
            this.logger.error(`DB Fetch Error: ${query} - Error: ${JSON.stringify(error)}`, 'SurveyModel: fetch');
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
}
exports.SurveyModel = SurveyModel;
