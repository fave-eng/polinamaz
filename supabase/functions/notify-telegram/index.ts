import { createClient } from "npm:@supabase/supabase-js@2";

const FUNCTION_VERSION = "homework-reports-v1";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-notify-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8"
};

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify({ ...body, functionVersion: FUNCTION_VERSION }), { status, headers: corsHeaders });
}

function safeMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error || "Unknown error");
  return raw.replace(/[A-Za-z0-9_-]{30,}/g, "[hidden]").slice(0, 400);
}

function env(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`Server secret ${name} is not configured`);
  return value;
}

function allowedStudent(studentId: unknown): string {
  const value = String(studentId || "").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9_-]{1,63}$/.test(value)) {
    throw new Error("Unknown student");
  }
  return value;
}

function studentDisplayName(studentId: string): string {
  const names: Record<string, string> = {
    marina: "Марина",
    polina: "Полина",
    polinamaz: "Полина",
    zhenya: "Женя"
  };
  return names[studentId] || studentId;
}

function dateTime(value: string | null | undefined): string {
  const date = value ? new Date(value) : new Date();
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Moscow" }).format(date);
}

async function sendTelegram(
  token: string,
  recipient: { chat_id: number; message_thread_id?: number | null },
  text: string
): Promise<number> {
  const apiBase = "https://api." + "telegram.org";
  const response = await fetch(`${apiBase}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: recipient.chat_id,
      ...(recipient.message_thread_id ? { message_thread_id: recipient.message_thread_id } : {}),
      text,
      disable_web_page_preview: true
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.ok) throw new Error(`Telegram delivery failed (${response.status})`);
  return Number(data.result?.message_id || 0);
}

async function getRecipient(client: ReturnType<typeof createClient>, studentId: string) {
  const { data, error } = await client
    .from("telegram_recipients")
    .select("chat_id,message_thread_id,enabled")
    .eq("student_id", studentId)
    .maybeSingle();
  if (error) throw error;
  if (!data || !data.enabled) throw new Error("Telegram recipient is not configured or disabled");
  return data;
}

async function lessonTitle(lessonId: string): Promise<string> {
  const base = Deno.env.get("SITE_BASE_URL")?.replace(/\/$/, "");
  if (!base) return lessonId;
  try {
    const response = await fetch(`${base}/data/lessons/${encodeURIComponent(lessonId)}.json`, { cache: "no-store" });
    if (!response.ok) return lessonId;
    const lesson = await response.json();
    return String(lesson?.title || lessonId);
  } catch {
    return lessonId;
  }
}

async function homeworkReport(client: ReturnType<typeof createClient>, body: Record<string, unknown>) {
  const studentId = allowedStudent(body.studentId);
  const lessonId = String(body.lessonId || "").trim();
  const submissionId = String(body.submissionId || "").trim();
  if (!lessonId || !submissionId) return json({ ok: false, error: "lessonId and submissionId are required" }, 400);

  const { data: submission, error } = await client
    .from("homework_progress")
    .select("*")
    .eq("student_id", studentId)
    .eq("lesson_id", lessonId)
    .eq("submission_id", submissionId)
    .maybeSingle();
  if (error) throw error;
  if (!submission) return json({ ok: false, error: "Locked submission not found" }, 404);
  if (!["submitted_pending_report", "submitted"].includes(submission.status) || !submission.locked_at || !submission.submitted_at) {
    return json({ ok: false, error: "Homework is not locked for final submission" }, 409);
  }
  if (submission.status === "submitted" && submission.report_status === "sent") {
    return json({ ok: true, alreadySent: true, reportStatus: "sent", reportSentAt: submission.report_sent_at });
  }

  const recipient = await getRecipient(client, studentId);
  const title = await lessonTitle(lessonId);
  const correct = Number(submission.score_correct || 0);
  const total = Number(submission.score_total || 0);
  const percent = Number(submission.score_percent || 0);
  const mistakes = Math.max(0, total - correct);
  const firstCheck = submission.answers?.__meta?.firstCheck;
  const checkCount = Number(submission.answers?.__meta?.checkCount || 0);
  const baseUrl = Deno.env.get("SITE_BASE_URL")?.replace(/\/$/, "");
  const link = baseUrl ? `${baseUrl}/lesson.html?id=${encodeURIComponent(lessonId)}` : null;
  const text = [
    `📝 Домашняя работа: ${title}`,
    `Ученица: ${studentDisplayName(studentId)}`,
    firstCheck ? `Первая проверка: ${Number(firstCheck.correct || 0)} / ${Number(firstCheck.total || 0)}` : null,
    `Финальный результат: ${correct} / ${total} (${percent}%)`,
    `Ошибок: ${mistakes}`,
    checkCount ? `Проверок до отправки: ${checkCount}` : null,
    `Отправлено: ${dateTime(submission.submitted_at)}`,
    link ? `Открыть: ${link}` : null
  ].filter(Boolean).join("\n");

  try {
    await sendTelegram(env("TELEGRAM_BOT_TOKEN"), recipient, text);
    const sentAt = new Date().toISOString();
    const { error: updateError } = await client
      .from("homework_progress")
      .update({
        status: "submitted",
        report_status: "sent",
        report_sent_at: sentAt,
        report_error: null
      })
      .eq("id", submission.id)
      .eq("submission_id", submissionId);
    if (updateError) throw updateError;
    return json({ ok: true, reportStatus: "sent", reportSentAt: sentAt });
  } catch (deliveryError) {
    const message = safeMessage(deliveryError);
    await client.from("homework_progress").update({ report_status: "failed", report_error: message }).eq("id", submission.id);
    return json({ ok: false, reportStatus: "failed", error: message }, 502);
  }
}

async function claimPublication(
  client: ReturnType<typeof createClient>,
  record: {
    student_id: string;
    material_type: string;
    material_id: string;
    notification_version: number;
    payload: Record<string, unknown>;
  }
) {
  const { data: existing, error: lookupError } = await client
    .from("material_publications")
    .select("*")
    .eq("student_id", record.student_id)
    .eq("material_type", record.material_type)
    .eq("material_id", record.material_id)
    .eq("notification_version", record.notification_version)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing?.status === "sent") return { existing, alreadySent: true };
  if (existing) {
    const { data, error } = await client.from("material_publications").update({ status: "pending", payload: record.payload, error_message: null }).eq("id", existing.id).select().single();
    if (error) throw error;
    return { existing: data, alreadySent: false };
  }
  const { data, error } = await client.from("material_publications").insert({ ...record, status: "pending" }).select().single();
  if (error) {
    if (error.code === "23505") {
      const { data: raced, error: racedError } = await client
        .from("material_publications")
        .select("*")
        .eq("student_id", record.student_id)
        .eq("material_type", record.material_type)
        .eq("material_id", record.material_id)
        .eq("notification_version", record.notification_version)
        .single();
      if (racedError) throw racedError;
      return { existing: raced, alreadySent: raced.status === "sent" };
    }
    throw error;
  }
  return { existing: data, alreadySent: false };
}

async function materialPublished(client: ReturnType<typeof createClient>, request: Request, body: Record<string, unknown>) {
  const expected = env("NOTIFY_WEBHOOK_SECRET");
  const provided = request.headers.get("x-notify-secret") || "";
  if (provided !== expected) return json({ ok: false, error: "Invalid publication secret" }, 401);
  const studentId = allowedStudent(body.studentId);
  const materialType = String(body.materialType || "").trim();
  const materialId = String(body.materialId || "").trim();
  const notificationVersion = Number(body.notificationVersion || 1);
  const payload = body.payload && typeof body.payload === "object" && !Array.isArray(body.payload) ? body.payload as Record<string, unknown> : {};
  if (!materialType || !materialId || !Number.isInteger(notificationVersion) || notificationVersion < 1) {
    return json({ ok: false, error: "Invalid material publication payload" }, 400);
  }

  const claim = await claimPublication(client, {
    student_id: studentId,
    material_type: materialType,
    material_id: materialId,
    notification_version: notificationVersion,
    payload
  });
  if (claim.alreadySent) return json({ ok: true, alreadySent: true, status: "sent" });

  try {
    const recipient = await getRecipient(client, studentId);
    const title = String(payload.title || materialId);
    const typeLabel = materialType === "homework" ? "Новая домашняя работа" : materialType === "grammar" ? "Новая тема по грамматике" : "Новый материал";
    const text = [`✨ ${typeLabel}`, `Ученица: ${studentDisplayName(studentId)}`, `Материал: ${title}`, payload.subtitle ? String(payload.subtitle) : null, payload.url ? `Открыть: ${String(payload.url)}` : null].filter(Boolean).join("\n");
    const messageId = await sendTelegram(env("TELEGRAM_BOT_TOKEN"), recipient, text);
    const sentAt = new Date().toISOString();
    const { error } = await client.from("material_publications").update({ status: "sent", telegram_message_id: messageId || null, sent_at: sentAt, error_message: null }).eq("id", claim.existing.id);
    if (error) throw error;
    return json({ ok: true, status: "sent", sentAt });
  } catch (error) {
    const message = safeMessage(error);
    await client.from("material_publications").update({ status: "failed", error_message: message }).eq("id", claim.existing.id);
    return json({ ok: false, status: "failed", error: message }, 502);
  }
}

async function diagnostic(client: ReturnType<typeof createClient>, body: Record<string, unknown>) {
  const studentId = allowedStudent(body.studentId);
  const now = new Date();
  const version = Number(`${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}`);
  const claim = await claimPublication(client, {
    student_id: studentId,
    material_type: "diagnostic",
    material_id: "telegram-report-test",
    notification_version: version,
    payload: { requestedAt: String(body.requestedAt || ""), serverTime: now.toISOString() }
  });
  if (claim.alreadySent) return json({ ok: true, diagnostic: true, alreadySent: true, serverTime: now.toISOString() });
  try {
    const recipient = await getRecipient(client, studentId);
    const text = `🧪 English Space: тест Telegram-отчёта\nУченица: ${studentDisplayName(studentId)}\nФункция: ${FUNCTION_VERSION}\nВремя: ${dateTime(now.toISOString())}`;
    const messageId = await sendTelegram(env("TELEGRAM_BOT_TOKEN"), recipient, text);
    const sentAt = new Date().toISOString();
    await client.from("material_publications").update({ status: "sent", telegram_message_id: messageId || null, sent_at: sentAt, error_message: null }).eq("id", claim.existing.id);
    return json({ ok: true, diagnostic: true, serverTime: now.toISOString(), sentAt });
  } catch (error) {
    const message = safeMessage(error);
    await client.from("material_publications").update({ status: "failed", error_message: message }).eq("id", claim.existing.id);
    return json({ ok: false, diagnostic: true, serverTime: now.toISOString(), error: message }, 502);
  }
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ ok: false, error: "POST required" }, 405);

  try {
    const body = await request.json() as Record<string, unknown>;
    const action = String(body.action || "");
    const client = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));
    if (action === "homework_report") return await homeworkReport(client, body);
    if (action === "material_published") return await materialPublished(client, request, body);
    if (action === "diagnostic") return await diagnostic(client, body);
    return json({ ok: false, error: "Unknown action" }, 400);
  } catch (error) {
    return json({ ok: false, error: safeMessage(error) }, 500);
  }
});
