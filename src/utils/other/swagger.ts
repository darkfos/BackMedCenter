import swaggerAutogen from "swagger-autogen";
import { fileURLToPath } from "node:url";
import * as path from "node:path";
import { glob } from "glob";
import { join, resolve } from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputFile = path.join(__dirname, "..", "..", "..", "..", "swagger.json");
const endpointsFiles = await glob(join(resolve(), 'dist/src/module/*/controller/*.js'));

const doc = {
    info: {
        title: 'MedCenter Back',
        description: 'API for MedCenter'
    },
    tags: [
        {
            name: 'Auth',
            description: 'Модуль авторизации-аутентификации'
        },
        {
            name: "User",
            description: "Модуль пользователей"
        }
    ],
    definitions: {
        AuthReg: {
            message: 'Сообщение'
        },
        RegUserData: {
            email: 'test@mail.ru',
            password: 'test_user_password'
        },
        User: {
            id: '1',
            email: 'test@mail.ru',
            password: 'secret-password',
            fullName: 'user',
            isAdmin: false,
            createdAt: '24-12-2025',
            updatedAt: '24-12-2025',
            userType: {
                default: 'doctor',
                '@enum': ['doctor', 'pacient', 'register', 'manager']
            },
        },
        Users: [
            {
                $ref: '#/definitions/User'
            }
        ],
    },
    host: 'localhost:8088',
    schemes: ['http']
}

swaggerAutogen(/* options */)(outputFile, endpointsFiles, doc).then(() => {
    console.log('Swagger was generated successfully.');
}).catch((err) => {
    console.log("Swagger doesn't generated successfully.");
});