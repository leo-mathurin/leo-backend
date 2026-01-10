import { SkillBuilders } from "ask-sdk-core";
import {
  LaunchRequestHandler,
  HelpIntentHandler,
  CancelAndStopIntentHandler,
  SessionEndedRequestHandler,
  AlexaErrorHandler,
} from "./handlers.ts";

export const skill = SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(AlexaErrorHandler)
  .create();
