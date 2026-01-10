import OpenAI from "openai";
import type { CalendarEvent } from "./google-calendar";
import type { TodoistTask } from "./todoist";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Génère un briefing matinal pour Alexa en français.
 * @param events - Les événements du jour.
 * @param tasks - Les tâches à faire.
 * @returns Le briefing matinal.
 */
export async function generateMorningBrief(
  events: CalendarEvent[],
  tasks: TodoistTask[],
): Promise<string> {
  const now = new Date();
  const dateStr = now.toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });

  const eventsText =
    events.length > 0
      ? events
          .map((e) => {
            const startTime = e.start.includes("T")
              ? new Date(e.start).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Europe/Paris",
                })
              : "Journée entière";
            return `- ${e.summary} à ${startTime}${e.location ? ` (${e.location})` : ""}${e.description ? ` - ${e.description}` : ""}`;
          })
          .join("\n")
      : "Aucun événement prévu.";

  const overdueTasks = tasks.filter((t) => t.isOverdue);
  const todayTasks = tasks.filter((t) => !t.isOverdue);

  const formatTask = (t: TodoistTask) => {
    const parts = [`- ${t.content}`];
    if (t.description) parts.push(`(${t.description})`);
    if (t.labels.length > 0) parts.push(`[${t.labels.join(", ")}]`);
    return parts.join(" ");
  };

  const overdueText =
    overdueTasks.length > 0
      ? `Tâches en retard (${overdueTasks.length}):\n${overdueTasks.map(formatTask).join("\n")}`
      : "";

  const todayText =
    todayTasks.length > 0
      ? `Tâches du jour (${todayTasks.length}):\n${todayTasks.map(formatTask).join("\n")}`
      : "Aucune tâche pour aujourd'hui.";

  const tasksText = [overdueText, todayText].filter(Boolean).join("\n\n");

  const instructions = `Tu es un assistant vocal humain, concis et chaleureux. Génère un briefing matinal pour Léo, qui sera lu par Alexa en français.

Règles:
- Sois concis mais ne néglige pas les détails
- Utilise un ton amical et motivant
- Commence par un "Bonjour Léo" avec la date et l'heure
- Mentionne en premier les événements d'aujourd'hui avec leurs horaires
- Si il y a des tâches en retard, mentionne-les en premier
- Liste ensuite les tâches à faire aujourd'hui
- Termine par une phrase encourageante
- Ne mets PAS de caractères spéciaux (émojis, astérisques, etc.), seulement du texte brut
- Le texte sera lu par Alexa, donc pas de formatage markdown`;

  const input = `Date: ${dateStr}

Événements du jour:
${eventsText}

${tasksText}`;

  const response = await client.responses.create({
    model: "gpt-4o-mini",
    instructions,
    input,
  });

  return response.output_text || "Impossible de générer le briefing.";
}
