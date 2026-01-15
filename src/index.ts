import Fastify from "fastify";
import { RequestEnvelope } from "ask-sdk-model";
import { skill } from "./alexa/skill";
import { getTodayEvents } from "./services/google-calendar";
import { getTodayAndOverdueTasks } from "./services/todoist";
import { generateMorningBrief } from "./services/openai";

const fastify = Fastify({ logger: true });

const API_KEY = process.env.API_KEY;
const EXEMPT_PATHS = (process.env.API_KEY_EXEMPT_PATHS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Protect all routes via an API key (header `x-api-key`)
fastify.addHook("preHandler", async (request, reply) => {
  if (EXEMPT_PATHS.includes(request.url)) return;

  if (!API_KEY) {
    request.log.error("API_KEY is not set");
    return reply.code(500).send({ error: "Server misconfigured" });
  }

  const xApiKeyHeader = request.headers["x-api-key"];
  const xApiKey = typeof xApiKeyHeader === "string" ? xApiKeyHeader : undefined;

  if (!xApiKey || xApiKey !== API_KEY) {
    return reply.code(401).send({ error: "Unauthorized" });
  }
});

// Add support for the Alexa content-type
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
  },
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

fastify.get("/", async () => {
  return { message: "Hello leo!" };
});

fastify.get("/health", async () => {
  return { status: "ok" };
});

// Endpoint to retrieve only the text of the briefing
fastify.get("/briefing/text", async (request, reply) => {
  try {
    const [events, tasks] = await Promise.all([
      getTodayEvents(),
      getTodayAndOverdueTasks(),
    ]);

    const briefing = await generateMorningBrief(events, tasks);

    reply.type("text/plain; charset=utf-8");
    return briefing;
  } catch (error) {
    fastify.log.error(error);
    reply.type("text/plain; charset=utf-8");
    reply.status(500);
    return "Impossible de générer le briefing.";
  }
});

const port = parseInt(process.env.PORT || "3100", 10);

fastify.listen({ port, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
