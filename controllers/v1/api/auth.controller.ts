import { Request, Response } from "express";
import { Constants } from "../../../utils/constants.util";
import { ResponseEntity } from "../../../entities/core/response.entity";
import MasterController from "../../master.controller";
import { AuthModel } from "../../../models/v1/auth.model";

export class AuthController extends MasterController {

    private AuthModel: AuthModel;

    constructor() {
        super();

        this.AuthModel = new AuthModel();

        // bindings
        this.fetchAuth = this.fetchAuth.bind(this);
        this.createAuth = this.createAuth.bind(this);
        this.updateAuth = this.updateAuth.bind(this);
        this.deleteAuth = this.deleteAuth.bind(this);
    }

    async fetchAuth(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel: { data?: { rows?: any[] }, [key: string]: any } = { ...ResponseEntity };
        let params;
        try {
            params = req.query;
            const data:any = await this.AuthModel.fetch(params);          
            if(data?.data?.rows[0]?.password==params.password || data?.data?.rows[0]?.length>0)
            {
                console.log("authenticated");
                resModel.data = data.data.rows[0];
            }
            else{
                console.log(" not authenticated");
                resModel.status = -9;
                resModel.info = "error: Invalid credentials";
                return res.status(Constants.HTTP_BAD_REQUEST).json(resModel);
            }
         
         
            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);
        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : fetchAuth`);
        }
    }

    async createAuth(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let payload;
        try {
            payload = req.body;

            // make sure required keys exist
            const verifyKeys = this.verifyKeys(req.body, ['name']);
            if (verifyKeys.length !== 0) {
                resModel.status = -9;
                resModel.info = "error: Missing keys: " + verifyKeys + " : " + resModel.info;
                return res.status(Constants.HTTP_BAD_REQUEST).json(resModel);
            }

            // make sure required fields are not empty
            const mandatoryFields = this.mandatoryFields(req.body, ['name']);
            if (mandatoryFields.length !== 0) {
                resModel.status = -9;
                resModel.info = "error: Empty fields: " + mandatoryFields + " : " + resModel.info;
                return res.status(Constants.HTTP_BAD_REQUEST).json(resModel);
            }

            resModel = await this.AuthModel.createEntity(payload, "property", "property_master", "pro_id");

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + JSON.stringify(error) + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : AuthController`);
        }
    }

    async updateAuth(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity };
        let payload;
        try {
            payload = req.body;

            resModel = await this.AuthModel.updateEntity("property", "property_master", { pro_id: req.params.id }, payload);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : updateAuth`);
        }
    }

    async deleteAuth(req: Request, res: Response) {
        const startMS = new Date().getTime();
        let resModel = { ...ResponseEntity }
        try {
            resModel = await this.AuthModel.deleteEntity("property", "property_master", "pro_id", req.params.id);

            resModel.endDT = new Date();
            resModel.tat = (new Date().getTime() - startMS) / 1000;
            res.status(Constants.HTTP_OK).json(resModel);

        } catch (error) {
            resModel.status = -9;
            resModel.info = "catch: " + error + " : " + resModel.info;
            this.logger.error(JSON.stringify(resModel), `${this.constructor.name} : deleteAuth`);
        }
    }
}
