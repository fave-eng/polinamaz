(() => {
  "use strict";

  const config = window.APP_CONFIG;
  if (!config || !config.student) {
    document.body.innerHTML = '<main class="page"><div class="notice notice-error">config.js is missing or invalid.</div></main>';
    return;
  }

  const STUDENT_ID = config.student.id;
  const APP_VERSION = config.site?.appVersion || "1";
  const FINAL_STATUSES = new Set(["submitted_pending_report", "submitted"]);
  const pageName = document.body.dataset.page || "home";
  const main = document.getElementById("main-content");

  const Utils = {
    escape(value) {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },
    normaliseText(value) {
      return String(value ?? "")
        .toLowerCase()
        .trim()
        .replace(/[’‘`]/g, "'")
        .replace(/[‐‑‒–—]/g, "-")
        .replace(/\s+/g, " ");
    },
    wordKey(word) {
      return this.normaliseText(word.uniqueKey || word.en);
    },
    formatDate(value, includeTime = false) {
      if (!value) return "—";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "—";
      return new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        ...(includeTime ? { timeStyle: "short" } : {})
      }).format(date);
    },
    now() {
      return new Date().toISOString();
    },
    clamp(value, min, max) {
      return Math.min(max, Math.max(min, Number(value) || 0));
    },
    query(name) {
      return new URLSearchParams(window.location.search).get(name);
    },
    asArray(value) {
      return Array.isArray(value) ? value : [];
    },
    stable(value) {
      if (Array.isArray(value)) return [...value].map((item) => this.stable(item)).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
      if (value && typeof value === "object") {
        return Object.keys(value).sort().reduce((acc, key) => {
          acc[key] = this.stable(value[key]);
          return acc;
        }, {});
      }
      return value;
    },
    equal(a, b) {
      return JSON.stringify(this.stable(a)) === JSON.stringify(this.stable(b));
    },
    debounce(fn, wait = 450) {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), wait);
      };
    },
    percent(correct, total) {
      if (!total) return 0;
      return Math.round((correct / total) * 100);
    },
    titleCase(value) {
      const text = String(value || "").replace(/[-_]/g, " ");
      return text.charAt(0).toUpperCase() + text.slice(1);
    }
  };

  const PronunciationService = {
    voices: [],
    refreshVoices() {
      this.voices = window.speechSynthesis?.getVoices?.() || [];
    },
    speak(text) {
      const spokenText = String(text || "").replace(/\s*\/\s*/g, " or ").trim();
      if (!spokenText || !("speechSynthesis" in window)) return false;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(spokenText);
        utterance.lang = "en-GB";
        utterance.rate = 0.85;
        const voice = this.voices.find((item) => item.lang === "en-GB") ||
          this.voices.find((item) => String(item.lang || "").toLowerCase().startsWith("en"));
        if (voice) utterance.voice = voice;
        window.speechSynthesis.speak(utterance);
        return true;
      } catch (error) {
        console.warn("Pronunciation is unavailable", error);
        return false;
      }
    }
  };
  PronunciationService.refreshVoices();
  if ("speechSynthesis" in window) {
    window.speechSynthesis.addEventListener("voiceschanged", () => PronunciationService.refreshVoices());
  }
  window.PronunciationService = PronunciationService;

  const UI = {
    toast(message) {
      const region = document.getElementById("toast-region");
      const item = document.createElement("div");
      item.className = "toast";
      item.textContent = message;
      region.appendChild(item);
      setTimeout(() => item.remove(), 3200);
    },
    sync(message, mode = "neutral") {
      const el = document.getElementById("sync-status");
      if (!el) return;
      el.textContent = message;
      el.className = `sync-status visible ${mode}`;
      clearTimeout(this.syncTimer);
      this.syncTimer = setTimeout(() => el.classList.remove("visible"), 3500);
    },
    loading() {
      main.innerHTML = '<div class="loading-state" role="status" aria-live="polite"><span class="spinner" aria-hidden="true"></span>Loading materials…</div>';
    },
    error(title, message) {
      main.innerHTML = `<div class="page-heading"><p class="eyebrow">Something went wrong</p><h1>${Utils.escape(title)}</h1></div><div class="notice notice-error">${Utils.escape(message)}</div><div class="button-row"><button class="btn btn-primary" id="retry-page">Update materials</button><a class="btn btn-ghost" href="index.html">Back home</a></div>`;
      document.getElementById("retry-page")?.addEventListener("click", () => window.location.reload());
    },
    empty(icon, title, text) {
      return `<div class="empty-state"><div class="empty-icon" aria-hidden="true">${icon}</div><h2>${Utils.escape(title)}</h2><p class="muted">${Utils.escape(text)}</p></div>`;
    }
  };

  const Storage = {
    keys: {
      homework: `english_space_${STUDENT_ID}_homework`,
      vocabulary: `english_space_${STUDENT_ID}_vocabulary`,
      vocabularyTopics: `english_space_${STUDENT_ID}_vocabulary_topics`,
      grammar: `english_space_${STUDENT_ID}_grammar`,
      queue: `english_space_${STUDENT_ID}_sync_queue`
    },
    read(type) {
      try {
        return JSON.parse(localStorage.getItem(this.keys[type]) || "{}");
      } catch {
        return {};
      }
    },
    write(type, value) {
      localStorage.setItem(this.keys[type], JSON.stringify(value));
    },
    get(type, id) {
      return this.read(type)[id] || null;
    },
    set(type, id, value) {
      const all = this.read(type);
      all[id] = value;
      this.write(type, all);
      return value;
    },
    remove(type, id) {
      const all = this.read(type);
      delete all[id];
      this.write(type, all);
    },
    queue(item) {
      const queue = Array.isArray(this.read("queue")) ? this.read("queue") : [];
      const next = queue.filter((entry) => !(entry.type === item.type && entry.id === item.id));
      next.push({ ...item, queued_at: Utils.now() });
      this.write("queue", next);
    }
  };

  const Cloud = {
    client: null,
    enabled: false,
    initialise() {
      const url = String(config.supabase?.url || "").trim();
      const key = String(config.supabase?.anonKey || "").trim();
      const valid = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) && key.length > 20;
      if (valid && window.supabase?.createClient) {
        this.client = window.supabase.createClient(url, key);
        this.enabled = true;
      }
      return this.enabled;
    },
    async one(table, filters) {
      if (!this.enabled) return null;
      let query = this.client.from(table).select("*");
      Object.entries(filters).forEach(([key, value]) => { query = query.eq(key, value); });
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data;
    },
    async many(table, filters = {}) {
      if (!this.enabled) return [];
      let query = this.client.from(table).select("*");
      Object.entries(filters).forEach(([key, value]) => { query = query.eq(key, value); });
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    async upsert(table, row, conflict) {
      if (!this.enabled) return null;
      const { data, error } = await this.client.from(table).upsert(row, { onConflict: conflict }).select().single();
      if (error) throw error;
      return data;
    },
    async remove(table, filters) {
      if (!this.enabled) return;
      let query = this.client.from(table).delete();
      Object.entries(filters).forEach(([key, value]) => { query = query.eq(key, value); });
      const { error } = await query;
      if (error) throw error;
    }
  };
  Cloud.initialise();

  const ProgressService = {
    table(type) {
      const map = {
        homework: config.supabase.tables.homework,
        vocabulary: config.supabase.tables.vocabulary,
        vocabularyTopics: config.supabase.tables.vocabularyTopics,
        grammar: config.supabase.tables.grammar
      };
      return map[type];
    },
    idField(type) {
      return ({ homework: "lesson_id", vocabulary: "word_key", vocabularyTopics: "topic_id", grammar: "topic_id" })[type];
    },
    conflict(type) {
      return ({ homework: "student_id,lesson_id", vocabulary: "student_id,word_key", vocabularyTopics: "student_id,topic_id", grammar: "student_id,topic_id" })[type];
    },
    localType(type) {
      return type;
    },
    mapHomeworkForCloud(record) {
      return {
        student_id: STUDENT_ID,
        lesson_id: record.lesson_id,
        status: record.status || "draft",
        answers: record.answers || {},
        score_correct: record.score_correct ?? null,
        score_total: record.score_total ?? null,
        score_percent: record.score_percent ?? null,
        checked_at: record.checked_at || null,
        submitted_at: record.submitted_at || null,
        locked_at: record.locked_at || null,
        report_status: record.report_status || "not_sent",
        report_sent_at: record.report_sent_at || null,
        report_error: record.report_error || null,
        ...(record.submission_id ? { submission_id: record.submission_id } : {})
      };
    },
    mapForCloud(type, record) {
      if (type === "homework") return this.mapHomeworkForCloud(record);
      if (type === "vocabulary") {
        return {
          student_id: STUDENT_ID,
          word_key: record.word_key,
          status: record.status || "new",
          learned_at: record.learned_at || null
        };
      }
      if (type === "vocabularyTopics") {
        return {
          student_id: STUDENT_ID,
          topic_id: record.topic_id,
          tests: record.tests || []
        };
      }
      return {
        student_id: STUDENT_ID,
        topic_id: record.topic_id,
        passed: Boolean(record.passed),
        attempts: Number(record.attempts || 0),
        best_score: Number(record.best_score || 0),
        passed_at: record.passed_at || null
      };
    },
    merge(local, cloud) {
      if (!local) return cloud;
      if (!cloud) return local;
      const localTime = new Date(local.updated_at || 0).getTime();
      const cloudTime = new Date(cloud.updated_at || 0).getTime();
      return cloudTime >= localTime ? { ...local, ...cloud } : local;
    },
    async load(type, id) {
      const local = Storage.get(this.localType(type), id);
      if (!Cloud.enabled) return local;
      try {
        const cloud = await Cloud.one(this.table(type), { student_id: STUDENT_ID, [this.idField(type)]: id });
        const merged = this.merge(local, cloud);
        if (merged) Storage.set(this.localType(type), id, merged);
        return merged;
      } catch (error) {
        console.warn("Cloud load failed", error);
        UI.sync("Cloud unavailable. Progress is stored on this device.");
        return local;
      }
    },
    async loadAll(type) {
      const local = Storage.read(this.localType(type));
      if (!Cloud.enabled) return Object.values(local);
      try {
        const rows = await Cloud.many(this.table(type), { student_id: STUDENT_ID });
        const result = { ...local };
        rows.forEach((row) => {
          const id = row[this.idField(type)];
          result[id] = this.merge(result[id], row);
        });
        Storage.write(this.localType(type), result);
        return Object.values(result);
      } catch (error) {
        console.warn("Cloud list failed", error);
        return Object.values(local);
      }
    },
    async save(type, id, record, options = {}) {
      const updated = { ...record, student_id: STUDENT_ID, updated_at: Utils.now() };
      Storage.set(this.localType(type), id, updated);
      if (!Cloud.enabled) {
        Storage.queue({ type, id });
        UI.sync("Saved on this device. Cloud connection is not configured.");
        return updated;
      }
      try {
        const row = await Cloud.upsert(this.table(type), this.mapForCloud(type, updated), this.conflict(type));
        const merged = { ...updated, ...row };
        Storage.set(this.localType(type), id, merged);
        if (!options.silent) UI.sync("Progress saved automatically");
        return merged;
      } catch (error) {
        console.warn("Cloud save failed", error);
        Storage.queue({ type, id });
        UI.sync("No cloud connection. Changes are safe on this device.");
        if (options.throwOnError) throw error;
        return updated;
      }
    },
    loadHomeworkProgress(id) { return this.load("homework", id); },
    saveHomeworkProgress(record, options) { return this.save("homework", record.lesson_id, record, options); },
    loadVocabularyProgress(id) { return this.load("vocabulary", id); },
    saveVocabularyProgress(record, options) { return this.save("vocabulary", record.word_key, record, options); },
    loadGrammarProgress(id) { return this.load("grammar", id); },
    saveGrammarProgress(record, options) { return this.save("grammar", record.topic_id, record, options); },
    async syncFromCloud() {
      return Promise.all([this.loadAll("homework"), this.loadAll("vocabulary"), this.loadAll("vocabularyTopics"), this.loadAll("grammar")]);
    },
    async syncToCloud() {
      if (!Cloud.enabled) return false;
      const queue = Array.isArray(Storage.read("queue")) ? Storage.read("queue") : [];
      for (const item of queue) {
        const record = Storage.get(item.type, item.id);
        if (record) await this.save(item.type, item.id, record, { silent: true });
      }
      Storage.write("queue", []);
      return true;
    },
    queueSync(type, id) { Storage.queue({ type, id }); }
  };
  window.ProgressService = ProgressService;

  const DataService = {
    async fetchJSON(path) {
      const separator = path.includes("?") ? "&" : "?";
      const response = await fetch(`${path}${separator}v=${encodeURIComponent(APP_VERSION)}-${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return response.json();
    },
    async lessonIndex() {
      try {
        const data = await this.fetchJSON("data/lessons/index.json");
        return Utils.asArray(data.lessons);
      } catch (error) {
        console.warn("Lesson index unavailable; using sequential fallback", error);
        return this.findSequential("lesson", "data/lessons", 200);
      }
    },
    async grammarIndex() {
      try {
        const data = await this.fetchJSON("data/grammar/index.json");
        return Utils.asArray(data.topics);
      } catch (error) {
        console.warn("Grammar index unavailable; using sequential fallback", error);
        return this.findSequential("grammar", "data/grammar", 200);
      }
    },
    async findSequential(prefix, folder, maximum) {
      const found = [];
      let misses = 0;
      for (let number = 1; number <= maximum && misses < 3; number += 1) {
        try {
          const item = await this.fetchJSON(`${folder}/${prefix}-${number}.json`);
          misses = 0;
          if (item.status !== "draft" && item.id !== `${prefix}-template`) found.push(item);
        } catch {
          misses += 1;
        }
      }
      return found.sort((a, b) => Number(a.number || 0) - Number(b.number || 0));
    },
    lesson(id) { return this.fetchJSON(`data/lessons/${encodeURIComponent(id)}.json`); },
    grammar(id) { return this.fetchJSON(`data/grammar/${encodeURIComponent(id)}.json`); },
    async vocabularyTopics() {
      const lessons = await this.lessonIndex();
      const topics = [];
      for (const entry of lessons) {
        try {
          const lesson = entry.blocks ? entry : await this.lesson(entry.id || entry);
          if (lesson.status === "draft" || !lesson.vocabulary || !Utils.asArray(lesson.vocabulary.words).length) continue;
          const seen = new Set();
          const words = lesson.vocabulary.words.filter((word) => {
            const key = Utils.wordKey(word);
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          topics.push({ ...lesson.vocabulary, lessonId: lesson.id, lessonNumber: lesson.number, words });
        } catch (error) {
          console.warn("Vocabulary topic could not be loaded", entry, error);
        }
      }
      return topics;
    }
  };

  function renderShell() {
    const student = config.student;
    const activeMap = {
      home: "index.html",
      homework: "homework.html",
      lesson: "homework.html",
      grammar: "grammar.html",
      "grammar-topic": "grammar.html",
      "vocabulary-hub": "vocabulary-hub.html",
      vocabulary: "vocabulary-hub.html"
    };
    document.title = `${student.nameEn}’s English Space · ${Utils.titleCase(pageName)}`;
    document.getElementById("site-header").innerHTML = `
      <div class="header-inner">
        <a class="brand" href="index.html" aria-label="Go to home page">
          <span class="brand-mark" aria-hidden="true">ES</span>
          <span class="brand-copy"><span class="brand-title">${Utils.escape(student.nameEn)}’s English Space</span><span class="brand-subtitle">Personal learning dashboard</span></span>
        </a>
        <span class="header-badge">✦ ${Utils.escape(student.level)} · Individual Course</span>
      </div>`;
    const nav = [
      ["index.html", "🏠", "Home"],
      ["homework.html", "📝", "Homework"],
      ["grammar.html", "📐", "Grammar"],
      ["vocabulary-hub.html", "💥", "Vocabulary"]
    ];
    document.getElementById("bottom-nav").innerHTML = nav.map(([href, icon, label]) => `
      <a class="nav-item ${activeMap[pageName] === href ? "active" : ""}" href="${href}" ${activeMap[pageName] === href ? 'aria-current="page"' : ""}>
        <span aria-hidden="true">${icon}</span><span>${label}</span>
      </a>`).join("");
  }

  function statusLabel(progress) {
    if (!progress) return ["Not started", "status-locked"];
    if (progress.status === "draft") return ["Draft saved", "status-draft"];
    if (progress.status === "submitted_pending_report") {
      if (progress.report_status === "failed") return ["Submitted · report failed", "status-error"];
      return ["Submitted · report pending", "status-draft"];
    }
    if (progress.status === "submitted") return ["Sent to teacher", "status-complete"];
    return ["Not started", "status-locked"];
  }

  async function initHome() {
    UI.loading();
    const [lessons, grammarTopics, vocabTopics, homeworkProgress, vocabProgress, grammarProgress] = await Promise.all([
      DataService.lessonIndex(),
      DataService.grammarIndex(),
      DataService.vocabularyTopics(),
      ProgressService.loadAll("homework"),
      ProgressService.loadAll("vocabulary"),
      ProgressService.loadAll("grammar")
    ]);
    const lessonIds = new Set(lessons.map((item) => item.id));
    const grammarIds = new Set(grammarTopics.map((item) => item.id));
    const currentWordKeys = new Set(vocabTopics.flatMap((topic) => topic.words.map((word) => Utils.wordKey(word))));
    const completedHomework = homeworkProgress.filter((item) => lessonIds.has(item.lesson_id) && FINAL_STATUSES.has(item.status)).length;
    const knownWords = vocabProgress.filter((item) => currentWordKeys.has(item.word_key) && item.status === "known").length;
    const passedGrammar = grammarProgress.filter((item) => grammarIds.has(item.topic_id) && item.passed).length;
    const currentLesson = lessons.find((item) => item.status !== "locked") || null;

    main.innerHTML = `
      <section class="hero">
        <span class="badge">✦ ${Utils.escape(config.student.level)} Level · Individual Course</span>
        <h1>${Utils.escape(config.student.nameEn)}’s English Space 🚀</h1>
        <p>Твоё личное пространство для роста в английском</p>
      </section>

      <section class="section" aria-labelledby="progress-title">
        <div class="section-header"><h2 id="progress-title">My progress</h2><span class="section-count">Updates automatically</span></div>
        <div class="grid grid-4">
          <div class="card stat-card"><div class="stat-value">${completedHomework}</div><div class="stat-label">Homework completed</div></div>
          <div class="card stat-card"><div class="stat-value">${knownWords}</div><div class="stat-label">Words learned</div></div>
          <div class="card stat-card"><div class="stat-value">${passedGrammar}</div><div class="stat-label">Grammar topics passed</div></div>
          <div class="card stat-card"><div class="stat-value">${Utils.escape(config.student.level)}</div><div class="stat-label">Current level</div></div>
        </div>
      </section>

      <section class="section" aria-labelledby="quick-title">
        <div class="section-header"><h2 id="quick-title">Quick access</h2></div>
        <div class="grid grid-2">
          <a class="card card-link quick-card" href="homework.html"><span class="quick-icon">📝</span><span><strong>Homework</strong><br><span class="muted small">Continue or review submitted work</span></span></a>
          <a class="card card-link quick-card" href="vocabulary-hub.html"><span class="quick-icon">💥</span><span><strong>Vocabulary</strong><br><span class="muted small">Learn words and complete tests</span></span></a>
          <a class="card card-link quick-card" href="grammar.html"><span class="quick-icon">📐</span><span><strong>Grammar</strong><br><span class="muted small">Clear explanations and practice</span></span></a>
          <a class="card card-link quick-card" href="#textbook"><span class="quick-icon">📚</span><span><strong>Knowledge base</strong><br><span class="muted small">Course materials in one place</span></span></a>
        </div>
      </section>

      <section class="section" aria-labelledby="current-title">
        <div class="section-header"><h2 id="current-title">Current material</h2></div>
        ${currentLesson ? `<a class="card card-link" href="lesson.html?id=${encodeURIComponent(currentLesson.id)}"><div class="card-title-row"><div><p class="eyebrow">Lesson ${Number(currentLesson.number || 0)}</p><h3>${Utils.escape(currentLesson.title)}</h3><p class="muted">${Utils.escape(currentLesson.subtitle || "Open the current task")}</p></div><span aria-hidden="true">→</span></div></a>` : UI.empty("🧭", "No current material yet", "Материалы по учебнику будут добавлены преподавателем.")}
      </section>

      <section class="section" id="textbook" aria-labelledby="book-title">
        <div class="section-header"><h2 id="book-title">Textbook</h2></div>
        <div class="card"><p class="eyebrow">Course source</p><h3>${Utils.escape(config.student.textbook)}</h3><p class="muted">${Utils.escape(config.student.textbookEdition)}</p></div>
      </section>

      <section class="section" aria-labelledby="sync-title">
        <div class="section-header"><h2 id="sync-title">Sync status</h2></div>
        <div class="notice ${Cloud.enabled ? "notice-success" : "notice-warning"}">${Cloud.enabled ? "Progress is saved automatically on this device and in the cloud." : "Supabase is not configured yet. Progress is temporarily stored on this device."}</div>
      </section>`;
  }

  async function initHomework() {
    UI.loading();
    const [lessons, allProgress] = await Promise.all([DataService.lessonIndex(), ProgressService.loadAll("homework")]);
    const progressById = Object.fromEntries(allProgress.map((item) => [item.lesson_id, item]));
    const available = [];
    const completed = [];
    lessons.forEach((lesson) => {
      const progress = progressById[lesson.id];
      const item = { lesson, progress };
      if (progress && FINAL_STATUSES.has(progress.status)) completed.push(item);
      else available.push(item);
    });

    const renderLessonCard = ({ lesson, progress }) => {
      const [label, className] = lesson.status === "locked" ? ["🔒 Coming soon", "status-locked"] : statusLabel(progress);
      const locked = lesson.status === "locked";
      return `<article class="card">
        <div class="card-title-row">
          <div><p class="eyebrow">Lesson ${Number(lesson.number || 0)}</p><h3>${Utils.escape(lesson.title)}</h3></div>
          <span class="status-badge ${className}">${Utils.escape(label)}</span>
        </div>
        <p class="muted">${Utils.escape(lesson.subtitle || "")}</p>
        ${progress && FINAL_STATUSES.has(progress.status) ? `<p class="small"><strong>Result:</strong> ${Number(progress.score_correct || 0)} / ${Number(progress.score_total || 0)} · ${Number(progress.score_percent || 0)}%<br><strong>Submitted:</strong> ${Utils.formatDate(progress.submitted_at, true)}</p>` : ""}
        <div class="button-row">${locked ? '<button class="btn btn-ghost" disabled>Coming soon</button>' : `<a class="btn btn-primary" href="lesson.html?id=${encodeURIComponent(lesson.id)}">${progress && FINAL_STATUSES.has(progress.status) ? "View" : "Open"}</a>`}</div>
      </article>`;
    };

    main.innerHTML = `
      <div class="page-heading"><p class="eyebrow">Coursework</p><h1>Homework</h1><p class="lead">Complete tasks, check your answers, then send the final result once.</p></div>
      ${lessons.length ? `
        <section class="section"><div class="section-header"><h2>Available</h2><span class="section-count">${available.length}</span></div>${available.length ? available.map(renderLessonCard).join("") : UI.empty("✅", "No available tasks", "Все опубликованные задания уже отправлены.")}</section>
        <section class="section"><div class="section-header"><h2>Completed</h2><span class="section-count">${completed.length}</span></div>${completed.length ? completed.map(renderLessonCard).join("") : UI.empty("📭", "Nothing submitted yet", "Completed homework will appear here after final submission.")}</section>` : UI.empty("📝", "Домашних заданий пока нет", "После первого урока преподаватель добавит сюда интерактивное задание.")}`;
  }

  function collectQuestions(blocks) {
    const supported = new Set(["single-choice", "multiple-choice", "true-false", "text-input", "matching", "ordering", "open-answer", "pronunciation"]);
    const questions = [];
    const visit = (items) => Utils.asArray(items).forEach((block) => {
      if (supported.has(block.type)) questions.push(block);
      if (Array.isArray(block.questions)) block.questions.forEach((question) => questions.push({ ...question, parentTitle: block.title, parentInstruction: block.instruction }));
      if (Array.isArray(block.blocks)) visit(block.blocks);
    });
    visit(blocks);
    return questions;
  }

  function questionPoints(question) {
    if (question.type === "open-answer" || question.type === "pronunciation" || question.autoCheck === false) return 0;
    return Number(question.points || 1);
  }

  function answerCorrect(question, answer) {
    const type = question.type;
    if (type === "single-choice" || type === "true-false") return Utils.normaliseText(answer) === Utils.normaliseText(question.correctAnswer);
    if (type === "multiple-choice") return Utils.equal(Utils.asArray(answer).map(Utils.normaliseText), Utils.asArray(question.correctAnswer).map(Utils.normaliseText));
    if (type === "text-input") {
      const accepted = Utils.asArray(question.acceptedAnswers?.length ? question.acceptedAnswers : [question.correctAnswer]);
      return accepted.some((item) => Utils.normaliseText(item) === Utils.normaliseText(answer));
    }
    if (type === "matching") return Utils.equal(answer || {}, question.correctAnswer || {});
    if (type === "ordering") return Utils.equal(Utils.asArray(answer), Utils.asArray(question.correctAnswer));
    return null;
  }

  function calculateLessonResult(questions, answers) {
    const details = {};
    let correct = 0;
    let total = 0;
    questions.forEach((question) => {
      const points = questionPoints(question);
      if (!points) return;
      total += points;
      const isCorrect = answerCorrect(question, answers[question.id]);
      if (isCorrect) correct += points;
      details[question.id] = { correct: Boolean(isCorrect), points, explanation: question.explanation || "" };
    });
    return { correct, total, percent: Utils.percent(correct, total), details };
  }

  function optionValue(option) {
    return typeof option === "object" ? String(option.value ?? option.label ?? "") : String(option);
  }
  function optionLabel(option) {
    return typeof option === "object" ? String(option.label ?? option.value ?? "") : String(option);
  }

  function renderQuestion(question, number, answer, checked, locked) {
    const id = Utils.escape(question.id);
    const result = checked?.[question.id];
    const stateClass = result ? (result.correct ? "is-correct" : "is-incorrect") : "";
    let control = "";
    if (["single-choice", "true-false"].includes(question.type)) {
      const options = question.type === "true-false" ? ["true", "false"] : Utils.asArray(question.options);
      control = `<div class="answer-options">${options.map((option) => {
        const value = optionValue(option);
        return `<label class="option"><input type="radio" name="q-${id}" data-question-id="${id}" value="${Utils.escape(value)}" ${String(answer) === value ? "checked" : ""} ${locked ? "disabled" : ""}><span>${Utils.escape(optionLabel(option))}</span></label>`;
      }).join("")}</div>`;
    } else if (question.type === "multiple-choice") {
      const values = Utils.asArray(answer).map(String);
      control = `<div class="answer-options">${Utils.asArray(question.options).map((option) => {
        const value = optionValue(option);
        return `<label class="option"><input type="checkbox" data-question-id="${id}" value="${Utils.escape(value)}" ${values.includes(value) ? "checked" : ""} ${locked ? "disabled" : ""}><span>${Utils.escape(optionLabel(option))}</span></label>`;
      }).join("")}</div>`;
    } else if (question.type === "text-input") {
      control = `<label><span class="small muted">Your answer</span><input class="text-answer" type="text" data-question-id="${id}" value="${Utils.escape(answer || "")}" ${locked ? "readonly" : ""} autocomplete="off"></label>`;
    } else if (question.type === "open-answer" || question.type === "pronunciation") {
      control = `<label><span class="small muted">${question.type === "pronunciation" ? "Your note or self-assessment" : "Your answer"}</span><textarea class="open-answer" data-question-id="${id}" ${locked ? "readonly" : ""}>${Utils.escape(answer || "")}</textarea></label>`;
    } else if (question.type === "matching") {
      const current = answer && typeof answer === "object" ? answer : {};
      control = `<div class="matching-grid">${Utils.asArray(question.pairs || question.left).map((left) => {
        const leftValue = typeof left === "object" ? String(left.value ?? left.label) : String(left);
        const rightOptions = Utils.asArray(question.options || question.right);
        return `<div class="match-row"><span>${Utils.escape(typeof left === "object" ? left.label : left)}</span><select class="select-answer" data-question-id="${id}" data-match-key="${Utils.escape(leftValue)}" ${locked ? "disabled" : ""}><option value="">Choose…</option>${rightOptions.map((right) => { const value = optionValue(right); return `<option value="${Utils.escape(value)}" ${String(current[leftValue] || "") === value ? "selected" : ""}>${Utils.escape(optionLabel(right))}</option>`; }).join("")}</select></div>`;
      }).join("")}</div>`;
    } else if (question.type === "ordering") {
      const initial = Utils.asArray(answer).length ? Utils.asArray(answer) : Utils.asArray(question.items).map(optionValue);
      control = `<div class="ordering-list" data-order-list="${id}">${initial.map((item, index) => `<div class="order-item" data-order-value="${Utils.escape(item)}"><span>${Utils.escape(optionLabel(Utils.asArray(question.items).find((candidate) => optionValue(candidate) === String(item)) || item))}</span><span class="order-controls"><button type="button" data-order-action="up" aria-label="Move up" ${locked || index === 0 ? "disabled" : ""}>↑</button><button type="button" data-order-action="down" aria-label="Move down" ${locked || index === initial.length - 1 ? "disabled" : ""}>↓</button></span></div>`).join("")}</div>`;
    }
    const resultHtml = result ? `<div class="result-label ${result.correct ? "correct" : "incorrect"}"><span aria-hidden="true">${result.correct ? "✓" : "✕"}</span><span><strong>${result.correct ? "Correct" : "Check this answer"}.</strong>${result.explanation ? ` ${Utils.escape(result.explanation)}` : ""}</span></div>` : "";
    return `<article class="card question-card ${stateClass}" data-question-card="${id}"><div class="question-number">Question ${number}</div><div class="question-text">${Utils.escape(question.question || question.prompt || question.title || "")}</div>${control}${resultHtml}</article>`;
  }

  function renderContentBlock(block) {
    if (block.type === "content") {
      const paragraphs = Utils.asArray(block.paragraphs || block.text).map((item) => `<p>${Utils.escape(item)}</p>`).join("");
      const list = Utils.asArray(block.items).length ? `<ul>${block.items.map((item) => `<li>${Utils.escape(item)}</li>`).join("")}</ul>` : "";
      return `<section class="card exercise-block">${block.title ? `<h2>${Utils.escape(block.title)}</h2>` : ""}${paragraphs}${list}</section>`;
    }
    if (block.type === "image") return `<figure class="exercise-block"><img class="content-image" src="${Utils.escape(block.src)}" alt="${Utils.escape(block.alt || "Lesson image")}">${block.caption ? `<figcaption class="muted small">${Utils.escape(block.caption)}</figcaption>` : ""}</figure>`;
    if (block.type === "audio") return `<section class="card exercise-block"><h2>${Utils.escape(block.title || "Listening")}</h2>${block.instruction ? `<p class="instruction">${Utils.escape(block.instruction)}</p>` : ""}<audio class="media-player" controls preload="metadata" src="${Utils.escape(block.src)}">Your browser cannot play this audio.</audio></section>`;
    return "";
  }

  async function initLesson() {
    UI.loading();
    const lessonId = Utils.query("id");
    if (!lessonId) return UI.error("Lesson not selected", "Open a lesson from the Homework page.");
    let lesson;
    try { lesson = await DataService.lesson(lessonId); } catch (error) { return UI.error("Lesson unavailable", "The lesson file could not be loaded. Check its name and index."); }
    if (lesson.status === "draft") return UI.error("Draft lesson", "This lesson has not been published.");
    let progress = await ProgressService.loadHomeworkProgress(lesson.id) || {
      lesson_id: lesson.id,
      status: "draft",
      answers: {},
      report_status: "not_sent",
      updated_at: Utils.now()
    };
    progress.answers = progress.answers && typeof progress.answers === "object" ? progress.answers : {};
    progress.answers.__meta = progress.answers.__meta || {};
    const questions = collectQuestions(lesson.blocks);
    const render = () => {
      const locked = FINAL_STATUSES.has(progress.status);
      const meta = progress.answers.__meta || {};
      const checked = meta.checkDetails || null;
      let questionNumber = 0;
      const blockHtml = Utils.asArray(lesson.blocks).map((block) => {
        const content = renderContentBlock(block);
        if (content) return content;
        if (Array.isArray(block.questions)) {
          return `<section class="exercise-block">${block.title ? `<h2>${Utils.escape(block.title)}</h2>` : ""}${block.instruction ? `<p class="instruction">${Utils.escape(block.instruction)}</p>` : ""}${block.questions.map((question) => { questionNumber += 1; return renderQuestion({ ...question, parentTitle: block.title }, questionNumber, progress.answers[question.id], checked, locked); }).join("")}</section>`;
        }
        if (["single-choice", "multiple-choice", "true-false", "text-input", "matching", "ordering", "open-answer", "pronunciation"].includes(block.type)) {
          questionNumber += 1;
          return `<section class="exercise-block">${renderQuestion(block, questionNumber, progress.answers[block.id], checked, locked)}</section>`;
        }
        return "";
      }).join("");
      const reportClass = progress.report_status === "failed" ? "notice-error" : "notice-success";
      main.innerHTML = `
        <div class="page-heading"><p class="eyebrow">Lesson ${Number(lesson.number || 0)}</p><h1>${Utils.escape(lesson.title)}</h1><p class="lead">${Utils.escape(lesson.subtitle || "")}</p></div>
        <div class="lesson-meta"><span class="badge">${questions.length} tasks</span>${lesson.publishedAt ? `<span class="badge">Published ${Utils.formatDate(lesson.publishedAt)}</span>` : ""}</div>
        ${locked ? `<div class="notice ${reportClass} locked-banner"><strong>Answers are locked.</strong> Submitted ${Utils.formatDate(progress.submitted_at, true)}. Result: ${Number(progress.score_correct || 0)} / ${Number(progress.score_total || 0)} (${Number(progress.score_percent || 0)}%).${progress.report_status === "failed" ? ` Отчёт не доставлен: ${Utils.escape(progress.report_error || "unknown error")}` : ""}</div>` : '<div class="notice">Your draft is saved automatically. Проверяй ответы до финальной отправки.</div>'}
        ${blockHtml || UI.empty("🧩", "This lesson has no blocks", "Add exercises to the lesson JSON file.")}
        ${questions.length ? `<section class="card score-panel" aria-label="Lesson actions"><div class="card-title-row"><div><div class="small muted">Current result</div><div class="score-number">${progress.score_total != null ? `${Number(progress.score_correct || 0)} / ${Number(progress.score_total || 0)} · ${Number(progress.score_percent || 0)}%` : "Not checked"}</div></div><span class="status-badge ${statusLabel(progress)[1]}">${statusLabel(progress)[0]}</span></div><div class="button-row">${locked ? (progress.report_status === "failed" ? '<button class="btn btn-primary" id="retry-report">Retry report</button>' : '<a class="btn btn-ghost" href="homework.html">Back to homework</a>') : '<button class="btn btn-secondary" id="check-answers">Check answers</button><button class="btn btn-primary" id="submit-homework">Send to teacher</button>'}</div></section>` : ""}`;
      bindLessonEvents();
    };

    const extractAnswer = (element) => {
      const id = element.dataset.questionId;
      const question = questions.find((item) => item.id === id);
      if (!question) return;
      if (question.type === "single-choice" || question.type === "true-false") progress.answers[id] = element.value;
      else if (question.type === "multiple-choice") progress.answers[id] = [...document.querySelectorAll(`input[data-question-id="${CSS.escape(id)}"]:checked`)].map((item) => item.value);
      else if (question.type === "matching") {
        progress.answers[id] = progress.answers[id] && typeof progress.answers[id] === "object" ? progress.answers[id] : {};
        progress.answers[id][element.dataset.matchKey] = element.value;
      } else progress.answers[id] = element.value;
      if (progress.answers.__meta?.checkDetails) {
        const recalculated = calculateLessonResult(questions, progress.answers);
        progress.score_correct = recalculated.correct;
        progress.score_total = recalculated.total;
        progress.score_percent = recalculated.percent;
        progress.answers.__meta.checkDetails = recalculated.details;
      }
      progress.status = "draft";
      saveDraft();
    };

    const saveDraft = Utils.debounce(async () => {
      progress = await ProgressService.saveHomeworkProgress(progress, { silent: true });
      UI.sync("Draft saved automatically");
    }, 500);

    const bindLessonEvents = () => {
      document.querySelectorAll("[data-question-id]").forEach((element) => {
        element.addEventListener(element.tagName === "INPUT" && element.type === "text" ? "input" : "change", () => extractAnswer(element));
      });
      document.querySelectorAll("[data-order-action]").forEach((button) => {
        button.addEventListener("click", () => {
          const item = button.closest(".order-item");
          const list = item.parentElement;
          if (button.dataset.orderAction === "up" && item.previousElementSibling) list.insertBefore(item, item.previousElementSibling);
          if (button.dataset.orderAction === "down" && item.nextElementSibling) list.insertBefore(item.nextElementSibling, item);
          const id = list.dataset.orderList;
          progress.answers[id] = [...list.querySelectorAll(".order-item")].map((node) => node.dataset.orderValue);
          saveDraft();
          render();
        });
      });
      document.getElementById("check-answers")?.addEventListener("click", async () => {
        const result = calculateLessonResult(questions, progress.answers);
        const meta = progress.answers.__meta || {};
        if (!meta.firstCheck) meta.firstCheck = { correct: result.correct, total: result.total, checkedAt: Utils.now() };
        meta.checkCount = Number(meta.checkCount || 0) + 1;
        meta.checkDetails = result.details;
        progress.answers.__meta = meta;
        progress.score_correct = result.correct;
        progress.score_total = result.total;
        progress.score_percent = result.percent;
        progress.checked_at = Utils.now();
        progress = await ProgressService.saveHomeworkProgress(progress);
        render();
        document.querySelector(".score-panel")?.focus?.();
      });
      document.getElementById("submit-homework")?.addEventListener("click", async () => {
        const unanswered = questions.filter((question) => question.required !== false && (progress.answers[question.id] == null || progress.answers[question.id] === "" || (Array.isArray(progress.answers[question.id]) && !progress.answers[question.id].length)));
        if (unanswered.length) {
          UI.toast(`Complete ${unanswered.length} required task${unanswered.length === 1 ? "" : "s"} first.`);
          document.querySelector(`[data-question-card="${CSS.escape(unanswered[0].id)}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
        const accepted = window.confirm("После отправки изменить ответы будет невозможно. Отправить домашнее задание?");
        if (!accepted) return;
        const result = calculateLessonResult(questions, progress.answers);
        progress.score_correct = result.correct;
        progress.score_total = result.total;
        progress.score_percent = result.percent;
        progress.checked_at = Utils.now();
        progress.answers.__meta = { ...(progress.answers.__meta || {}), checkDetails: result.details };
        progress.status = "submitted_pending_report";
        progress.submitted_at = Utils.now();
        progress.locked_at = progress.submitted_at;
        progress.report_status = "pending";
        try {
          progress = await ProgressService.saveHomeworkProgress(progress, { throwOnError: Cloud.enabled });
        } catch (error) {
          progress.status = "draft";
          progress.submitted_at = null;
          progress.locked_at = null;
          progress.report_status = "not_sent";
          Storage.set("homework", lesson.id, progress);
          UI.toast("Final submission was not saved. Please check the connection and try again.");
          return;
        }
        render();
        await sendHomeworkReport();
      });
      document.getElementById("retry-report")?.addEventListener("click", sendHomeworkReport);
    };

    const sendHomeworkReport = async () => {
      if (!Cloud.enabled) {
        progress.report_status = "failed";
        progress.report_error = "Supabase is not configured";
        Storage.set("homework", lesson.id, progress);
        render();
        return;
      }
      try {
        const { data, error } = await Cloud.client.functions.invoke("notify-telegram", {
          body: {
            action: "homework_report",
            studentId: STUDENT_ID,
            lessonId: lesson.id,
            submissionId: progress.submission_id
          }
        });
        if (error) throw error;
        progress.status = data?.reportStatus === "sent" || data?.alreadySent ? "submitted" : progress.status;
        progress.report_status = data?.reportStatus || (data?.alreadySent ? "sent" : "pending");
        progress.report_sent_at = data?.reportSentAt || progress.report_sent_at;
        progress.report_error = null;
        Storage.set("homework", lesson.id, progress);
        progress = await ProgressService.loadHomeworkProgress(lesson.id) || progress;
        UI.toast(data?.alreadySent ? "Report was already delivered." : "Report sent to the teacher.");
      } catch (error) {
        progress.report_status = "failed";
        progress.report_error = "Report delivery failed";
        Storage.set("homework", lesson.id, progress);
        UI.toast("Homework is locked, but the report was not delivered. Retry is available.");
      }
      render();
    };

    render();
  }

  async function initVocabularyHub() {
    UI.loading();
    const [topics, allWordProgress] = await Promise.all([DataService.vocabularyTopics(), ProgressService.loadAll("vocabulary")]);
    const progressMap = Object.fromEntries(allWordProgress.map((item) => [item.word_key, item]));
    main.innerHTML = `<div class="page-heading"><p class="eyebrow">Word practice</p><h1>Vocabulary</h1><p class="lead">Learn lesson words, listen to pronunciation and finish a test to mark words as learned.</p></div>${topics.length ? topics.map((topic) => {
      const unique = topic.words;
      const known = unique.filter((word) => progressMap[Utils.wordKey(word)]?.status === "known").length;
      const percent = Utils.percent(known, unique.length);
      return `<article class="card"><div class="card-title-row"><div><p class="eyebrow">${Utils.escape(topic.label || `Lesson ${topic.lessonNumber || ""}`)}</p><h3>${Utils.escape(topic.icon || "💬")} ${Utils.escape(topic.title)}</h3></div><span class="status-badge ${known === unique.length && unique.length ? "status-complete" : ""}">${known}/${unique.length}</span></div><div class="progress-track" aria-label="${percent}% learned"><div class="progress-fill" style="width:${percent}%"></div></div><p class="muted small">A word becomes learned only after a correct answer in a completed vocabulary test.</p><div class="button-row"><a class="btn btn-primary" href="vocabulary.html?topic=${encodeURIComponent(topic.id)}">Open</a></div></article>`;
    }).join("") : UI.empty("💥", "Словарных тренажёров пока нет", "Новые темы появятся после уроков.")}`;
  }

  async function initVocabulary() {
    UI.loading();
    const topicId = Utils.query("topic");
    const topics = await DataService.vocabularyTopics();
    const topic = topics.find((item) => item.id === topicId);
    if (!topic) return UI.error("Vocabulary topic unavailable", "Open a topic from the Vocabulary page.");
    const words = topic.words;
    const progressRows = await Promise.all(words.map((word) => ProgressService.loadVocabularyProgress(Utils.wordKey(word))));
    const progress = Object.fromEntries(words.map((word, index) => [Utils.wordKey(word), progressRows[index] || { word_key: Utils.wordKey(word), status: "new" }]));
    let mode = "all";
    let cardIndex = 0;
    let cardRevealed = false;
    let testState = null;

    const pronunciationButton = (word) => (config.features.wordPronunciation && "speechSynthesis" in window) ? `<button class="btn btn-ghost btn-icon" type="button" data-speak="${Utils.escape(word.en)}" aria-label="Pronounce ${Utils.escape(word.en)}">🔊</button>` : "";
    const statusBadge = (word) => {
      const status = progress[Utils.wordKey(word)]?.status || "new";
      const labels = { new: "New", known: "Learned", difficult: "Difficult" };
      const cls = status === "known" ? "status-complete" : status === "difficult" ? "status-error" : "";
      return `<span class="status-badge ${cls}">${labels[status]}</span>`;
    };

    const renderAll = (list = words) => list.length ? `<div class="word-list">${list.map((word) => `<article class="card word-row"><div><div class="word-en">${Utils.escape(word.en)}</div><div class="transcription">${Utils.escape(word.transcription || "")}</div></div><div>${Utils.escape(word.ru)}</div>${pronunciationButton(word)}${word.exampleEn ? `<div class="word-example"><strong>${Utils.escape(word.exampleEn)}</strong>${word.exampleRu ? `<br>${Utils.escape(word.exampleRu)}` : ""}<div style="margin-top:8px">${statusBadge(word)}</div></div>` : `<div class="word-example">${statusBadge(word)}</div>`}</article>`).join("")}</div>` : UI.empty("🌱", "No words here", "This section will fill after a completed test.");

    const renderCards = () => {
      if (!words.length) return UI.empty("🃏", "No cards", "Add words to the lesson vocabulary.");
      const word = words[cardIndex % words.length];
      return `<div class="card flashcard"><div><div class="small muted">Card ${cardIndex + 1} of ${words.length}</div><div class="flashcard-word">${Utils.escape(word.en)}</div><div class="transcription">${Utils.escape(word.transcription || "")}</div>${cardRevealed ? `<div class="flashcard-translation">${Utils.escape(word.ru)}</div>${word.exampleEn ? `<p><strong>${Utils.escape(word.exampleEn)}</strong><br><span class="muted">${Utils.escape(word.exampleRu || "")}</span></p>` : ""}` : '<p class="muted">Think of the meaning, then reveal the card.</p>'}<div class="button-row" style="justify-content:center">${pronunciationButton(word)}<button class="btn btn-secondary" id="reveal-card">${cardRevealed ? "Hide meaning" : "Reveal meaning"}</button><button class="btn btn-primary" id="next-card">Next</button></div><p class="small muted">Viewing or revealing a card does not mark the word as learned.</p></div></div>`;
    };

    const buildTest = () => {
      const shuffled = [...words].sort(() => Math.random() - .5);
      return {
        index: 0,
        answers: {},
        questions: shuffled.map((word) => {
          const distractors = words.filter((item) => Utils.wordKey(item) !== Utils.wordKey(word)).sort(() => Math.random() - .5).slice(0, 3).map((item) => item.ru);
          return { word, options: [...new Set([word.ru, ...distractors])].sort(() => Math.random() - .5) };
        })
      };
    };

    const renderTest = () => {
      if (!words.length) return UI.empty("🧪", "No test yet", "Add words to this topic first.");
      if (!testState) return `<div class="card"><h2>Vocabulary test</h2><p>Complete the whole test. Only after you press <strong>Finish test</strong> will correct words become learned.</p><div class="notice notice-warning">No 🔊 buttons are shown in test mode.</div><div class="button-row"><button class="btn btn-primary" id="start-vocab-test">Start test</button></div></div>`;
      return `<div class="card"><div class="card-title-row"><div><p class="eyebrow">Test</p><h2>Choose the correct meaning</h2></div><span class="badge">${testState.questions.length} words</span></div><div class="vocab-question-options">${testState.questions.map((question, index) => `<fieldset class="card"><legend><strong>${index + 1}. ${Utils.escape(question.word.en)}</strong></legend>${question.options.map((option) => `<label class="option"><input type="radio" name="vocab-${index}" data-vocab-index="${index}" value="${Utils.escape(option)}" ${testState.answers[index] === option ? "checked" : ""}><span>${Utils.escape(option)}</span></label>`).join("")}</fieldset>`).join("")}</div><div class="button-row"><button class="btn btn-primary" id="finish-vocab-test">Finish test</button><button class="btn btn-ghost" id="cancel-vocab-test">Cancel</button></div></div>`;
    };

    const render = () => {
      const difficult = words.filter((word) => progress[Utils.wordKey(word)]?.status === "difficult");
      main.innerHTML = `<div class="page-heading"><p class="eyebrow">${Utils.escape(topic.label || "Vocabulary")}</p><h1>${Utils.escape(topic.title)}</h1><p class="lead">${words.length} unique words. Статус Learned появляется только после завершённого теста.</p></div><div class="mode-tabs" role="tablist" aria-label="Vocabulary modes">${[["all","All words"],["cards","Cards"],["difficult","Difficult"],["test","Test"]].map(([key,label]) => `<button class="mode-tab ${mode === key ? "active" : ""}" data-mode="${key}" role="tab" aria-selected="${mode === key}">${label}</button>`).join("")}</div><section>${mode === "all" ? renderAll() : mode === "cards" ? renderCards() : mode === "difficult" ? renderAll(difficult) : renderTest()}</section>`;
      bind();
    };

    const bind = () => {
      document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => { mode = button.dataset.mode; render(); }));
      document.querySelectorAll("[data-speak]").forEach((button) => button.addEventListener("click", () => PronunciationService.speak(button.dataset.speak)));
      document.getElementById("reveal-card")?.addEventListener("click", () => { cardRevealed = !cardRevealed; render(); });
      document.getElementById("next-card")?.addEventListener("click", () => { cardIndex = (cardIndex + 1) % words.length; cardRevealed = false; render(); });
      document.getElementById("start-vocab-test")?.addEventListener("click", () => { testState = buildTest(); render(); });
      document.querySelectorAll("[data-vocab-index]").forEach((input) => input.addEventListener("change", () => { testState.answers[input.dataset.vocabIndex] = input.value; }));
      document.getElementById("cancel-vocab-test")?.addEventListener("click", () => { testState = null; render(); });
      document.getElementById("finish-vocab-test")?.addEventListener("click", async () => {
        const unanswered = testState.questions.filter((_, index) => !testState.answers[index]).length;
        if (unanswered) return UI.toast(`Answer all ${unanswered} remaining word${unanswered === 1 ? "" : "s"}.`);
        let correct = 0;
        const outcomes = [];
        for (let index = 0; index < testState.questions.length; index += 1) {
          const question = testState.questions[index];
          const key = Utils.wordKey(question.word);
          const isCorrect = Utils.normaliseText(testState.answers[index]) === Utils.normaliseText(question.word.ru);
          if (isCorrect) correct += 1;
          const previous = progress[key] || { word_key: key, status: "new" };
          const next = {
            ...previous,
            word_key: key,
            status: isCorrect ? "known" : "difficult",
            learned_at: isCorrect ? (previous.learned_at || Utils.now()) : null
          };
          progress[key] = await ProgressService.saveVocabularyProgress(next, { silent: true });
          outcomes.push({ word_key: key, correct: isCorrect });
        }
        const topicRecord = await ProgressService.load("vocabularyTopics", topic.id) || { topic_id: topic.id, tests: [] };
        topicRecord.tests = [...Utils.asArray(topicRecord.tests), { completed_at: Utils.now(), correct, total: words.length, percent: Utils.percent(correct, words.length), outcomes }];
        await ProgressService.save("vocabularyTopics", topic.id, topicRecord);
        const score = Utils.percent(correct, words.length);
        testState = null;
        mode = "all";
        render();
        UI.toast(`Test completed: ${correct}/${words.length} · ${score}%`);
      });
    };
    render();
  }

  async function initGrammar() {
    UI.loading();
    const [topics, progressRows] = await Promise.all([DataService.grammarIndex(), ProgressService.loadAll("grammar")]);
    const progressMap = Object.fromEntries(progressRows.map((item) => [item.topic_id, item]));
    main.innerHTML = `<div class="page-heading"><p class="eyebrow">Knowledge base</p><h1>Grammar</h1><p class="lead">Clear explanations, visual patterns and practice for independent study.</p></div>${topics.length ? topics.map((topic) => { const item = progressMap[topic.id]; return `<article class="card"><div class="card-title-row"><div><p class="eyebrow">Topic ${Number(topic.number || 0)}</p><h3>${Utils.escape(topic.title)}</h3></div><span class="status-badge ${item?.passed ? "status-complete" : ""}">${item?.passed ? "Passed" : `${Number(item?.best_score || 0)}% best`}</span></div><p class="muted">${Utils.escape(topic.subtitle || "")}</p><div class="button-row"><a class="btn btn-primary" href="grammar-topic.html?id=${encodeURIComponent(topic.id)}">Open topic</a></div></article>`; }).join("") : UI.empty("📐", "Грамматические темы пока не опубликованы", `Материалы будут добавляться в соответствии с уроками и учебником «${config.student.textbook}».`)}`;
  }

  function grammarExerciseQuestion(exercise, index, answers, results) {
    const q = { ...exercise, id: exercise.id || `exercise-${index + 1}` };
    return renderQuestion(q, index + 1, answers[q.id], results, false);
  }

  async function initGrammarTopic() {
    UI.loading();
    const id = Utils.query("id");
    if (!id) return UI.error("Grammar topic not selected", "Open a topic from the Grammar page.");
    let topic;
    try { topic = await DataService.grammar(id); } catch { return UI.error("Grammar topic unavailable", "Check the grammar index and JSON filename."); }
    let progress = await ProgressService.loadGrammarProgress(id) || { topic_id: id, passed: false, attempts: 0, best_score: 0 };
    const localExtras = Storage.get("grammar", id) || {};
    progress = { ...progress, last_answers: localExtras.last_answers || {}, last_results: localExtras.last_results || null, last_score: localExtras.last_score ?? null };
    const exercises = Utils.asArray(topic.exercises).slice(0, 5);

    const render = () => {
      const forms = topic.forms || {};
      main.innerHTML = `<div class="page-heading"><p class="eyebrow">Grammar · ${Utils.escape(topic.level || config.student.level)}</p><h1>${Utils.escape(topic.title)}</h1><p class="lead">${Utils.escape(topic.subtitle || "")}</p></div>
        <section class="card grammar-summary"><p class="eyebrow">Главное за минуту</p><h2>Key idea</h2>${Utils.asArray(topic.summary).map((item) => `<p>${Utils.escape(item)}</p>`).join("") || '<p class="muted">Add a short summary to this grammar JSON.</p>'}</section>
        <section class="section"><div class="section-header"><h2>When we use it</h2></div><div class="grammar-map">${Utils.asArray(topic.uses).slice(0,4).map((item) => `<div class="card">${Utils.escape(item)}</div>`).join("") || '<div class="card muted">No usage notes yet.</div>'}</div></section>
        <section class="section"><div class="section-header"><h2>How it is built</h2></div><div class="grid">${[["Affirmative",forms.affirmative],["Negative",forms.negative],["Question",forms.question]].map(([label,formula]) => `<div class="card formula-card"><h3>${label}</h3><code class="formula">${Utils.escape(formula || "Add the form here")}</code></div>`).join("")}</div></section>
        <section class="section"><div class="section-header"><h2>Examples</h2></div><div class="card">${Utils.asArray(topic.examples).map((item) => `<div class="example-pair"><span class="example-en">${Utils.escape(item.en)}</span>${item.ru ? `<span class="example-ru">${Utils.escape(item.ru)}</span>` : ""}${item.note ? `<span class="small muted">${Utils.escape(item.note)}</span>` : ""}</div>`).join("") || '<p class="muted">No examples yet.</p>'}</div></section>
        <section class="section"><div class="section-header"><h2>How to choose the form</h2></div><div class="card"><ol class="steps">${Utils.asArray(topic.decisionSteps).map((item) => `<li><span>${Utils.escape(item)}</span></li>`).join("") || '<li><span>Add a clear decision algorithm.</span></li>'}</ol></div></section>
        <section class="section"><div class="section-header"><h2>Common mistakes</h2></div>${Utils.asArray(topic.errors).map((item) => `<div class="card"><div class="error-comparison"><div class="error-wrong"><strong>✕ Wrong</strong><br>${Utils.escape(item.wrong)}</div><div class="error-right"><strong>✓ Correct</strong><br>${Utils.escape(item.right)}</div></div><p class="small muted" style="margin-top:10px">${Utils.escape(item.why || "")}</p></div>`).join("") || '<div class="card muted">No common mistakes added yet.</div>'}</section>
        ${Utils.asArray(topic.details).length ? `<section class="section"><div class="section-header"><h2>Подробнее</h2></div>${topic.details.map((item) => `<details><summary>${Utils.escape(item.title)}</summary><p>${Utils.escape(item.text)}</p></details>`).join("")}</section>` : ""}
        <section class="section"><div class="section-header"><h2>Check yourself</h2><span class="section-count">${exercises.length}/5 tasks</span></div>${exercises.length ? exercises.map((exercise,index) => grammarExerciseQuestion(exercise,index,progress.last_answers,progress.last_results)).join("") : UI.empty("🧠", "Exercises not added", "A grammar topic needs five tasks from easy to difficult.")} ${exercises.length ? `<div class="card score-panel"><div class="card-title-row"><div><div class="small muted">Best result</div><div class="score-number">${Number(progress.best_score || 0)}%</div></div><span class="status-badge ${progress.passed ? "status-complete" : ""}">${progress.passed ? "Passed" : `${Number(progress.attempts || 0)} attempts`}</span></div><div class="button-row"><button class="btn btn-primary" id="check-grammar">Check grammar test</button></div>${progress.last_score != null ? `<p class="small muted">Last result: ${Number(progress.last_score)}%</p>` : ""}</div>` : ""}</section>
        <section class="section"><div class="notice"><strong>Summary:</strong> ${Utils.escape(topic.conclusion || Utils.asArray(topic.summary)[0] || "Review the forms, examples and common mistakes before the test.")}</div></section>`;
      bind();
    };

    const bind = () => {
      document.querySelectorAll("[data-question-id]").forEach((element) => element.addEventListener(element.tagName === "INPUT" && element.type === "text" ? "input" : "change", () => {
        const qid = element.dataset.questionId;
        const exercise = exercises.find((item, index) => (item.id || `exercise-${index+1}`) === qid);
        if (!exercise) return;
        if (["single-choice","true-false"].includes(exercise.type)) progress.last_answers[qid] = element.value;
        else if (exercise.type === "multiple-choice") progress.last_answers[qid] = [...document.querySelectorAll(`input[data-question-id="${CSS.escape(qid)}"]:checked`)].map((item) => item.value);
        else progress.last_answers[qid] = element.value;
        Storage.set("grammar", id, { ...progress, updated_at: Utils.now() });
      }));
      document.getElementById("check-grammar")?.addEventListener("click", async () => {
        const normalized = exercises.map((item,index) => ({ ...item, id: item.id || `exercise-${index+1}` }));
        const result = calculateLessonResult(normalized, progress.last_answers);
        progress.attempts = Number(progress.attempts || 0) + 1;
        progress.last_score = result.percent;
        progress.last_results = result.details;
        progress.best_score = Math.max(Number(progress.best_score || 0), result.percent);
        if (result.percent >= Number(topic.passScore || 80)) {
          progress.passed = true;
          progress.passed_at = progress.passed_at || Utils.now();
        }
        progress = { ...progress, ...(await ProgressService.saveGrammarProgress(progress)) };
        Storage.set("grammar", id, progress);
        render();
        UI.toast(`Grammar result: ${result.correct}/${result.total} · ${result.percent}%`);
      });
    };
    render();
  }

  async function initTelegramTest() {
    main.innerHTML = `<div class="page-heading"><p class="eyebrow">Private diagnostic page</p><h1>Telegram report test</h1><p class="lead">Use this page after Supabase and Telegram are configured. Remove it from the public repository after successful setup.</p></div><div class="notice notice-warning">The log never displays the anon key, bot token, chat ID or other secrets.</div><section class="section"><div class="card"><h2>Checks</h2><div class="button-row"><button class="btn btn-primary" id="run-diagnostic">Run diagnostic</button><a class="btn btn-ghost" href="index.html">Back home</a></div></div></section><section class="section"><div class="log-box" id="diagnostic-log" role="log">Ready.</div></section>`;
    const log = document.getElementById("diagnostic-log");
    const write = (message) => { log.textContent += `\n[${new Date().toLocaleTimeString()}] ${message}`; };
    document.getElementById("run-diagnostic").addEventListener("click", async () => {
      log.textContent = "Starting diagnostic…";
      write(`config.js loaded for student: ${STUDENT_ID}`);
      if (!Cloud.enabled) { write("ERROR: Supabase URL or public key is not configured."); return; }
      write("Supabase client is available.");
      try {
        const started = new Date();
        const { data, error } = await Cloud.client.functions.invoke("notify-telegram", { body: { action: "diagnostic", studentId: STUDENT_ID, requestedAt: started.toISOString() } });
        if (error) {
          const status = error.context?.status || "unknown";
          write(`HTTP status: ${status}`);
          if (Number(status) === 401) write("HTTP 401: the function may still require JWT verification or an old function version is deployed.");
          throw error;
        }
        write("HTTP status: 200");
        write(`Function version: ${data?.functionVersion || "missing"}`);
        write(`Response: ${JSON.stringify(data, null, 2)}`);
        if (data?.serverTime) {
          const delta = Math.abs(new Date(data.serverTime).getTime() - started.getTime());
          write(`Time comparison is valid. Difference: ${delta} ms.`);
        }
      } catch (error) {
        write(`ERROR: ${error.message || "Diagnostic request failed"}`);
      }
    });
  }

  async function init() {
    renderShell();
    const initialisers = {
      home: initHome,
      homework: initHomework,
      lesson: initLesson,
      "vocabulary-hub": initVocabularyHub,
      vocabulary: initVocabulary,
      grammar: initGrammar,
      "grammar-topic": initGrammarTopic,
      "telegram-test": initTelegramTest
    };
    try {
      await (initialisers[pageName] || initHome)();
    } catch (error) {
      console.error(error);
      UI.error("Page could not be opened", error.message || "Unexpected error");
    }
  }

  window.addEventListener("online", () => {
    UI.sync("Connection restored. Synchronising…");
    ProgressService.syncToCloud().catch(() => UI.sync("Sync will retry later."));
  });
  window.addEventListener("offline", () => UI.sync("Offline. Changes remain on this device."));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && ["home","homework","grammar","vocabulary-hub"].includes(pageName)) {
      setTimeout(() => init(), 100);
    }
  });

  init();
})();
