import { Router } from "express";
import { AuthController } from "../controllers/v1/api/auth.controller";

import multer from "multer";
import path from "path";
import { UsersController } from "../controllers/v1/api/users.controller";
import { EmojiController } from "../controllers/v1/api/emoji.controller";
import { ElectionsController } from "../controllers/v1/api/election.controller";
import { QuestionsController } from "../controllers/v1/api/question.controller";
import { PartyController } from "../controllers/v1/api/party.controller";
import { LoksabhaController } from "../controllers/v1/api/loksabha.controller";
import { VidhanController } from "../controllers/v1/api/vidhan.controller";
import { ZoneController } from "../controllers/v1/api/zone.controller";
import { CandidateController } from "../controllers/v1/api/candidate.controller";


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype ===
    "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Please upload an Pdf file."), false);
  }
};

const upload = multer({ storage, fileFilter });

export class Routes {
  public readonly router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes(): void {

    // middlewares

    // controllers

    const authController = new AuthController();
    const usersController = new UsersController();
    const emojiController = new EmojiController();
    const electionsController = new ElectionsController();
    const questionsController = new QuestionsController();
    const partyController = new PartyController();
    const loksabhaController = new LoksabhaController();
    const vidhanController = new VidhanController();
    const zoneController = new ZoneController();
    const candidateController = new CandidateController();

    //auth routes
    this.router.get(`/login`,authController.fetchAuth);

    //users routes

    this.router.get(`/users`, usersController.fetchUsers);
    this.router.post(`/add-user`, usersController.createUsers);
    this.router.put(`/user/:id`, usersController.updateUsers);
    this.router.delete(`/user/:id`, usersController.deleteUsers);

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

    //candidate routes
    this.router.get(`/candidates`, candidateController.fetchcandidate);
    this.router.post(`/add-candidate`, candidateController.createcandidate);
    this.router.put(`/candidate/:id`, candidateController.updatecandidate);
    this.router.delete(`/candidate/:id`, candidateController.deletecandidate);

   

  }
}