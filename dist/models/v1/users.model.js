"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const query_entity_1 = require("../../entities/core/query.entity");
const response_entity_1 = require("../../entities/core/response.entity");
const constants_util_1 = require("../../utils/constants.util");
const master_model_1 = __importDefault(require("../master.model"));
class UserModel extends master_model_1.default {
    constructor() {
        super();
    }
    async fetch(params, limit = 1) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        // Query now uses a recursive CTE to calculate the cumulative survey count
        let query = `
            WITH RECURSIVE UserHierarchy AS (
                -- Anchor: Start with each user as their own ancestor
                SELECT user_id AS ancestor_id, user_id
                FROM users.users_master
                UNION ALL
                -- Recursive: Find all descendants
                SELECT uh.ancestor_id, um.user_id
                FROM users.users_master um
                JOIN UserHierarchy uh ON um.parent = uh.user_id
            ),
            DirectSurveyCounts AS (
                -- Calculate surveys done directly by each user
                SELECT ot_id as user_id, COUNT(sur_id) AS direct_count
                FROM election.survery_master
                GROUP BY ot_id
            ),
            CumulativeSurveyCounts AS (
                -- Sum up the counts for each ancestor from all their descendants
                SELECT uh.ancestor_id as user_id, SUM(COALESCE(dsc.direct_count, 0)) AS total_surveys
                FROM UserHierarchy uh
                LEFT JOIN DirectSurveyCounts dsc ON uh.user_id = dsc.user_id
                GROUP BY uh.ancestor_id
            )
            -- Final SELECT statement to join users with their cumulative survey counts
            SELECT u.*, COALESCE(csc.total_surveys, 0)::int AS survey_count
            FROM users.users_master u
            LEFT JOIN CumulativeSurveyCounts csc ON u.user_id = csc.user_id
            WHERE `;
        const values = [];
        let index = 1;
        try {
            // filter with user_id
            if (params.user_id) {
                query += `u.user_id = $${index} AND `;
                values.push(params.user_id);
                index += 1;
            }
            if (params.election_id) {
                query += `u.election_id = $${index} AND `;
                values.push(params.election_id);
                index += 1;
            }
            if (params.parent) {
                query += `u.parent = $${index} AND `;
                values.push(params.parent);
                index += 1;
            }
            // filter with mobile
            if (params.mobile) {
                query += `u.mobile = $${index} AND `;
                values.push(params.mobile);
                index += 1;
            }
            if (params.status) {
                query += `u.status = $${index} AND `;
                values.push(params.status);
                index += 1;
            }
            // filter with status array
            if (params.status && params.status.length > 0) {
                const placeholders = params.status.map(() => `$${index++}`).join(', ');
                query += `u.status IN (${placeholders}) AND `;
                values.push(...params.status);
            }
            // search filter
            if (params.search) {
                query += `(u.name LIKE $${index}) AND `;
                values.push(`%${params.search}%`);
                index++;
            }
            // Remove trailing 'AND' or 'WHERE' if no conditions are applied
            query = query.endsWith('WHERE ') ? query.slice(0, -7) : query.slice(0, -5);
            // sorting
            if (params.sorting_type && params.sorting_field) {
                const sortField = params.sorting_field === 'survey_count' ? 'survey_count' : `u.${params.sorting_field}`;
                query += ` ORDER BY ${sortField} ${params.sorting_type}`;
            }
            // pagination
            if (params.limit) {
                query += ` LIMIT $${index} OFFSET $${index + 1}`;
                values.push(parseInt(params.limit), parseInt(params.page || 0) * parseInt(params.limit));
                index += 2;
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
            this.logger.error(`DB Fetch Error: ${query} - Error: ${JSON.stringify(error)}`, 'UserModel: fetch');
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
    async fetchLogged(params, limit = 1) {
        const startMS = new Date().getTime();
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        // Query now uses a recursive CTE to calculate the cumulative survey count
        let query = `
            WITH RECURSIVE UserHierarchy AS (
                SELECT user_id AS ancestor_id, user_id FROM users.users_master
                UNION ALL
                SELECT uh.ancestor_id, um.user_id
                FROM users.users_master um
                JOIN UserHierarchy uh ON um.parent = uh.user_id
            ),
            DirectSurveyCounts AS (
                SELECT ot_id as user_id, COUNT(sur_id) AS direct_count
                FROM election.survery_master
                GROUP BY ot_id
            ),
            CumulativeSurveyCounts AS (
                SELECT uh.ancestor_id as user_id, SUM(COALESCE(dsc.direct_count, 0)) AS total_surveys
                FROM UserHierarchy uh
                LEFT JOIN DirectSurveyCounts dsc ON uh.user_id = dsc.user_id
                GROUP BY uh.ancestor_id
            )
            SELECT u.*, COALESCE(csc.total_surveys, 0)::int AS survey_count
            FROM users.users_master u
            LEFT JOIN CumulativeSurveyCounts csc ON u.user_id = csc.user_id
            WHERE `;
        const values = [];
        let index = 1;
        try {
            // filter with user_id
            if (params.user_id) {
                query += `u.user_id = $${index} AND `;
                values.push(params.user_id);
                index += 1;
            }
            // filter with mobile
            if (params.mobile) {
                query += `u.mobile = $${index} AND `;
                values.push(params.mobile);
                index += 1;
            }
            // filter with password
            if (params.password) {
                query += `u."password" = $${index} AND `;
                values.push(params.password);
                index += 1;
            }
            if (params.status) {
                query += `u.status = $${index} AND `;
                values.push(params.status);
                index += 1;
            }
            query += `u.status = true AND `;
            // search filter
            if (params.search) {
                query += `(u.name LIKE $${index}) AND `;
                values.push(`%${params.search}%`);
                index++;
            }
            // Remove trailing 'AND' or 'WHERE' if no conditions are applied
            query = query.endsWith('WHERE ') ? query.slice(0, -7) : query.slice(0, -5);
            // sorting
            if (params.sorting_type && params.sorting_field) {
                const sortField = params.sorting_field === 'survey_count' ? 'survey_count' : `u.${params.sorting_field}`;
                query += ` ORDER BY ${sortField} ${params.sorting_type}`;
            }
            // pagination
            if (params.limit) {
                query += ` LIMIT $${index} OFFSET $${index + 1}`;
                values.push(parseInt(params.limit), parseInt(params.page || 0) * parseInt(params.limit));
                index += 2;
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
            this.logger.error(`DB Fetch Error: ${query} - Error: ${JSON.stringify(error)}`, 'UserModel: fetchLogged');
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
    async updateUserAndChildren(userId, payload) {
        const startMS = new Date().getTime();
        // 1. First, update the parent user with the complete payload.
        const parentUpdateResModel = await this.updateEntity("users", "users_master", { user_id: userId }, payload);
        // If the parent update fails, return immediately.
        if (parentUpdateResModel.status !== constants_util_1.Constants.SUCCESS) {
            return parentUpdateResModel;
        }
        // 2. If the parent update was successful, proceed to update all children.
        const resModel = { ...response_entity_1.ResponseEntity };
        let queryModel = { ...query_entity_1.QueryEntity };
        // This recursive query finds all descendants (children, grandchildren, etc.) of the user.
        const query = `
            WITH RECURSIVE user_hierarchy AS (
                -- Anchor Member: Select direct children of the specified user
                SELECT user_id FROM users.users_master WHERE parent = $1

                UNION ALL

                -- Recursive Member: Find users whose parent is in the current result set
                SELECT u.user_id FROM users.users_master u
                INNER JOIN user_hierarchy uh ON u.parent = uh.user_id
            )
            -- Update the status for all descendants found by the query.
            UPDATE users.users_master
            SET status = $2
            WHERE user_id IN (SELECT user_id FROM user_hierarchy);
        `;
        const values = [userId, payload.status];
        try {
            queryModel = await this.sql.executeQuery(query, values);
            if (queryModel.status === constants_util_1.Constants.SUCCESS) {
                resModel.status = constants_util_1.Constants.SUCCESS;
                resModel.info = `Successfully updated user and children's status.`;
                resModel.data = queryModel;
            }
            else {
                // This state is not ideal: the parent was updated, but children were not.
                // A database transaction would be required for an atomic operation.
                resModel.status = constants_util_1.Constants.ERROR;
                resModel.info = `CRITICAL: Parent user was updated, but failed to update children's status. DB Info: ${JSON.stringify(queryModel)}`;
            }
        }
        catch (error) {
            resModel.status = -33;
            resModel.info = `CRITICAL: Parent user was updated, but a catch block error occurred while updating children. Error: ${JSON.stringify(error)}`;
            this.logger.error(`DB Update Children Error: ${query} - Error: ${JSON.stringify(error)}`, 'UserModel: updateUserAndChildren');
        }
        finally {
            resModel.tat = (new Date().getTime() - startMS) / 1000;
        }
        return resModel;
    }
}
exports.UserModel = UserModel;
