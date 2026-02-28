import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Scientific Data Harvester API",
      version: "1.0.0",
      description: "API for collecting and browsing scientific publications"
    }
  },
  apis: ["./src/routes/*.js"]
});
