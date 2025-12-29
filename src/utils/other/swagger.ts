import swaggerAutogen from "swagger-autogen";
import { fileURLToPath } from "node:url";
import * as path from "node:path";
import { glob } from "glob";
import { join, resolve } from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputFile = path.join(__dirname, "..", "..", "..", "..", "swagger.json");
const endpointsFiles = await glob(
  join(resolve() as string, "dist/src/module/*/controller/*.js"),
  // @ts-ignore
  () => {},
);

const doc = {
  info: {
    title: "MedCenter Back",
    description: "API for MedCenter",
  },
  tags: [
    {
      name: "Auth",
      description: "Модуль авторизации-аутентификации",
    },
    {
      name: "User",
      description: "Модуль пользователей",
    },
  ],
  definitions: {
    Message: {
      message: "Сообщение",
    },
    VerifyUser: {
      email: 'test_temail@mail.ru'
    },
    AuthUserData: {
      email: "test@mail.ru",
      password: "test_user_password",
    },
    User: {
      id: "1",
      email: "test@mail.ru",
      password: "secret-password",
      fullName: "user",
      isAdmin: false,
      createdAt: "24-12-2025",
      updatedAt: "24-12-2025",
      userType: {
        default: "DOCTOR",
        "@enum": ["DOCTOR", "PACIENT", "REGISTER", "MANAGER"],
      },
    },
    Users: [
      {
        $ref: "#/definitions/User",
      },
    ],
    CreateNews: {
      title: 'Заголовок новости',
      description: 'Описание новости',
      type: {
        default: "GENERAL",
        "@enum": ["GENERAL", "MED", "SOCIAL", "EVENTS", "CONFERENCE", "PERSONAL"]
      }
    }
  },
  host: "localhost:8088",
  schemes: ["http"],
};

swaggerAutogen(/* options */)(outputFile, endpointsFiles, doc)
  .then(() => {
    console.log("Swagger was generated successfully.");
  })
  .catch(() => {
    console.log("Swagger doesn't generated successfully.");
  });
