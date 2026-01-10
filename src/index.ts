import Fastify from "fastify";
import { RequestEnvelope } from "ask-sdk-model";
import { skill } from "./alexa/skill";

const fastify = Fastify({ logger: true });

// Ajouter le support du content-type Alexa
fastify.addContentTypeParser(
  "application/json",
  { parseAs: "string" },
  (req, body, done) => {
    try {
      const json = JSON.parse(body as string);
      done(null, json);
    } catch (err) {
      done(err as Error, undefined);
    }
  }
);

fastify.post("/alexa", async (request, reply) => {
  try {
    const requestEnvelope = request.body as RequestEnvelope;

    if (!requestEnvelope || !requestEnvelope.request) {
      fastify.log.error("Invalid request: missing body or request field");
      return reply.status(400).send({
        version: "1.0",
        response: {
          outputSpeech: {
            type: "PlainText",
            text: "Requête invalide.",
          },
          shouldEndSession: true,
        },
      });
    }

    const response = await skill.invoke(requestEnvelope);
    reply.type("application/json").send(response);
  } catch (error) {
    fastify.log.error(error);
    reply.status(500).send({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "Désolé, une erreur s'est produite.",
        },
        shouldEndSession: true,
      },
    });
  }
});

fastify.get("/health", async () => {
  return { status: "ok" };
});

const port = parseInt(process.env.PORT || "3000", 10);

fastify.listen({ port, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
