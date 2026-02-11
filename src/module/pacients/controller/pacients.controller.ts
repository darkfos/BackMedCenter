import { Router } from "express";

class PacientsController {
  router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {}
}

export const pacientsController = new PacientsController();
