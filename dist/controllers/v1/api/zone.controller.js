"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZoneController = void 0;
const constants_util_1 = require("../../../utils/constants.util");
const response_entity_1 = require("../../../entities/core/response.entity");
const master_controller_1 = __importDefault(require("../../master.controller"));
const zone_model_1 = require("../../../models/v1/zone.model");
class ZoneController extends master_controller_1.default {
    constructor() {
        super();
        this.zoneModel = new zone_model_1.ZoneModel();
        // bindings
        this.fetchzone = this.fetchzone.bind(this);
        this.createzone = this.createzone.bind(this);
        this.updatezone = this.updatezone.bind(this);
        this.deletezone = this.deletezone.bind(this);
        this.createAssignments = this.createAssignments.bind(this);
    }
    async fetchzone(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let params;
        try {
            params = req.query;
            resModel = await this.zoneModel.fetch(params);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchzone`);
        }
    }
    async createzone(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            resModel = await this.zoneModel.createEntity(payload, "election", "zone_master", "zone_id");
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : zonesController`);
        }
    }
    async updatezone(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        let payload;
        try {
            payload = req.body;
            resModel = await this.zoneModel.updateEntity("election", "zone_master", { zone_id: req.params.id }, payload);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : updatezone`);
        }
    }
    async deletezone(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        try {
            resModel = await this.zoneModel.deleteEntity("election", "zone_master", "zone_id", req.params.id);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(constants_util_1.Constants.HTTP_OK).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : deletezone`);
        }
    }
    async createAssignments(req, res) {
        const startMS = new Date().getTime();
        let resModel = { ...response_entity_1.ResponseEntity };
        try {
            // 1. Extract the 'assignments' array from the request body.
            const { assignments } = req.body;
            // 2. Add validation to ensure the payload is correct.
            if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
                resModel.status = constants_util_1.Constants.ERROR;
                resModel.info = "Request body must contain a non-empty 'assignments' array.";
                resModel.tat = (new Date().getTime() - startMS) / 1000;
                // Use 400 for a bad request from the client
                return res.status(constants_util_1.Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            // 3. Call the createMultipleEntities method from the parent model.
            //    This method is available via `this.zoneModel` because ZoneModel extends MasterModel.
            resModel = await this.zoneModel.createMultipleEntities(assignments, // The array of { booth_id, zc_id } objects
            "election", // The database schema
            "assignment", // The table to insert into
            "assignment_id" // The primary key to return
            );
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            // Use 201 Created for a successful creation response
            res.status(constants_util_1.Constants.HTTP_CREATED).json(resModel);
        }
        catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : createAssignments`);
            res.status(constants_util_1.Constants.HTTP_INTERNAL_SERVER_ERROR).json(resModel);
        }
    }
}
exports.ZoneController = ZoneController;
