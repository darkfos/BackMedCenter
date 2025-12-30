import express from "express";
import swaggerUI from "swagger-ui-express";
import { join, resolve } from "node:path";

import { apiConfig } from "@/conf/apiConfig.js";
import { dbSource } from "@/db/data-source.js";
import { postAuthMiddleware } from "@/utils";

import { authRouter } from "@/module/auth";
import { newsController } from "@/module/news";
import { userRouter } from "@/module/users";
import { pacientsRouter } from "@/module/pacients";
import { analysRouter } from "@/module/analysis";

const app = express();

app.use(express.json());
app.use(
  "/api-docs",
  swaggerUI.serve,
  swaggerUI.setup(require(join(resolve(), "swagger.json"))),
);

// Router's
app.use("/auth", authRouter);
app.use('/news', newsController.router);
app.use('/users', userRouter);
app.use('/analys', analysRouter);
app.use('/pacients', pacientsRouter);

// Post middlewarees
app.use(postAuthMiddleware);

dbSource.initialize().then(() => {
}).finally(() => {
  app.listen(apiConfig.port, () => {
    console.log(`Listening on port: ${apiConfig.port}`);
  });
});
