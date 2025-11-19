"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Routes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/v1/api/auth.controller");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const users_controller_1 = require("../controllers/v1/api/users.controller");
const emoji_controller_1 = require("../controllers/v1/api/emoji.controller");
const election_controller_1 = require("../controllers/v1/api/election.controller");
const question_controller_1 = require("../controllers/v1/api/question.controller");
const party_controller_1 = require("../controllers/v1/api/party.controller");
const loksabha_controller_1 = require("../controllers/v1/api/loksabha.controller");
const vidhan_controller_1 = require("../controllers/v1/api/vidhan.controller");
const zone_controller_1 = require("../controllers/v1/api/zone.controller");
const candidate_controller_1 = require("../controllers/v1/api/candidate.controller");
const survey_controller_1 = require("../controllers/v1/api/survey.controller");
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype ===
        "application/pdf") {
        cb(null, true);
    }
    else {
        cb(new Error("Invalid file type. Please upload an Pdf file."), false);
    }
};
const upload = (0, multer_1.default)({ storage, fileFilter });
class Routes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        // middlewares
        // controllers
        const authController = new auth_controller_1.AuthController();
        const usersController = new users_controller_1.UsersController();
        const emojiController = new emoji_controller_1.EmojiController();
        const electionsController = new election_controller_1.ElectionsController();
        const questionsController = new question_controller_1.QuestionsController();
        const partyController = new party_controller_1.PartyController();
        const loksabhaController = new loksabha_controller_1.LoksabhaController();
        const vidhanController = new vidhan_controller_1.VidhanController();
        const zoneController = new zone_controller_1.ZoneController();
        const candidateController = new candidate_controller_1.CandidateController();
        const surveyController = new survey_controller_1.SurveyController();
        //auth routes
        this.router.get(`/login`, authController.fetchAuth);
        //users routes
        this.router.get(`/users`, usersController.fetchUsers);
        this.router.post(`/add-user`, usersController.createUsers);
        this.router.post(`/user-login`, usersController.loginUser);
        this.router.put(`/user/:id`, usersController.updateUsers);
        this.router.delete(`/user/:id`, usersController.deleteUsers);
        // survey routes
        this.router.get(`/surveys`, surveyController.fetchSurveys);
        this.router.post(`/survey`, surveyController.createSurvey);
        this.router.delete(`/survey/:id`, surveyController.deleteSurvey);
        this.router.delete(`/delete-surveys`, surveyController.bulkDeleteSurvey);
        // this.router.get(`/surveys/export-email`, surveyController.exportAndEmailSurveys);
        // this.router.put(`/user/:id`, usersController.updateUsers);
        //emoji routes
        this.router.get(`/emojis`, emojiController.fetchEmoji);
        this.router.post(`/add-emoji`, emojiController.createEmoji);
        this.router.put(`/emoji/:id`, emojiController.updateEmoji);
        this.router.delete(`/emoji/:id`, emojiController.deleteEmoji);
        //elections routes
        this.router.get(`/elections`, electionsController.fetchElections);
        this.router.post(`/add-election`, electionsController.createElections);
        this.router.put(`/election/:id`, electionsController.updateElections);
        this.router.delete(`/election/:id`, electionsController.deleteElections);
        //questions routes
        this.router.get(`/questions`, questionsController.fetchquestions);
        this.router.post(`/add-question`, questionsController.createquestions);
        this.router.put(`/question/:id`, questionsController.updatequestions);
        this.router.delete(`/question/:id`, questionsController.deletequestions);
        //party routes
        this.router.get(`/parties`, partyController.fetchparty);
        this.router.post(`/add-party`, partyController.createparty);
        this.router.put(`/party/:id`, partyController.updateparty);
        this.router.delete(`/party/:id`, partyController.deleteparty);
        //loksabha routes
        this.router.get(`/loksabhas`, loksabhaController.fetchloksabha);
        this.router.post(`/add-lok`, loksabhaController.createloksabha);
        this.router.put(`/lok/:id`, loksabhaController.updateloksabha);
        this.router.delete(`/lok/:id`, loksabhaController.deleteloksabha);
        //vidhan routes
        this.router.get(`/vidhans`, vidhanController.fetchvidhan);
        this.router.post(`/add-vidhan`, vidhanController.createvidhan);
        this.router.put(`/vidhan/:id`, vidhanController.updatevidhan);
        this.router.delete(`/vidhan/:id`, vidhanController.deletevidhan);
        //zone routes
        this.router.get(`/zones`, zoneController.fetchzone);
        this.router.post(`/add-zone`, zoneController.createzone);
        this.router.put(`/zone/:id`, zoneController.updatezone);
        this.router.delete(`/zone/:id`, zoneController.deletezone);
        this.router.post(`/zone/assignments`, zoneController.createAssignments);
        //candidate routes
        this.router.get(`/candidates`, candidateController.fetchcandidate);
        this.router.post(`/add-candidate`, candidateController.createcandidate);
        this.router.put(`/candidate/:id`, candidateController.updatecandidate);
        this.router.delete(`/candidate/:id`, candidateController.deletecandidate);
    }
}
exports.Routes = Routes;
