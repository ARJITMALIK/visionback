import { Request, Response } from "express";
import { Constants } from "../../../utils/constants.util";
import { ResponseEntity } from "../../../entities/core/response.entity";
import MasterController from "../../master.controller";
import { SurveyModel } from "../../../models/v1/survey.model";

export class SurveyController extends MasterController {

    private surveyModel: SurveyModel;

    constructor() {
        super();

        this.surveyModel = new SurveyModel();

        // bindings
        this.fetchSurveys = this.fetchSurveys.bind(this);
        this.createSurvey = this.createSurvey.bind(this);
        this.updateSurvey = this.updateSurvey.bind(this);
        this.deleteSurvey = this.deleteSurvey.bind(this);
        this.bulkDeleteSurvey = this.bulkDeleteSurvey.bind(this);
    }

    async fetchSurveys(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity }
        let params;
        try {
            params = req.query;
            resModel = await this.surveyModel.fetch(params);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);
        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchUsers`);
        }
    }

    async createSurvey(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity }
        let payload;
        try {
            payload = req.body;

            // make sure required keys exist
            var verifyKeys = this.verifyKeys(req.body, ['sur_data', 'citizen_name', 'citizen_mobile', 'location', 'ot_id', 'booth_id', 'citizen_image', 'recording', 'duration']);
            if (verifyKeys.length != 0) {
                resModel.status = -9;
                resModel.info = "error: " + verifyKeys + " : " + resModel.info;
                return res.status(Constants.HTTP_BAD_REQUEST).json(resModel);
            }

            // make sure required fields are not empty
            var mandatoryFields = this.mandatoryFields(req.body, ['sur_data', 'citizen_name', 'citizen_mobile', 'location', 'ot_id', 'booth_id', 'citizen_image', 'recording', 'duration']);
            if (mandatoryFields.length != 0) {
                resModel.status = -9;
                resModel.info = "error: " + mandatoryFields + " : " + resModel.info;
                return res.status(Constants.HTTP_BAD_REQUEST).json(resModel);
            }

            resModel = await this.surveyModel.createEntity(payload, "election", "survery_master", "sur_id");

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : createSurvey`);
        }
    }


    async updateSurvey(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity }
        let payload;
        try {
            payload = req.body;

            resModel = await this.surveyModel.updateEntity("roles", "users", { id: req.params.id }, payload);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : updateRole`);
        }
    }

    async deleteSurvey(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity }
        try {
            resModel = await this.surveyModel.deleteEntity("election", "survery_master", "sur_id", req.params.id);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : deleteSurvey`);
        }
    }

    async bulkDeleteSurvey(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        try {
            const { ids } = req.body; // Destructure the 'ids' array from the request body

            if (!ids || !Array.isArray(ids)) {
                resModel.status = Constants.ERROR;
                resModel.info = "Invalid payload: 'ids' must be an array.";
                resModel.tat = (new Date().getTime() - startMS) / 1000;
                return res.status(Constants.HTTP_BAD_REQUEST).json(resModel);
            }

            resModel = await this.surveyModel.bulkDelete("election", "survery_master", "sur_id", ids);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : bulkDeleteSurvey`);
            // Ensure response is sent even in catch block
            res.status(Constants.HTTP_INTERNAL_SERVER_ERROR).json(resModel);
        }
    }
}