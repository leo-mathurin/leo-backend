import { google, calendar_v3 } from "googleapis";

export interface CalendarEvent {
  summary: string;
  start: string;
  description?: string;
  end: string;
  location?: string;
}

export async function getTodayEvents(): Promise<CalendarEvent[]> {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
  });

  const calendar = google.calendar({ version: "v3", auth });

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
  );

  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

  const response = await calendar.events.list({
    calendarId,
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  const events = response.data.items || [];

  return events.map((event: calendar_v3.Schema$Event) => ({
    summary: event.summary || "Sans titre",
    start: event.start?.dateTime || event.start?.date || "",
    description: event.description ?? undefined,
    end: event.end?.dateTime || event.end?.date || "",
    location: event.location ?? undefined,
  }));
}
