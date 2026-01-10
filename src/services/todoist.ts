import { TodoistApi } from "@doist/todoist-api-typescript";

export interface TodoistTask {
  content: string;
  description?: string;
  labels: string[];
  due?: {
    date: string;
    isRecurring: boolean;
    string?: string;
  };
  isOverdue: boolean;
  url: string;
}

export async function getTodayAndOverdueTasks(): Promise<TodoistTask[]> {
  const apiToken = process.env.TODOIST_API_TOKEN;
  if (!apiToken) {
    throw new Error("TODOIST_API_TOKEN is not defined");
  }

  const api = new TodoistApi(apiToken);

  const tasks = await api.getTasks({
    filter: "today | overdue",
  });

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  return tasks.map((task) => ({
    content: task.content,
    description: task.description || undefined,
    labels: task.labels,
    due: task.due
      ? {
          date: task.due.date,
          isRecurring: task.due.isRecurring,
          string: task.due.string,
        }
      : undefined,
    isOverdue: task.due ? task.due.date < todayStr : false,
    url: task.url,
  }));
}
