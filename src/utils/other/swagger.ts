import swaggerAutogen from "swagger-autogen";
import * as path from "node:path";

import { globSync } from "fs";
import { join, resolve } from "node:path";

const outputFile = path.join(__dirname, "..", "..", "..", "swagger.json");
const endpointsFiles = globSync(
  join(resolve() as string, "dist/module/*/controller/*.js"),
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
      name: "Users",
      description: "Модуль пользователей",
    },
  ],
  definitions: {
    Message: {
      message: "Сообщение",
    },
    VerifyUser: {
      email: "test_temail@mail.ru",
    },
    AuthUserData: {
      email: "test@mail.ru",
      password: "test_user_password",
    },
    User: {
      id: "1",
      email: "test@mail.ru",
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
      title: "Заголовок новости",
      description: "Описание новости",
      type: {
        default: "GENERAL",
        "@enum": [
          "GENERAL",
          "MED",
          "SOCIAL",
          "EVENTS",
          "CONFERENCE",
          "PERSONAL",
        ],
      },
    },
    ClearList: {
      list: [],
      total: 0,
    },
    NewsList: {
      list: [
        {
          title: "Заголовок новости",
          description: "Описание новости",
          type: {
            default: "GENERAL",
            "@enum": [
              "GENERAL",
              "MED",
              "SOCIAL",
              "EVENTS",
              "CONFERENCE",
              "PERSONAL",
            ],
          },
          createdAt: "24-12-2025",
          updatedAt: "24-12-2025",
        },
      ],
      total: 1,
    },
    NewsFilters: {
      title: "Заголовок поиска",
      description: "Описание поиска",
      type: {
        default: "GENERAL",
        "@enum": [
          "GENERAL",
          "MED",
          "SOCIAL",
          "EVENTS",
          "CONFERENCE",
          "PERSONAL",
        ],
      },
      createdAt: "24-12-2025",
      updatedAt: "24-12-2025",
    },
    ClinicList: {
      list: [
        {
          name: 'Тип услуги',
          icon: '/путь/к изображению'
        }
      ],
      total: 1
    },
    Consult: {
      username: 'Андрей Голубцов',
      сomplaints: 'Колики в животике',
      phone: '8 988 982 23 23'
    },
    ConsultList: {
      list: [
        {
          username: 'Андрей Голубцов',
          сomplaints: 'Колики в животике',
          phone: '8 988 982 23 23'
        }
      ],
      total: 1
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
