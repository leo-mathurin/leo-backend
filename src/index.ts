import Fastify from "fastify";
import { RequestEnvelope } from "ask-sdk-model";
import { skill } from "./alexa/skill.ts";

const fastify = Fastify({ logger: true });

fastify.post("/alexa", async (request, reply) => {
  try {
    const requestEnvelope = request.body as RequestEnvelope;
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
