"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentController = void 0;
const constants_util_1 = require("../../../utils/constants.util");
const response_entity_1 = require("../../../entities/core/response.entity");
const master_controller_1 = __importDefault(require("../../master.controller"));
const assignment_model_1 = require("../../../models/v1/assignment.model");
class AssignmentController extends master_controller_1.default {
    constructor() {
        super();
        this.assignmentModel = new assignment_model_1.AssignmentModel();
        // bindings
        this.fetchAssignments = this.fetchAssignments.bind(this);
        this.deleteAssignments = this.deleteAssignments.bind(this);
    }
    async fetchAssignments(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let params;
        try {
            params = req.query;
            resModel = await this.assignmentModel.fetch(params);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchAssignments`);
        }
    }
    async deleteAssignments(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        try {
            resModel = await this.assignmentModel.deleteEntity("election", "assignment", "assignment_id", req.params.id);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : deleteAssignment`);
        }
    }
}
exports.AssignmentController = AssignmentController;
