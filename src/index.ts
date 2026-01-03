import express from "express";
import swaggerUI from "swagger-ui-express";
import { join, resolve } from "node:path";

import { apiConfig } from "@/conf/apiConfig.js";
import { dbSource } from "@/db/data-source.js";
import { postAuthMiddleware } from "@/utils";

import { authController } from "@/module/auth";
import { newsController } from "@/module/news";
import { userController } from "@/module/users";
import { pacientsController } from "@/module/pacients";
import { analysisController } from "@/module/analysis";

const app = express();

app.use(express.json());
app.use(
  "/api-docs",
  swaggerUI.serve,
  swaggerUI.setup(require(join(resolve(), "swagger.json"))),
);
app.use("/static", express.static(join(__dirname, 'public')));

// Router's
app.use("/auth", authController.router);
app.use("/news", newsController.router);
app.use("/users", userController.router);
app.use("/analys", analysisController.router);
app.use("/pacients", pacientsController.router);

// Post middlewarees
app.use(postAuthMiddleware);

dbSource
  .initialize()
  .then(() => {})
  .finally(() => {
    app.listen(apiConfig.port, () => {
      console.log(`Listening on port: ${apiConfig.port}`);
    });
  });
