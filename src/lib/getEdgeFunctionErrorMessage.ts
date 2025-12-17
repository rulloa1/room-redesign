import { FunctionsHttpError } from "@supabase/supabase-js";

export async function getEdgeFunctionErrorMessage(
  error: unknown,
  response?: Response
): Promise<{ message: string; status?: number }> {
  // Supabase functions.invoke throws FunctionsHttpError for non-2xx.
  if (error instanceof FunctionsHttpError && response) {
    const status = response.status;

    try {
      const contentType = response.headers.get("Content-Type") ?? "";

      if (contentType.includes("application/json")) {
        const body = await response.json().catch(() => null);
        const message =
          body && typeof body === "object" && typeof (body as any).error === "string"
            ? (body as any).error
            : `Request failed (${status})`;
        return { message, status };
      }

      const text = await response.text().catch(() => "");
      return { message: text || `Request failed (${status})`, status };
    } catch {
      return { message: `Request failed (${status})`, status };
    }
  }

  if (error instanceof Error) return { message: error.message };
  return { message: "Request failed" };
}
