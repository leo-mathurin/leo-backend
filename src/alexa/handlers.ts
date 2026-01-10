import { ErrorHandler, HandlerInput, RequestHandler } from "ask-sdk-core";
import { Response } from "ask-sdk-model";
import { getTodayEvents } from "../services/google-calendar.ts";
import { getTodayAndOverdueTasks } from "../services/todoist.ts";
import { generateMorningBrief } from "../services/openai.ts";

export const LaunchRequestHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  async handle(handlerInput: HandlerInput): Promise<Response> {
    try {
      const [events, tasks] = await Promise.all([
        getTodayEvents(),
        getTodayAndOverdueTasks(),
      ]);

      const briefing = await generateMorningBrief(events, tasks);

      return handlerInput.responseBuilder
        .speak(briefing)
        .withShouldEndSession(true)
        .getResponse();
    } catch (error) {
      console.error("Error generating morning brief:", error);
      return handlerInput.responseBuilder
        .speak(
          "Désolé, je n'ai pas pu générer ton briefing matinal. Réessaie dans quelques instants.",
        )
        .withShouldEndSession(true)
        .getResponse();
    }
  },
};

export const HelpIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput: HandlerInput): Response {
    const speechText =
      "Cette skill te donne un résumé de tes événements et tâches du jour. " +
      "Lance-la simplement en disant: Alexa, lance mon briefing matinal.";

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

export const CancelAndStopIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      (handlerInput.requestEnvelope.request.intent.name ===
        "AMAZON.CancelIntent" ||
        handlerInput.requestEnvelope.request.intent.name ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput: HandlerInput): Response {
    return handlerInput.responseBuilder
      .speak("À bientôt!")
      .withShouldEndSession(true)
      .getResponse();
  },
};

export const SessionEndedRequestHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput): boolean {
    return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
  },
  handle(handlerInput: HandlerInput): Response {
    console.log(
      `Session ended: ${JSON.stringify(handlerInput.requestEnvelope.request)}`,
    );
    return handlerInput.responseBuilder.getResponse();
  },
};

export const AlexaErrorHandler: ErrorHandler = {
  canHandle(): boolean {
    return true;
  },
  handle(handlerInput: HandlerInput, error: Error): Response {
    console.error(`Error handled: ${error.message}`, error.stack);

    return handlerInput.responseBuilder
      .speak(
        "Désolé, une erreur s'est produite. Réessaie dans quelques instants.",
      )
      .withShouldEndSession(true)
      .getResponse();
  },
};
