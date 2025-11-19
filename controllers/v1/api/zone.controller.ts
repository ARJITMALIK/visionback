import { Request, Response } from "express";
import { Constants } from "../../../utils/constants.util";
import { ResponseEntity } from "../../../entities/core/response.entity";
import MasterController from "../../master.controller";
import { ZoneModel } from "../../../models/v1/zone.model";

export class ZoneController extends MasterController {

    private zoneModel: ZoneModel;

    constructor() {
        super();

        this.zoneModel = new ZoneModel();

        // bindings
        this.fetchzone = this.fetchzone.bind(this);
        this.createzone = this.createzone.bind(this);
        this.updatezone = this.updatezone.bind(this);
        this.deletezone = this.deletezone.bind(this);
        this.createAssignments = this.createAssignments.bind(this);
    }

    async fetchzone(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let params;
        try {
            params = req.query;
            resModel = await this.zoneModel.fetch(params);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);
        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchzone`);
        }
    }

    async createzone(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let payload;
        try {
            payload = req.body;
            resModel = await this.zoneModel.createEntity(payload, "election", "zone_master", "zone_id");
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : zonesController`);
        }
    }

    async updatezone(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let payload;
        try {
            payload = req.body;
            resModel = await this.zoneModel.updateEntity("election", "zone_master", { zone_id: req.params.id }, payload);
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : updatezone`);
        }
    }

    async deletezone(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity }
        try {
            resModel = await this.zoneModel.deleteEntity("election", "zone_master", "zone_id", req.params.id);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : deletezone`);
        }
    }

    async createAssignments(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        try {
            // 1. Extract the 'assignments' array from the request body.
            const { assignments } = req.body;

            // 2. Add validation to ensure the payload is correct.
            if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
                resModel.status = Constants.ERROR;
                resModel.info = "Request body must contain a non-empty 'assignments' array.";
                resModel.tat = (new Date().getTime() - startMS) / 1000;
                // Use 400 for a bad request from the client
                return res.status(Constants.HTTP_BAD_REQUEST).json(resModel);
            }
            
            // 3. Call the createMultipleEntities method from the parent model.
            //    This method is available via `this.zoneModel` because ZoneModel extends MasterModel.
            resModel = await this.zoneModel.createMultipleEntities(
                assignments,        // The array of { booth_id, zc_id } objects
                "election",         // The database schema
                "assignment",       // The table to insert into
                "assignment_id"     // The primary key to return
            );

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            
            // Use 201 Created for a successful creation response
            res.status(Constants.HTTP_CREATED).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : createAssignments`);
            res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json(resModel);
        }
    }
}