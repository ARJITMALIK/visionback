import { Request, Response } from "express";
import { Constants } from "../../../utils/constants.util";
import { ResponseEntity } from "../../../entities/core/response.entity";
import MasterController from "../../master.controller";
import { AssignmentModel } from "../../../models/v1/assignment.model";

export class AssignmentController extends MasterController {

    private assignmentModel: AssignmentModel;

    constructor() {
        super();

        this.assignmentModel = new AssignmentModel();

        // bindings
        this.fetchAssignments = this.fetchAssignments.bind(this);
        this.deleteAssignments = this.deleteAssignments.bind(this);
    }

    async fetchAssignments(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let params;
        try {
            params = req.query;
            resModel = await this.assignmentModel.fetch(params);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);
        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchAssignments`);
        }
    }

    async deleteAssignments(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity }
        try {
            resModel = await this.assignmentModel.deleteEntity("election", "assignment", "assignment_id", req.params.id);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : deleteAssignment`);
        }
    }
}