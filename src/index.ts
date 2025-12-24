import express from "express";
import swaggerUI from "swagger-ui-express";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";

import { apiConfig } from "@/conf/apiConfig.js";
import { dbSource } from "@/db/data-source.js";
import { authRouter } from "@/module/auth/controller/auth.controller.js";

const require = createRequire(import.meta.url);
const app = express();

app.use(express.json());
app.use(
  "/api-docs",
  swaggerUI.serve,
  swaggerUI.setup(require(join(resolve(), "swagger.json"))),
);

// Router's
app.use("/auth", authRouter);

dbSource.initialize().then(() => {
}).finally(() => {
  app.listen(apiConfig.port, () => {
    console.log(`Listening on port: ${apiConfig.port}`);
  });
});
