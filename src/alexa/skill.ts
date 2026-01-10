import { SkillBuilders } from "ask-sdk-core";
import {
  LaunchRequestHandler,
  GetMorningBriefIntentHandler,
  HelpIntentHandler,
  CancelAndStopIntentHandler,
  SessionEndedRequestHandler,
  AlexaErrorHandler,
} from "./handlers";

export const skill = SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    GetMorningBriefIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(AlexaErrorHandler)
  .create();
