import { createClient } from "npm:@supabase/supabase-js@2";

const FUNCTION_VERSION = "homework-reports-v7-polinamaz-bot-token";
const DIAGNOSTIC_VERSION = "polina-diagnostics-v1";
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

function envAny(names: string[]): string {
  for (const name of names) {
    const value = Deno.env.get(name)?.trim();
    if (value) return value;
  }
  throw new Error(`Server secret ${names[0]} is not configured`);
}

function telegramBotToken(studentId: string): string {
  if (studentId === "polinamaz") return env("POLINAMAZ_TELEGRAM_BOT_TOKEN");
  return env("TELEGRAM_BOT_TOKEN");
}

function allowedStudent(studentId: unknown): string {
  const value = String(studentId || "").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9_-]{1,63}$/.test(value)) {
    throw new Error("Unknown student");
  }
  const configured = [
    Deno.env.get("ALLOWED_STUDENT_ID") || "",
    Deno.env.get("ALLOWED_STUDENT_IDS") || ""
  ]
    .join(",")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const allowed = new Set(["polinamaz", ...configured]);
  if (!allowed.has(value)) throw new Error("Unknown student");
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

function studentEnglishName(studentId: string): string {
  const names: Record<string, string> = {
    marina: "Marina",
    polina: "Polina",
    polinamaz: "Polina",
    zhenya: "Zhenya"
  };
  const fallback = studentId.charAt(0).toUpperCase() + studentId.slice(1);
  return names[studentId] || fallback;
}

function grammarButtonTitle(item: Record<string, unknown>, index: number): string {
  const fullTitle = String(item.title || `Grammar ${index + 1}`).trim();
  const shortTitle = fullTitle.split(":")[0].trim();
  return shortTitle.length > 0 && shortTitle.length <= 34
    ? shortTitle
    : `Grammar ${index + 1}`;
}

function dateTime(value: string | null | undefined): string {
  const date = value ? new Date(value) : new Date();
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Moscow" }).format(date);
}

async function sendTelegram(
  token: string,
  recipient: { chat_id: number; message_thread_id?: number | null },
  text: string,
  keyboard: Array<Array<{ text: string; url: string }>> = []
): Promise<number> {
  const apiBase = "https://api." + "telegram.org";
  const response = await fetch(`${apiBase}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: recipient.chat_id,
      ...(recipient.message_thread_id ? { message_thread_id: recipient.message_thread_id } : {}),
      text,
      ...(keyboard.length ? { reply_markup: { inline_keyboard: keyboard } } : {}),
      link_preview_options: { is_disabled: true }
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.ok) {
    const description = typeof data?.description === "string" ? data.description : "Unknown Telegram error";
    throw new Error(`Telegram delivery failed (${response.status}): ${description}`);
  }
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

function probeLessonId(value: unknown): string {
  const lessonId = String(value || "").trim();
  if (!/^__diagnostic_probe__[a-zA-Z0-9_-]+$/.test(lessonId)) {
    throw new Error("Invalid diagnostic probe lessonId");
  }
  return lessonId;
}

function homeworkRowIsSuspicious(row: Record<string, unknown>): boolean {
  const status = String(row.status || "");
  const reportStatus = String(row.report_status || "");
  if (status === "submitted") return !row.submitted_at || !row.locked_at || reportStatus !== "sent" || !row.report_sent_at;
  if (status === "draft") return Boolean(row.submitted_at || row.locked_at || reportStatus !== "not_sent" || row.report_sent_at);
  if (status === "submitted_pending_report") return !row.submitted_at || !row.locked_at || !["pending", "failed"].includes(reportStatus);
  return true;
}

async function telegramApi(token: string, method: string, payload: Record<string, unknown>) {
  const apiBase = "https://api." + "telegram.org";
  const response = await fetch(`${apiBase}/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.ok) {
    const description = typeof data?.description === "string" ? data.description : "Unknown Telegram error";
    throw new Error(`Telegram ${method} failed (${response.status}): ${description}`);
  }
  return data.result;
}

async function diagnosticRecipient(client: ReturnType<typeof createClient>, studentId: string) {
  const { data, error } = await client
    .from("telegram_recipients")
    .select("chat_id,message_thread_id,enabled")
    .eq("student_id", studentId)
    .maybeSingle();
  if (error) return { ok: false, error: safeMessage(error) };
  if (!data) return { ok: false, error: "Telegram recipient is not configured" };
  if (!data.enabled) return { ok: false, enabled: false, source: "telegram_recipients", threadId: data.message_thread_id ?? null, error: "Telegram recipient is disabled" };
  return { ok: true, enabled: true, source: "telegram_recipients", threadId: data.message_thread_id ?? null, chatId: data.chat_id };
}

async function diagnosticsHealth(client: ReturnType<typeof createClient>, body: Record<string, unknown>) {
  const studentId = allowedStudent(body.studentId);
  const database: Record<string, unknown> = { ok: false, homeworkRows: 0, suspiciousHomework: [], removedProbes: 0 };

  const { data: homeworkRows, error: homeworkError, count } = await client
    .from("homework_progress")
    .select("lesson_id,status,submitted_at,locked_at,report_status,report_sent_at", { count: "exact" })
    .eq("student_id", studentId)
    .limit(100);
  if (homeworkError) {
    database.error = safeMessage(homeworkError);
  } else {
    const rows = Array.isArray(homeworkRows) ? homeworkRows : [];
    database.ok = true;
    database.homeworkRows = count ?? rows.length;
    database.suspiciousHomework = rows
      .filter((row: Record<string, unknown>) => !String(row.lesson_id || "").startsWith("__diagnostic_probe__") && homeworkRowIsSuspicious(row))
      .map((row: Record<string, unknown>) => row.lesson_id);
  }

  const { data: removed, error: removeError } = await client
    .from("homework_progress")
    .delete()
    .eq("student_id", studentId)
    .like("lesson_id", "__diagnostic_probe__%")
    .select("lesson_id");
  if (!removeError) database.removedProbes = Array.isArray(removed) ? removed.length : 0;

  const recipient = await diagnosticRecipient(client, studentId);
  const telegram: Record<string, unknown> = { bot: { ok: false }, chat: { ok: false } };
  try {
    const token = telegramBotToken(studentId);
    const bot = await telegramApi(token, "getMe", {});
    telegram.bot = { ok: true, username: bot?.username || null };
  } catch (error) {
    telegram.bot = { ok: false, error: safeMessage(error) };
  }
  if (recipient.ok && "chatId" in recipient) {
    try {
      const chat = await telegramApi(token, "getChat", { chat_id: recipient.chatId });
      telegram.chat = { ok: true, type: chat?.type || null, title: chat?.title || null };
    } catch (error) {
      telegram.chat = { ok: false, error: safeMessage(error) };
    }
  } else {
    telegram.chat = { ok: false, error: "Telegram recipient is not configured" };
  }

  const { chatId, ...safeRecipient } = recipient as Record<string, unknown>;
  return json({ ok: true, diagnostic: true, diagnosticVersion: DIAGNOSTIC_VERSION, database, recipient: safeRecipient, telegram });
}

async function diagnosticsHomeworkProbe(client: ReturnType<typeof createClient>, body: Record<string, unknown>) {
  const studentId = allowedStudent(body.studentId);
  const lessonId = probeLessonId(body.lessonId);
  const stages: string[] = [];

  const { data: existing, error: lookupError } = await client
    .from("homework_progress")
    .select("id,status")
    .eq("student_id", studentId)
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (!existing) return json({ ok: false, diagnosticVersion: DIAGNOSTIC_VERSION, error: "Diagnostic draft row was not found" }, 404);
  stages.push(`browser_insert:${existing.status}`);

  const submittedAt = new Date().toISOString();
  const { error: pendingError } = await client
    .from("homework_progress")
    .update({
      status: "submitted_pending_report",
      answers: { __diagnostic: true },
      score_correct: 1,
      score_total: 1,
      score_percent: 100,
      checked_at: submittedAt,
      submitted_at: submittedAt,
      locked_at: submittedAt,
      report_status: "pending",
      report_sent_at: null,
      report_error: null
    })
    .eq("student_id", studentId)
    .eq("lesson_id", lessonId);
  if (pendingError) throw pendingError;
  stages.push("server_update:submitted_pending_report");

  const sentAt = new Date().toISOString();
  const { error: sentError } = await client
    .from("homework_progress")
    .update({
      status: "submitted",
      report_status: "sent",
      report_sent_at: sentAt,
      report_error: null
    })
    .eq("student_id", studentId)
    .eq("lesson_id", lessonId);
  if (sentError) throw sentError;
  stages.push("server_update:submitted");

  const { error: deleteError } = await client
    .from("homework_progress")
    .delete()
    .eq("student_id", studentId)
    .eq("lesson_id", lessonId);
  if (deleteError) throw deleteError;
  stages.push("cleanup:deleted");

  return json({ ok: true, diagnostic: true, diagnosticVersion: DIAGNOSTIC_VERSION, stages });
}

async function diagnosticsCleanupProbe(client: ReturnType<typeof createClient>, body: Record<string, unknown>) {
  const studentId = allowedStudent(body.studentId);
  const lessonId = probeLessonId(body.lessonId);
  const { error } = await client.from("homework_progress").delete().eq("student_id", studentId).eq("lesson_id", lessonId);
  if (error) throw error;
  return json({ ok: true, diagnostic: true, diagnosticVersion: DIAGNOSTIC_VERSION });
}

async function diagnosticsSendReport(client: ReturnType<typeof createClient>, body: Record<string, unknown>) {
  const studentId = allowedStudent(body.studentId);
  const now = Date.now();
  const windowSeconds = 30;
  const notificationVersion = Math.floor(now / (windowSeconds * 1000));
  const retryAfterSeconds = windowSeconds - Math.floor((now / 1000) % windowSeconds);
  const claim = await claimPublication(client, {
    student_id: studentId,
    material_type: "diagnostic",
    material_id: "diagnostics-send-report",
    notification_version: notificationVersion,
    payload: { pageUrl: String(body.pageUrl || ""), requestedAt: new Date(now).toISOString() }
  });
  if (claim.alreadySent) {
    return json({ ok: true, diagnostic: true, diagnosticVersion: DIAGNOSTIC_VERSION, skipped: true, retryAfterSeconds });
  }

  try {
    const recipient = await getRecipient(client, studentId);
    const text = `🧪 English Space: тестовый Telegram-отчёт\nУченица: ${studentDisplayName(studentId)}\nДиагностика: ${DIAGNOSTIC_VERSION}\nВремя: ${dateTime(new Date(now).toISOString())}`;
    const messageId = await sendTelegram(telegramBotToken(studentId), recipient, text);
    const sentAt = new Date().toISOString();
    const { error } = await client
      .from("material_publications")
      .update({ status: "sent", telegram_message_id: messageId || null, sent_at: sentAt, error_message: null })
      .eq("id", claim.existing.id);
    if (error) throw error;
    return json({
      ok: true,
      diagnostic: true,
      diagnosticVersion: DIAGNOSTIC_VERSION,
      telegramMessageId: messageId || null,
      threadId: recipient.message_thread_id ?? null
    });
  } catch (error) {
    const message = safeMessage(error);
    await client.from("material_publications").update({ status: "failed", error_message: message }).eq("id", claim.existing.id);
    return json({ ok: false, diagnostic: true, diagnosticVersion: DIAGNOSTIC_VERSION, error: message }, 502);
  }
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
    await sendTelegram(telegramBotToken(studentId), recipient, text);
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


async function claimLessonPublication(
  client: ReturnType<typeof createClient>,
  record: {
    student_id: string;
    material_type: string;
    material_id: string;
    payload: Record<string, unknown>;
  }
) {
  // A lesson may be uploaded in several commits (homework, vocabulary, grammar),
  // but the student must receive only one final publication message.
  const { data: sentRows, error: sentLookupError } = await client
    .from("material_publications")
    .select("*")
    .eq("student_id", record.student_id)
    .eq("material_type", record.material_type)
    .eq("material_id", record.material_id)
    .eq("status", "sent")
    .order("created_at", { ascending: true })
    .limit(1);
  if (sentLookupError) throw sentLookupError;
  const sent = sentRows?.[0];
  if (sent) return { existing: sent, alreadySent: true };

  const { data: existingRows, error: lookupError } = await client
    .from("material_publications")
    .select("*")
    .eq("student_id", record.student_id)
    .eq("material_type", record.material_type)
    .eq("material_id", record.material_id)
    .order("created_at", { ascending: true })
    .limit(1);
  if (lookupError) throw lookupError;

  const existing = existingRows?.[0];
  if (existing) {
    const { data, error } = await client
      .from("material_publications")
      .update({ status: "pending", payload: record.payload, error_message: null })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return { existing: data, alreadySent: false };
  }

  const { data, error } = await client
    .from("material_publications")
    .insert({ ...record, notification_version: 1, status: "pending" })
    .select()
    .single();
  if (error) {
    if (error.code === "23505") {
      const { data: racedRows, error: racedError } = await client
        .from("material_publications")
        .select("*")
        .eq("student_id", record.student_id)
        .eq("material_type", record.material_type)
        .eq("material_id", record.material_id)
        .order("created_at", { ascending: true })
        .limit(1);
      if (racedError) throw racedError;
      const raced = racedRows?.[0];
      if (!raced) throw error;
      return { existing: raced, alreadySent: raced.status === "sent" };
    }
    throw error;
  }
  return { existing: data, alreadySent: false };
}

function publicHttpUrl(value: unknown): string | null {
  const raw = String(value || "").trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}

async function materialPublished(client: ReturnType<typeof createClient>, request: Request, body: Record<string, unknown>) {
  const expected = env("NOTIFY_WEBHOOK_SECRET");
  const provided = request.headers.get("x-notify-secret") || "";
  if (provided !== expected) return json({ ok: false, error: "Invalid publication secret" }, 401);

  const studentId = allowedStudent(body.studentId);
  const materialType = String(body.materialType || "").trim();
  const materialId = String(body.materialId || "").trim();
  if (!materialType || !materialId) {
    return json({ ok: false, error: "Invalid material publication payload" }, 400);
  }

  const legacyPayload = body.payload && typeof body.payload === "object" && !Array.isArray(body.payload)
    ? body.payload as Record<string, unknown>
    : {};
  const rawHomework = body.homework && typeof body.homework === "object" && !Array.isArray(body.homework)
    ? body.homework as Record<string, unknown>
    : {
        id: materialId,
        title: legacyPayload.title || materialId,
        subtitle: legacyPayload.subtitle || "",
        url: legacyPayload.url || ""
      };
  const homeworkUrl = publicHttpUrl(rawHomework.url);
  if (!homeworkUrl) return json({ ok: false, error: "A valid homework URL is required" }, 400);

  const rawVocabulary = body.vocabulary && typeof body.vocabulary === "object" && !Array.isArray(body.vocabulary)
    ? body.vocabulary as Record<string, unknown>
    : null;
  const vocabularyUrl = rawVocabulary ? publicHttpUrl(rawVocabulary.url) : null;
  if (rawVocabulary && !vocabularyUrl) return json({ ok: false, error: "Invalid vocabulary URL" }, 400);

  const rawGrammar = Array.isArray(body.grammar) ? body.grammar : [];
  const grammar: Record<string, unknown>[] = [];
  for (const item of rawGrammar) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return json({ ok: false, error: "Invalid grammar URL" }, 400);
    }
    const topic = item as Record<string, unknown>;
    const url = publicHttpUrl(topic.url);
    if (!url) return json({ ok: false, error: "Invalid grammar URL" }, 400);
    grammar.push({ ...topic, url });
  }

  const storedPayload = {
    homework: { ...rawHomework, url: homeworkUrl },
    vocabulary: rawVocabulary ? { ...rawVocabulary, url: vocabularyUrl } : null,
    grammar
  };

  const claim = await claimLessonPublication(client, {
    student_id: studentId,
    material_type: materialType,
    material_id: materialId,
    payload: storedPayload
  });
  if (claim.alreadySent) {
    return json({ ok: true, skipped: true, alreadySent: true, reason: "already_sent", status: "sent" });
  }

  try {
    const recipient = await getRecipient(client, studentId);
    const title = String(rawHomework.title || legacyPayload.title || materialId);
    const steps: string[] = [];
    if (rawVocabulary) steps.push("First, learn the new words.");
    if (grammar.length) steps.push(`${steps.length ? "Next" : "First"}, read the grammar.`);
    steps.push(`${steps.length ? "Then" : "Now"}, do the homework.`);

    const text = [
      `Hi, ${studentEnglishName(studentId)}! 👋`,
      "Your new English homework is ready.",
      `📘 ${title}`,
      steps.join("\n"),
      "Good luck! You can do it! 🌟"
    ].join("\n\n");

    const keyboard: Array<Array<{ text: string; url: string }>> = [];
    if (rawVocabulary && vocabularyUrl) {
      keyboard.push([{ text: "📚 Learn new words", url: vocabularyUrl }]);
    }
    grammar.forEach((item, index) => {
      keyboard.push([{
        text: `📖 ${grammarButtonTitle(item, index)}`,
        url: String(item.url)
      }]);
    });
    keyboard.push([{ text: "📝 Do the homework", url: homeworkUrl }]);

    const messageId = await sendTelegram(telegramBotToken(studentId), recipient, text, keyboard);
    const sentAt = new Date().toISOString();
    const { error } = await client
      .from("material_publications")
      .update({ status: "sent", telegram_message_id: messageId || null, sent_at: sentAt, error_message: null })
      .eq("id", claim.existing.id);
    if (error) throw error;
    return json({ ok: true, status: "sent", sentAt, telegramMessageId: messageId || null });
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
    const messageId = await sendTelegram(telegramBotToken(studentId), recipient, text);
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
    const kind = String(body.kind || "");
    const client = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));
    if (kind === "diagnostics_health") return await diagnosticsHealth(client, body);
    if (kind === "diagnostics_homework_probe") return await diagnosticsHomeworkProbe(client, body);
    if (kind === "diagnostics_cleanup_probe") return await diagnosticsCleanupProbe(client, body);
    if (kind === "diagnostics_send_report") return await diagnosticsSendReport(client, body);
    if (action === "homework_report") return await homeworkReport(client, body);
    if (action === "material_published") return await materialPublished(client, request, body);
    if (action === "diagnostic") return await diagnostic(client, body);
    return json({ ok: false, error: "Unknown action" }, 400);
  } catch (error) {
    return json({ ok: false, error: safeMessage(error) }, 500);
  }
});
