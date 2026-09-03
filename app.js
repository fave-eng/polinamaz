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
    newestFirst(items) {
      const orderNumber = (item) => {
        const direct = Number(item?.number ?? item?.lessonNumber ?? item?.order);
        if (Number.isFinite(direct)) return direct;
        const match = String(item?.linkedLessonId || item?.lessonId || item?.id || "").match(/\d+/);
        return match ? Number(match[0]) : 0;
      };
      return [...this.asArray(items)].sort((a, b) =>
        orderNumber(b) - orderNumber(a)
        || String(b?.id || "").localeCompare(String(a?.id || ""))
      );
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
    activeButton: null,
    stop() {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      if (this.activeButton) this.activeButton.classList.remove("is-speaking");
      this.activeButton = null;
    },
    speak(text, button = null) {
      const spokenText = String(text || "").replace(/\s*\/\s*/g, " or ").trim();
      if (!spokenText || !("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
        UI.toast("Pronunciation is unavailable on this device.");
        return false;
      }
      try {
        this.stop();
        this.activeButton = button;
        button?.classList.add("is-speaking");
        const utterance = new SpeechSynthesisUtterance(spokenText);
        utterance.lang = "en-GB";
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.onend = () => this.stop();
        utterance.onerror = (event) => {
          if (!event || !["canceled", "interrupted"].includes(event.error)) {
            UI.toast("Pronunciation is unavailable on this device.");
          }
          this.stop();
        };
        window.speechSynthesis.speak(utterance);
        return true;
      } catch (error) {
        console.warn("Pronunciation is unavailable", error);
        this.stop();
        UI.toast("Pronunciation is unavailable on this device.");
        return false;
      }
    }
  };
  window.addEventListener("pagehide", () => PronunciationService.stop());
  window.PronunciationService = PronunciationService;

  const UI = {
    toast(message) {
      const region = document.getElementById("toast-region");
      const item = document.createElement("div");
      item.className = "toast show";
      item.textContent = message;
      region.appendChild(item);
      setTimeout(() => item.remove(), 3200);
    },
    sync() {
      // Синхронизация выполняется в фоне. Технические сообщения ученице не показываем.
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
    functionName(key, fallback) {
      return String(config.supabase?.functions?.[key] || fallback).trim() || fallback;
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
        const lessons = Utils.asArray(data.lessons);
        return lessons.length ? lessons : this.findSequential("lesson", "data/lessons", 200);
      } catch (error) {
        console.warn("Lesson index unavailable; using sequential fallback", error);
        return this.findSequential("lesson", "data/lessons", 200);
      }
    },
    grammarTopics() {
      const source = window.GRAMMAR_DATA;
      const topics = Array.isArray(source) ? source : Utils.asArray(source?.topics);
      return Utils.newestFirst(
        topics.filter((topic) => topic && topic.status !== "draft" && topic.id !== "grammar-template")
      );
    },
    async grammarIndex() {
      return this.grammarTopics();
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
    async grammar(id) {
      const topic = this.grammarTopics().find((item) => String(item.id) === String(id));
      if (!topic) throw new Error(`Grammar topic not found: ${id}`);
      return topic;
    },
    async vocabularyTopics() {
      const externalTopics = Utils.asArray(window.VOCABULARY_DATA);
      const lessons = await this.lessonIndex();
      const topics = [];
      const seen = new Set();
      externalTopics.forEach((topic) => {
        const words = Utils.asArray(topic.words).filter((word) => {
          const key = Utils.wordKey(word);
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        const linkedLessonId = topic.linkedLessonId || topic.lessonId || "";
        const lessonNumber = Number(String(linkedLessonId).match(/\d+/)?.[0] || 0);
        if (words.length) topics.push({ ...topic, lessonId: linkedLessonId, lessonNumber, words });
      });
      for (const entry of lessons) {
        try {
          const lesson = entry.blocks ? entry : await this.lesson(entry.id || entry);
          if (lesson.status === "draft" || !lesson.vocabulary || !Utils.asArray(lesson.vocabulary.words).length) continue;
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
      return Utils.newestFirst(topics);
    }
  };

  function setHero(title, subtitle, options = {}) {
    const titleNode = document.getElementById("page-hero-title");
    const subtitleNode = document.getElementById("page-hero-subtitle");
    if (titleNode && title) titleNode.textContent = title;
    if (subtitleNode && subtitle !== undefined) subtitleNode.textContent = subtitle;
    const backLink = document.getElementById("page-hero-back");
    if (backLink) {
      backLink.hidden = !options.backHref;
      if (options.backHref) backLink.href = options.backHref;
      const label = backLink.querySelector("span:last-child");
      if (label && options.backLabel) label.textContent = options.backLabel;
    }
  }

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
    const heroCopy = {
      home: [`${student.nameEn}’s English Space 🚀`, "Your personal space for growing your English"],
      homework: ["Homework", "Interactive exercises and tasks after each lesson."],
      lesson: ["Homework", "Interactive exercises and tasks after each lesson."],
      grammar: ["Grammar", "Clear explanations and practice for published grammar topics."],
      "grammar-topic": ["Grammar", "Rules, examples and practice in one place."],
      "vocabulary-hub": ["Vocabulary Hub", "Flashcards, pronunciation and tests for lesson words."],
      vocabulary: ["Vocabulary", "Personal vocabulary trainer"],
      "telegram-test": ["Diagnostics", "Private service page"]
    };
    const [heroTitle, heroSubtitle] = heroCopy[pageName] || heroCopy.home;
    const isHome = pageName === "home";
    const backMap = {
      lesson: ["homework.html", "Back to homework"],
      vocabulary: ["vocabulary-hub.html", "Back to topics"],
      "grammar-topic": ["grammar.html", "Back to grammar"]
    };
    const back = backMap[pageName];
    document.title = `${student.nameEn}’s English Space · ${Utils.titleCase(pageName)}`;
    document.body.classList.add("has-bottom-nav");
    document.body.dataset.view = pageName;
    const header = document.getElementById("site-header");
    header.className = `site-header hero ${isHome ? "hero-home" : "hero-compact"}`;
    header.innerHTML = `
      <span class="star one">✦</span><span class="star two">✦</span>${isHome ? '<span class="star three">✦</span>' : ""}
      <div class="container hero-content reveal">
        <a id="page-hero-back" class="vocab-back-link" href="${back ? back[0] : "#"}" ${back ? "" : "hidden"}><span class="vocab-back-arrow" aria-hidden="true">←</span><span>${back ? back[1] : "Back"}</span></a>
        ${back ? "<br>" : ""}
        <span class="hero-badge">✦ ${Utils.escape(student.level)} Level · Individual Course</span>
        <h1 id="page-hero-title">${Utils.escape(heroTitle)}</h1>
        <p id="page-hero-subtitle">${Utils.escape(heroSubtitle)}</p>
      </div>
      <svg class="hero-wave" viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true"><path fill="#f8fafc" d="M0,66 C220,102 410,10 696,52 C963,91 1115,99 1440,35 L1440,100 L0,100 Z"></path></svg>`;
    main.classList.add("main-content", "container");
    const nav = [
      ["index.html", "🏠", "Home"],
      ["homework.html", "📝", "HW"],
      ["grammar.html", "📐", "Grammar"],
      ["vocabulary-hub.html", "💥", "Vocab"]
    ];
    document.getElementById("bottom-nav").innerHTML = nav.map(([href, icon, label]) => `
      <a class="nav-link ${activeMap[pageName] === href ? "active" : ""}" data-nav="${href}" href="${href}" ${activeMap[pageName] === href ? 'aria-current="page"' : ""}>
        <span class="nav-icon" aria-hidden="true">${icon}</span><span>${label}</span>
      </a>`).join("");
  }

  function statusLabel(progress) {
    if (!progress) return ["Не начато", "status-locked"];
    if (progress.status === "draft") return ["Черновик сохранён", "status-draft"];
    if (progress.status === "submitted_pending_report") return ["Работа отправлена", "status-complete"];
    if (progress.status === "submitted") return ["Отправлено преподавателю", "status-complete"];
    return ["Не начато", "status-locked"];
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

    const visibleLessons = lessons.filter((item) => item.status !== "draft");
    const lessonIds = new Set(visibleLessons.map((item) => item.id));
    const grammarIds = new Set(grammarTopics.map((item) => item.id));
    const currentWordKeys = new Set(vocabTopics.flatMap((topic) => topic.words.map((word) => Utils.wordKey(word))));

    const completedHomework = homeworkProgress.filter((item) => lessonIds.has(item.lesson_id) && FINAL_STATUSES.has(item.status)).length;
    const knownWords = vocabProgress.filter((item) => currentWordKeys.has(item.word_key) && item.status === "known").length;
    const passedGrammar = grammarProgress.filter((item) => grammarIds.has(item.topic_id) && item.passed).length;

    const homeworkTotal = visibleLessons.length;
    const vocabularyTotal = currentWordKeys.size;
    const grammarTotal = grammarTopics.length;
    const homeworkPercent = Utils.percent(completedHomework, homeworkTotal);
    const vocabularyPercent = Utils.percent(knownWords, vocabularyTotal);
    const grammarPercent = Utils.percent(passedGrammar, grammarTotal);

    const progressRows = [
      ["Домашние работы", completedHomework, homeworkTotal, homeworkPercent, "progress-homework"],
      ["Словарь", knownWords, vocabularyTotal, vocabularyPercent, "progress-vocabulary"],
      ["Грамматика", passedGrammar, grammarTotal, grammarPercent, "progress-grammar"]
    ].map(([label, value, total, percent, className]) => `
      <div class="progress-row">
        <div class="progress-row-head"><strong>${label}</strong><span>${value} из ${total}</span></div>
        <div class="progress-track" role="progressbar" aria-label="${label}: ${value} из ${total}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${value}">
          <div class="progress-fill ${className}" style="width:${percent}%"></div>
        </div>
      </div>`).join("");

    const homeworkByLessonId = Object.fromEntries(homeworkProgress.map((item) => [item.lesson_id, item]));
    const availableLessonsNewestFirst = visibleLessons
      .filter((item) => item.status !== "locked")
      .sort((a, b) => Number(b.number || 0) - Number(a.number || 0));
    const currentLesson = availableLessonsNewestFirst.find((item) => !FINAL_STATUSES.has(homeworkByLessonId[item.id]?.status))
      || availableLessonsNewestFirst[0]
      || null;

    main.innerHTML = `
      <section class="section progress-section" aria-labelledby="progress-title">
        <div class="section-header"><div><p class="eyebrow">Главная</p><h2 id="progress-title">Мой прогресс</h2></div></div>
        <div class="stats-grid">
          <div class="card stat-card"><strong>${completedHomework}</strong><span>ДЗ выполнено</span></div>
          <div class="card stat-card"><strong>${knownWords}</strong><span>Слов выучено</span></div>
          <div class="card stat-card"><strong>${passedGrammar}</strong><span>Тем грамматики</span></div>
          <div class="card stat-card"><strong>${Utils.escape(config.student.level)}</strong><span>Уровень</span></div>
        </div>
        <div class="card progress-overview" aria-label="Общий прогресс">
          ${progressRows}
        </div>
      </section>

      <section class="section" aria-labelledby="quick-title">
        <div class="section-header"><div><p class="eyebrow">Навигация</p><h2 id="quick-title">Быстрый доступ</h2></div></div>
        <div class="quick-grid">
          <a class="card card-link interactive quick-card" href="homework.html">
            <div class="quick-card-main"><div class="quick-icon">📝</div><h3>Домашние работы</h3><p>Выполнить новое или посмотреть отправленное</p></div><span class="arrow" aria-hidden="true">→</span>
          </a>
          <a class="card card-link interactive quick-card" href="vocabulary-hub.html">
            <div class="quick-card-main"><div class="quick-icon">💥</div><h3>Словарь</h3><p>Повторять слова и проходить тесты</p></div><span class="arrow" aria-hidden="true">→</span>
          </a>
          <a class="card card-link interactive quick-card wide" href="grammar.html">
            <div class="quick-card-main"><div class="quick-icon">📐</div><h3>Грамматика</h3><p>Понятные правила и практика</p></div><span class="arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      ${currentLesson ? `<section class="section" aria-labelledby="current-title">
        <div class="section-header"><div><p class="eyebrow">Продолжить обучение</p><h2 id="current-title">Текущий материал</h2></div></div>
        <a class="card card-link current-material" href="lesson.html?id=${encodeURIComponent(currentLesson.id)}">
          <div class="current-material-icon" aria-hidden="true">✨</div>
          <div class="current-material-copy">
            <p class="eyebrow">Урок ${Number(currentLesson.number || 0)}</p>
            <h3>${Utils.escape(currentLesson.title)}</h3>
            <p>${Utils.escape(currentLesson.subtitle || "Открыть текущее задание")}</p>
          </div>
          <span class="status-badge status-available current-material-action">Продолжить</span>
        </a>
      </section>` : ""}

      <section class="section" aria-label="Учебник">
        <div class="card book-card">
          <div class="book-cover" aria-hidden="true">📘</div>
          <div>
            <p class="eyebrow">Учебник</p>
            <h3>Outcomes 2ed B1 Intermediate</h3>
          </div>
        </div>
      </section>`;
  }

  async function initHomework() {
    UI.loading();
    setHero("Homework", "Interactive exercises and tasks after each lesson.");
    const [lessons, allProgress, vocabularyTopics, grammarTopics] = await Promise.all([
      DataService.lessonIndex(),
      ProgressService.loadAll("homework"),
      DataService.vocabularyTopics(),
      DataService.grammarIndex()
    ]);
    const progressById = Object.fromEntries(allProgress.map((item) => [item.lesson_id, item]));
    const vocabularyByLesson = new Map();
    vocabularyTopics.forEach((topic) => {
      const lessonId = String(topic.linkedLessonId || topic.lessonId || "");
      if (!lessonId) return;
      if (!vocabularyByLesson.has(lessonId)) vocabularyByLesson.set(lessonId, []);
      vocabularyByLesson.get(lessonId).push(topic);
    });
    const grammarByLesson = new Map();
    grammarTopics.forEach((topic) => {
      const lessonId = String(topic.linkedLessonId || "");
      if (!lessonId) return;
      if (!grammarByLesson.has(lessonId)) grammarByLesson.set(lessonId, []);
      grammarByLesson.get(lessonId).push(topic);
    });
    const available = [];
    const completed = [];
    Utils.newestFirst(lessons).forEach((lesson) => {
      const progress = progressById[lesson.id];
      const item = { lesson, progress };
      if (progress && FINAL_STATUSES.has(progress.status)) completed.push(item);
      else available.push(item);
    });

    const materialChip = (type, title, href) => `<a class="lesson-material-chip ${type}" href="${Utils.escape(href)}"><span class="lesson-material-chip-icon" aria-hidden="true">${type === "vocab" ? "💥" : "📐"}</span><span>${Utils.escape(title)}</span><span class="lesson-material-chip-arrow" aria-hidden="true">→</span></a>`;

    const renderLessonCard = ({ lesson, progress }) => {
      const [label, className] = lesson.status === "locked" ? ["🔒 Coming soon", "status-locked"] : statusLabel(progress);
      const locked = lesson.status === "locked";
      const explicitVocabularyIds = new Set(Utils.asArray(lesson.vocabularyIds || (lesson.vocabularyTopicId ? [lesson.vocabularyTopicId] : [])).map(String));
      const linkedVocabulary = [...(vocabularyByLesson.get(String(lesson.id)) || [])];
      vocabularyTopics.forEach((topic) => {
        if (explicitVocabularyIds.has(String(topic.id)) && !linkedVocabulary.some((item) => String(item.id) === String(topic.id))) linkedVocabulary.push(topic);
      });
      const explicitGrammarIds = new Set(Utils.asArray(lesson.grammarIds).map(String));
      const linkedGrammar = grammarTopics.filter((topic) => explicitGrammarIds.has(String(topic.id)) || String(topic.linkedLessonId || "") === String(lesson.id));
      const materials = [
        ...linkedVocabulary.map((topic) => materialChip("vocab", "Vocabulary", topic.page || `vocabulary.html?topic=${encodeURIComponent(topic.id)}`)),
        ...linkedGrammar.map((topic) => {
          const shortTitle = String(topic.shortTitle || topic.title || "Grammar").split(":")[0].trim();
          return materialChip("grammar", `Grammar: ${shortTitle}`, topic.page || `grammar-topic.html?id=${encodeURIComponent(topic.id)}`);
        })
      ];
      const result = progress && FINAL_STATUSES.has(progress.status) ? `<p class="lesson-hub-result"><strong>Result:</strong> ${Number(progress.score_correct || 0)} / ${Number(progress.score_total || 0)} · ${Number(progress.score_percent || 0)}% <span aria-hidden="true">•</span> <strong>Submitted:</strong> ${Utils.formatDate(progress.submitted_at, true)}</p>` : "";
      return `<article class="card lesson-hub-card">
        <div class="lesson-hub-main">
          <div class="lesson-hub-copy">
            <p class="eyebrow">Lesson ${Number(lesson.number || 0)}</p>
            <h3>${Utils.escape(lesson.title)}</h3>
            <p class="lesson-hub-subtitle">${Utils.escape(lesson.subtitle || "")}</p>
            ${result}
          </div>
          <div class="lesson-hub-side">
            <span class="status-badge ${className}">${Utils.escape(label)}</span>
            ${locked ? '<button class="btn btn-ghost" disabled>Coming soon</button>' : `<a class="btn btn-primary" href="lesson.html?id=${encodeURIComponent(lesson.id)}">${progress && FINAL_STATUSES.has(progress.status) ? "View homework" : "Open homework"}</a>`}
          </div>
        </div>
        ${materials.length ? `<div class="lesson-materials lesson-materials-hub"><span class="lesson-materials-compact-label">Materials</span><div class="lesson-material-links">${materials.join("")}</div></div>` : ""}
      </article>`;
    };

    const renderSection = (title, items, emptyIcon, emptyTitle, emptyText) => `<section class="section homework-hub-section"><div class="section-header"><h2>${title}</h2><span class="section-count">${items.length}</span></div>${items.length ? `<div class="hub-list homework-hub-list">${items.map(renderLessonCard).join("")}</div>` : UI.empty(emptyIcon, emptyTitle, emptyText)}</section>`;

    main.innerHTML = `
      <div class="page-heading"><p class="eyebrow">Coursework</p><h1>Homework</h1><p class="lead">Complete tasks, check your answers, then send the final result once.</p></div>
      ${lessons.length ? `${renderSection("Available", available, "✅", "No available tasks", "Все опубликованные задания уже отправлены.")}${renderSection("Completed", completed, "📭", "Nothing submitted yet", "Completed homework will appear here after final submission.")}` : UI.empty("📝", "Домашних заданий пока нет", "После первого урока преподаватель добавит сюда интерактивное задание.")}`;
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
    if (question.type === "matching" && question.scorePerPair) {
      return Object.keys(question.correctAnswer || {}).length;
    }
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
    if (type === "ordering") {
      const fixedStart = Utils.asArray(question.fixedStart).map(String);
      const rawActual = Utils.asArray(answer).map(String);
      const actual = [...fixedStart, ...rawActual.filter((item) => !fixedStart.includes(item))];
      const accepted = Utils.asArray(question.acceptedAnswers?.length ? question.acceptedAnswers : [question.correctAnswer]);
      return accepted.some((item) => JSON.stringify(actual) === JSON.stringify(Utils.asArray(item).map(String)));
    }
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
      if (question.type === "matching" && question.scorePerPair) {
        const expected = question.correctAnswer || {};
        const actual = answers[question.id] || {};
        const earned = Object.entries(expected).reduce(
          (sum, [key, value]) => sum + (Utils.normaliseText(actual[key]) === Utils.normaliseText(value) ? 1 : 0),
          0
        );
        correct += earned;
        details[question.id] = {
          correct: earned === points,
          points,
          earned,
          explanation: question.explanation || ""
        };
        return;
      }
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

  function renderOrderingLabel(item, answers) {
    if (!item || typeof item !== "object" || !Array.isArray(item.labelParts)) return optionLabel(item);
    return item.labelParts.map((part) => {
      if (typeof part === "string") return part;
      if (!part || typeof part !== "object") return "";
      const value = answers[part.questionId];
      return value ? String(value) : "_____";
    }).join("");
  }

  function originalQuestionPrompt(question) {
    return String(question.question || question.prompt || question.title || "").trim();
  }

  function renderQuestion(question, number, answer, checked, locked) {
    const id = Utils.escape(question.id);
    const result = checked?.[question.id];
    const stateClass = result ? (result.correct ? "is-correct" : "is-incorrect") : "";
    const prompt = originalQuestionPrompt(question);
    const contextHtml = question.context ? `<p class="question-context">${Utils.escape(question.context)}</p>` : "";
    const frameHtml = question.frame ? `<div class="question-frame">${Utils.escape(question.frame)}</div>` : "";
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
      const answerLabel = question.answerLabel || "Your answer";
      const placeholder = question.placeholder ? ` placeholder="${Utils.escape(question.placeholder)}"` : "";
      control = `<label><span class="small muted">${Utils.escape(answerLabel)}</span><input class="text-answer" type="text" data-question-id="${id}" value="${Utils.escape(answer || "")}"${placeholder} ${locked ? "readonly" : ""} autocomplete="off"></label>`;
    } else if (question.type === "open-answer" || question.type === "pronunciation") {
      control = `<label><span class="small muted">${question.type === "pronunciation" ? "Your note or self-assessment" : "Your answer"}</span><textarea class="open-answer" data-question-id="${id}" ${locked ? "readonly" : ""}>${Utils.escape(answer || "")}</textarea></label>`;
    } else if (question.type === "matching") {
      const current = answer && typeof answer === "object" ? answer : {};
      const leftItems = Utils.asArray(question.pairs || question.left);
      const rightOptions = Utils.asArray(question.options || question.right);
      if (question.variant === "radio-grid") {
        control = `<div class="statement-list compact-radio-list">${leftItems.map((left) => {
          const leftValue = typeof left === "object" ? String(left.value ?? left.label) : String(left);
          const selected = String(current[leftValue] || "");
          const expected = String(question.correctAnswer?.[leftValue] || "");
          const rowState = result && selected ? (Utils.normaliseText(selected) === Utils.normaliseText(expected) ? "is-correct" : "is-incorrect") : "";
          return `<article class="statement-row ${rowState}" data-response-row="${Utils.escape(leftValue)}"><div class="statement-copy"><span class="statement-number">${Utils.escape(leftValue)}</span><p>${Utils.escape(typeof left === "object" ? String(left.label || "").replace(/^\s*\d+\s*/, "") : left)}</p></div><div class="statement-options" role="radiogroup" aria-label="${Utils.escape(leftValue)}">${rightOptions.map((right) => { const value = optionValue(right); return `<label class="statement-option"><input type="radio" name="q-${id}-${Utils.escape(leftValue)}" data-question-id="${id}" data-match-key="${Utils.escape(leftValue)}" value="${Utils.escape(value)}" ${selected === value ? "checked" : ""} ${locked ? "disabled" : ""}><span>${Utils.escape(optionLabel(right))}</span></label>`; }).join("")}</div>${result && selected ? `<span class="statement-status" aria-label="${rowState === "is-correct" ? "Correct" : "Incorrect"}">${rowState === "is-correct" ? "✓" : "✕"}</span>` : ""}</article>`;
        }).join("")}</div>`;
      } else if (question.variant === "response-expressions") {
        const responseBank = `<div class="response-bank" aria-label="Responses">${rightOptions.map((right) => `<div class="response-bank-item"><span class="response-letter">${Utils.escape(optionValue(right))}</span><p>${Utils.escape(optionLabel(right))}</p></div>`).join("")}</div>`;
        const rows = leftItems.map((left) => {
          const leftValue = typeof left === "object" ? String(left.value ?? left.label) : String(left);
          const selected = String(current[leftValue] || "");
          const expected = String(question.correctAnswer?.[leftValue] || "");
          const rowState = result && selected ? (Utils.normaliseText(selected) === Utils.normaliseText(expected) ? "is-correct" : "is-incorrect") : "";
          return `<div class="response-match-row ${rowState}" data-response-row="${Utils.escape(leftValue)}"><div class="response-news"><span class="response-news-number">${Utils.escape(leftValue)}</span><p>${Utils.escape(typeof left === "object" ? String(left.label || "").replace(/^\s*\d+\s*/, "") : left)}</p></div><label class="response-select-wrap"><span class="sr-only">Response for item ${Utils.escape(leftValue)}</span><select class="select-answer response-select" data-question-id="${id}" data-match-key="${Utils.escape(leftValue)}" ${locked ? "disabled" : ""}><option value="">—</option>${rightOptions.map((right) => { const value = optionValue(right); const label = question.compactOptionLabels ? value : optionLabel(right); return `<option value="${Utils.escape(value)}" ${selected === value ? "selected" : ""}>${Utils.escape(label)}</option>`; }).join("")}</select></label>${result && selected ? `<span class="response-row-status" aria-label="${rowState === "is-correct" ? "Correct" : "Incorrect"}">${rowState === "is-correct" ? "✓" : "✕"}</span>` : ""}</div>`;
        }).join("");
        control = `<div class="response-matching-layout">${responseBank}<div class="response-news-list">${rows}</div></div>`;
      } else {
        control = `<div class="matching-grid">${leftItems.map((left) => {
          const leftValue = typeof left === "object" ? String(left.value ?? left.label) : String(left);
          return `<div class="match-row"><span>${Utils.escape(typeof left === "object" ? left.label : left)}</span><select class="select-answer" data-question-id="${id}" data-match-key="${Utils.escape(leftValue)}" ${locked ? "disabled" : ""}><option value="">Choose…</option>${rightOptions.map((right) => { const value = optionValue(right); return `<option value="${Utils.escape(value)}" ${String(current[leftValue] || "") === value ? "selected" : ""}>${Utils.escape(optionLabel(right))}</option>`; }).join("")}</select></div>`;
        }).join("")}</div>`;
      }
    } else if (question.type === "ordering") {
      const fixedStart = Utils.asArray(question.fixedStart).map(String);
      const rawInitial = Utils.asArray(answer).length ? Utils.asArray(answer).map(String) : Utils.asArray(question.items).map(optionValue);
      const initial = [...fixedStart, ...rawInitial.filter((item) => !fixedStart.includes(String(item)))];
      control = `<div class="ordering-list" data-order-list="${id}">${initial.map((item, index) => {
        const stringItem = String(item);
        const isFixed = fixedStart.includes(stringItem);
        const previousIsFixed = index > 0 && fixedStart.includes(String(initial[index - 1]));
        const sourceItem = Utils.asArray(question.items).find((candidate) => optionValue(candidate) === stringItem) || item;
        const label = renderOrderingLabel(sourceItem, answers);
        return `<div class="order-item ${isFixed ? "is-fixed" : ""}" data-order-value="${Utils.escape(stringItem)}"${isFixed ? ' data-order-fixed="true"' : ""}><span class="order-item-copy">${isFixed ? '<span class="order-fixed-badge">1 · given</span>' : ""}${Utils.escape(label)}</span><span class="order-controls"><button type="button" data-order-action="up" aria-label="Move up" ${locked || isFixed || index === 0 || previousIsFixed ? "disabled" : ""}>↑</button><button type="button" data-order-action="down" aria-label="Move down" ${locked || isFixed || index === initial.length - 1 ? "disabled" : ""}>↓</button></span></div>`;
      }).join("")}</div>`;
    }
    const resultHtml = result ? `<div class="result-label ${result.correct ? "correct" : "incorrect"}"><span aria-hidden="true">${result.correct ? "✓" : "✕"}</span><span><strong>${result.correct ? "Correct" : "Check this answer"}.</strong>${result.explanation ? ` ${Utils.escape(result.explanation)}` : ""}</span></div>` : "";
    return `<article class="card question-card ${stateClass}" data-question-card="${id}"><div class="question-heading"><div class="question-text">${Utils.escape(prompt)}</div>${contextHtml}${frameHtml}</div><div class="question-answer">${control}</div>${resultHtml}</article>`;
  }

  function renderContentParagraph(item) {
    const text = String(item || "").trim();
    const wordBox = text.match(/^Word box:\s*(.+)$/i);
    if (wordBox) {
      const words = wordBox[1].replace(/[.]$/, "").split(",").map((word) => word.trim()).filter(Boolean);
      return `<div class="lesson-word-bank" aria-label="Word box"><div class="lesson-word-bank-heading"><span class="lesson-word-bank-icon" aria-hidden="true">Aa</span><div><span class="lesson-word-bank-label">Word box</span><span class="lesson-word-bank-help">Use each expression where it fits best</span></div></div><div class="lesson-word-bank-items">${words.map((word) => `<span>${Utils.escape(word)}</span>`).join("")}</div></div>`;
    }
    const instruction = text.match(/^(Exercise\s+\d+(?:\.\d+)?)[.:]\s*(.+)$/i);
    if (instruction) {
      return `<div class="lesson-task-instruction"><span class="lesson-task-label">${Utils.escape(instruction[1])}</span><p>${Utils.escape(instruction[2])}</p></div>`;
    }
    return `<p class="lesson-content-paragraph">${Utils.escape(text)}</p>`;
  }

  function renderContentHeading(block) {
    if (!block.title) return "";
    return `<div class="lesson-content-heading"><span class="lesson-content-kicker">${Utils.escape(block.kicker || "Study material")}</span><h2>${Utils.escape(block.title)}</h2></div>`;
  }

  function renderEmphasizedText(text, emphasis) {
    const source = String(text || "");
    const target = String(emphasis || "");
    const index = target ? source.indexOf(target) : -1;
    if (index < 0) return Utils.escape(source);
    return `${Utils.escape(source.slice(0, index))}<strong>${Utils.escape(target)}</strong>${Utils.escape(source.slice(index + target.length))}`;
  }

  function renderLanguageNoteBlock(block) {
    const groups = Utils.asArray(block.exampleGroups).map((group) => {
      const examples = Utils.asArray(group.examples).map((example) => {
        const incorrect = example.status === "incorrect";
        const statusLabel = example.label || (incorrect ? "Not correct" : "Correct");
        return `<div class="lesson-example-row ${incorrect ? "is-incorrect" : "is-correct"}"><span class="lesson-example-status" aria-label="${Utils.escape(statusLabel)}">${incorrect ? "✕" : "✓"}</span><span class="lesson-example-sentence">${renderEmphasizedText(example.text, example.emphasis)}</span>${example.label ? `<span class="lesson-example-tag">${Utils.escape(example.label)}</span>` : ""}</div>`;
      }).join("");
      return `<section class="lesson-example-group"><div class="lesson-example-group-heading"><div><h3>${Utils.escape(group.label || "Example")}</h3>${group.help ? `<p>${Utils.escape(group.help)}</p>` : ""}</div></div><div class="lesson-example-list">${examples}</div></section>`;
    }).join("");
    return `<section class="card exercise-block lesson-content-card lesson-language-note-card">${renderContentHeading(block)}<div class="lesson-content-body lesson-language-note-body"><div class="lesson-rule-card"><span class="lesson-rule-label">Rule</span><p>${Utils.escape(block.rule || "")}</p></div><div class="lesson-example-grid">${groups}</div></div></section>`;
  }

  function renderAnnotatedPassagePart(part) {
    if (typeof part === "string") return Utils.escape(part);
    if (!part || typeof part !== "object") return "";
    return `<span class="lesson-target-word"><sup>${Utils.escape(part.number)}</sup><span>${Utils.escape(part.text)}</span></span>`;
  }

  function renderAnnotatedPassageBlock(block) {
    const passage = Utils.asArray(block.passage).map((paragraph) => `<p>${Utils.asArray(paragraph).map(renderAnnotatedPassagePart).join("")}</p>`).join("");
    return `<section class="card exercise-block lesson-content-card lesson-annotated-card">${renderContentHeading(block)}<div class="lesson-content-body"><div class="lesson-task-instruction"><span class="lesson-task-label">Task</span><p>${Utils.escape(block.instruction || "")}</p></div><article class="lesson-passage-card"><div class="lesson-passage-heading"><span class="lesson-passage-label">${Utils.escape(block.passageLabel || "Text")}</span>${block.passageHelp ? `<span class="lesson-passage-help">${Utils.escape(block.passageHelp)}</span>` : ""}</div><div class="lesson-annotated-passage">${passage}</div></article></div></section>`;
  }

  function renderAudioPlaylistBlock(block) {
    const tracks = Utils.asArray(block.tracks).map((track, index) => `<article class="lesson-audio-track"><div class="lesson-audio-track-heading"><span class="lesson-audio-number">${index + 1}</span><h3>${Utils.escape(track.title || `Audio ${index + 1}`)}</h3></div><audio class="media-player" controls preload="metadata" src="${Utils.escape(track.src)}">Your browser cannot play this audio.</audio></article>`).join("");
    return `<section class="card exercise-block lesson-audio-playlist" aria-label="Listening audio"><div class="lesson-audio-playlist-heading"><span class="lesson-content-kicker">Audio</span><h2>${Utils.escape(block.title || "Audio")}</h2></div><div class="lesson-audio-track-list">${tracks}</div></section>`;
  }

  function renderSectionHeading(block) {
    return `<header class="lesson-section-divider"><span>${Utils.escape(block.kicker || "")}</span><h2>${Utils.escape(block.title || "")}</h2></header>`;
  }

  function renderContentBlock(block) {
    if (block.type === "section-heading") return renderSectionHeading(block);
    if (block.type === "audio-playlist") return renderAudioPlaylistBlock(block);
    if (block.type === "content") {
      if (block.variant === "language-note") return renderLanguageNoteBlock(block);
      if (block.variant === "annotated-passage") return renderAnnotatedPassageBlock(block);
      const paragraphs = Utils.asArray(block.paragraphs || block.text).map(renderContentParagraph).join("");
      const list = Utils.asArray(block.items).length ? `<ul class="lesson-content-list">${block.items.map((item) => `<li>${Utils.escape(item)}</li>`).join("")}</ul>` : "";
      return `<section class="card exercise-block lesson-content-card">${renderContentHeading(block)}<div class="lesson-content-body">${paragraphs}${list}</div></section>`;
    }
    if (block.type === "image") return `<figure class="exercise-block"><img class="content-image" src="${Utils.escape(block.src)}" alt="${Utils.escape(block.alt || "Lesson image")}">${block.caption ? `<figcaption class="muted small">${Utils.escape(block.caption)}</figcaption>` : ""}</figure>`;
    if (block.type === "audio") return `<section class="card exercise-block"><h2>${Utils.escape(block.title || "Listening")}</h2>${block.instruction ? `<p class="instruction">${Utils.escape(block.instruction)}</p>` : ""}<audio class="media-player" controls preload="metadata" src="${Utils.escape(block.src)}">Your browser cannot play this audio.</audio></section>`;
    return "";
  }

  function renderConversationGapPart(part, questionMap, answers, checked, locked) {
    if (typeof part === "string") return Utils.escape(part);
    if (!part || typeof part !== "object" || !part.questionId) return "";
    const question = questionMap.get(String(part.questionId));
    if (!question) return "";
    const id = String(question.id);
    const escapedId = Utils.escape(id);
    const result = checked?.[id];
    const stateClass = result ? (result.correct ? "is-correct" : "is-incorrect") : "";
    const status = result
      ? `<span class="conversation-gap-status" aria-label="${result.correct ? "Correct" : "Incorrect"}">${result.correct ? "✓" : "✕"}</span>`
      : "";
    const selected = String(answers[id] || "");
    const options = Utils.asArray(question.options);
    const control = question.controlType === "select" && options.length
      ? `<select class="select-answer conversation-gap-input conversation-gap-select" data-question-id="${escapedId}" aria-label="${Utils.escape(question.question || "Missing word or phrase")}" ${locked ? "disabled" : ""}><option value="">Choose…</option>${options.map((option) => { const value = optionValue(option); return `<option value="${Utils.escape(value)}" ${selected === value ? "selected" : ""}>${Utils.escape(optionLabel(option))}</option>`; }).join("")}</select>`
      : `<input class="text-answer conversation-gap-input" type="text" data-question-id="${escapedId}" value="${Utils.escape(selected)}" aria-label="${Utils.escape(question.question || "Missing word or phrase")}" ${locked ? "readonly" : ""} autocomplete="off">`;
    return `<span class="conversation-gap ${stateClass}">${control}${status}</span>`;
  }

  function renderGapTextPart(part, questionMap, answers, checked, locked) {
    if (typeof part === "string") return Utils.escape(part);
    if (!part || typeof part !== "object") return "";
    if (part.underline) return `<u>${Utils.escape(part.underline)}</u>`;
    return renderConversationGapPart(part, questionMap, answers, checked, locked);
  }

  function renderLessonWordBank(block) {
    const groups = Utils.asArray(block.wordBankGroups);
    if (groups.length) {
      return `<div class="lesson-word-bank lesson-word-bank-grouped" aria-label="Word box"><div class="lesson-word-bank-heading"><span class="lesson-word-bank-icon" aria-hidden="true">Aa</span><div><span class="lesson-word-bank-label">Word box</span></div></div><div class="lesson-word-bank-groups">${groups.map((group) => `<div class="lesson-word-bank-group"><strong>${Utils.escape(group.label || "Box")}</strong><div class="lesson-word-bank-items">${Utils.asArray(group.words).map((word) => `<span>${Utils.escape(word)}</span>`).join("")}</div></div>`).join("")}</div></div>`;
    }
    return Utils.asArray(block.wordBank).length
      ? `<div class="lesson-word-bank" aria-label="Word box"><div class="lesson-word-bank-heading"><span class="lesson-word-bank-icon" aria-hidden="true">Aa</span><div><span class="lesson-word-bank-label">Word box</span></div></div><div class="lesson-word-bank-items">${block.wordBank.map((word) => `<span>${Utils.escape(word)}</span>`).join("")}</div></div>`
      : "";
  }

  function renderConversationGapBlock(block, answers, checked, locked) {
    const questions = Utils.asArray(block.questions);
    const questionMap = new Map(questions.map((question) => [String(question.id), question]));
    const wordBank = renderLessonWordBank(block);
    const conversations = Utils.asArray(block.conversations).map((conversation) => {
      const pairs = Utils.asArray(conversation.pairs).map((pair) => {
        const values = Utils.asArray(pair);
        return `<div class="conversation-pair">${values.map((value) => Utils.escape(value)).join(' <span aria-hidden="true">/</span> ')}</div>`;
      }).join("");
      const lines = Utils.asArray(conversation.lines).map((line) => {
        const speaker = String(line.speaker || "");
        const side = speaker.toUpperCase() === "B" ? "is-right" : "is-left";
        const text = Utils.asArray(line.parts).map((part) => renderConversationGapPart(part, questionMap, answers, checked, locked)).join("");
        return `<div class="conversation-message ${side}"><div class="conversation-avatar" aria-hidden="true">${Utils.escape(speaker)}</div><div class="conversation-bubble"><span class="conversation-speaker">${Utils.escape(speaker)}</span><p>${text}</p></div></div>`;
      }).join("");
      return `<article class="conversation-item"><div class="conversation-item-heading"><span class="conversation-number">${Utils.escape(conversation.number)}</span><div class="conversation-pair-bank">${pairs}</div></div><div class="conversation-dialogue">${lines}</div></article>`;
    }).join("");
    return `<section class="card exercise-block lesson-content-card conversation-gap-card">${renderContentHeading(block)}<div class="lesson-content-body">${wordBank}<div class="conversation-list">${conversations}</div></div></section>`;
  }

  function renderGapTextBlock(block, answers, checked, locked) {
    const questions = Utils.asArray(block.questions);
    const questionMap = new Map(questions.map((question) => [String(question.id), question]));
    const wordBank = renderLessonWordBank(block);
    const paragraphs = Utils.asArray(block.paragraphs).map((paragraph) => {
      const parts = Utils.asArray(paragraph);
      return `<p>${parts.map((part) => renderGapTextPart(part, questionMap, answers, checked, locked)).join("")}</p>`;
    }).join("");
    const passageLabel = block.passageLabel
      ? `<div class="lesson-passage-heading"><span class="lesson-passage-label">${Utils.escape(block.passageLabel)}</span>${block.passageHelp ? `<span class="lesson-passage-help">${Utils.escape(block.passageHelp)}</span>` : ""}</div>`
      : "";
    return `<section class="card exercise-block lesson-content-card lesson-gap-text-card">${renderContentHeading(block)}<div class="lesson-content-body">${block.instruction ? `<div class="lesson-task-instruction"><span class="lesson-task-label">Task</span><p>${Utils.escape(block.instruction)}</p></div>` : ""}${wordBank}<article class="lesson-passage-card ${block.variant ? `lesson-gap-text-${Utils.escape(block.variant)}` : ""}">${passageLabel}<div class="lesson-gap-text">${paragraphs}</div></article></div></section>`;
  }

  function renderStatementListBlock(block, answers, checked, locked) {
    const rows = Utils.asArray(block.questions).map((question) => {
      const id = String(question.id);
      const current = String(answers[id] || "");
      const result = checked?.[id];
      const stateClass = result ? (result.correct ? "is-correct" : "is-incorrect") : "";
      const options = Utils.asArray(question.options);
      return `<article class="statement-row ${stateClass}" data-question-card="${Utils.escape(id)}"><div class="statement-copy"><span class="statement-number">${Utils.escape(String(question.question || "").match(/^\s*(\d+)/)?.[1] || "")}</span><p>${Utils.escape(String(question.question || "").replace(/^\s*\d+\s*/, ""))}</p></div><div class="statement-options" role="radiogroup" aria-label="${Utils.escape(question.question || "True or false")}">${options.map((option) => { const value = optionValue(option); return `<label class="statement-option"><input type="radio" name="q-${Utils.escape(id)}" data-question-id="${Utils.escape(id)}" value="${Utils.escape(value)}" ${current === value ? "checked" : ""} ${locked ? "disabled" : ""}><span>${Utils.escape(optionLabel(option))}</span></label>`; }).join("")}</div>${result ? `<span class="statement-status" aria-label="${result.correct ? "Correct" : "Incorrect"}">${result.correct ? "✓" : "✕"}</span>` : ""}</article>`;
    }).join("");
    return `<section class="card exercise-block statement-list-card"><div class="statement-list-heading"><h2>${Utils.escape(block.title || "")}</h2>${block.instruction ? `<p>${Utils.escape(block.instruction)}</p>` : ""}</div><div class="statement-list">${rows}</div></section>`;
  }

  async function initLesson() {
    UI.loading();
    const lessonId = Utils.query("id");
    if (!lessonId) return UI.error("Lesson not selected", "Open a lesson from the Homework page.");
    let lesson;
    try { lesson = await DataService.lesson(lessonId); } catch (error) { return UI.error("Lesson unavailable", "The lesson file could not be loaded. Check its name and index."); }
    if (lesson.status === "draft") return UI.error("Draft lesson", "This lesson has not been published.");
    setHero(lesson.title, lesson.subtitle || "Interactive homework assignment", { backHref: "homework.html", backLabel: "Back to homework" });
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
    const grammarTopicIds = new Set(Utils.asArray(lesson.grammarIds).map(String));
    const linkedGrammarTopics = DataService.grammarTopics().filter((topic) => grammarTopicIds.has(String(topic.id)) || String(topic.linkedLessonId || "") === String(lesson.id));
    const vocabularyTopicIds = new Set(Utils.asArray(lesson.vocabularyIds || (lesson.vocabularyTopicId ? [lesson.vocabularyTopicId] : [])).map(String));
    const linkedVocabularyTopics = (await DataService.vocabularyTopics()).filter((topic) => String(topic.linkedLessonId || topic.lessonId || "") === String(lesson.id) || vocabularyTopicIds.has(String(topic.id)));
    const linkedMaterials = [
      ...linkedVocabularyTopics.map((topic) => ({ type: "vocab", icon: "💥", label: "Vocabulary", title: topic.title, href: topic.page || `vocabulary.html?topic=${encodeURIComponent(topic.id)}` })),
      ...linkedGrammarTopics.map((topic) => ({ type: "grammar", icon: "📐", label: "Grammar", title: topic.title, href: topic.page || `grammar-topic.html?id=${encodeURIComponent(topic.id)}` }))
    ];
    const linkedMaterialsHtml = linkedMaterials.length ? `<div class="lesson-materials lesson-materials-lesson"><div class="lesson-materials-heading"><div><span class="eyebrow">Lesson materials</span><h2>Prepare before the homework</h2></div><p>Open the vocabulary and grammar connected with this assignment.</p></div><div class="lesson-material-links">${linkedMaterials.map((item) => `<a class="lesson-material-link ${item.type}" href="${Utils.escape(item.href)}"><span class="lesson-material-link-main"><span class="lesson-material-icon" aria-hidden="true">${item.icon}</span><span class="lesson-material-text"><strong>${item.label}</strong><small>${Utils.escape(item.title)}</small></span></span><span class="lesson-material-arrow" aria-hidden="true">→</span></a>`).join("")}</div></div>` : "";
    const render = () => {
      const locked = FINAL_STATUSES.has(progress.status);
      const meta = progress.answers.__meta || {};
      const checked = meta.checkDetails || null;
      let questionNumber = 0;
      const blockHtml = Utils.asArray(lesson.blocks).map((block) => {
        if (block.type === "gap-text") {
          return renderGapTextBlock(block, progress.answers, checked, locked);
        }
        const content = renderContentBlock(block);
        if (content) return content;
        if (block.type === "conversation-gap-fill") {
          return renderConversationGapBlock(block, progress.answers, checked, locked);
        }
        if (Array.isArray(block.questions)) {
          if (block.variant === "statement-list") {
            questionNumber += block.questions.length;
            return renderStatementListBlock(block, progress.answers, checked, locked);
          }
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
        <div class="lesson-meta"><span class="badge">${questions.length} tasks</span></div>
        ${linkedMaterialsHtml}
        ${locked ? `<div class="notice notice-success locked-banner"><strong>Работа отправлена.</strong> Ответы больше нельзя изменить. Результат: ${Number(progress.score_correct || 0)} / ${Number(progress.score_total || 0)} (${Number(progress.score_percent || 0)}%).</div>` : '<div class="notice">Черновик сохраняется автоматически. Проверяй ответы до финальной отправки.</div>'}
        ${blockHtml || UI.empty("🧩", "This lesson has no blocks", "Add exercises to the lesson JSON file.")}
        ${questions.length ? `<section class="card score-panel" aria-label="Lesson actions"><div class="card-title-row"><div><div class="small muted">Текущий результат</div><div class="score-number">${progress.score_total != null ? `${Number(progress.score_correct || 0)} / ${Number(progress.score_total || 0)} · ${Number(progress.score_percent || 0)}%` : "Ещё не проверено"}</div></div><span class="status-badge ${statusLabel(progress)[1]}">${statusLabel(progress)[0]}</span></div><div class="button-row">${locked ? (progress.report_status === "failed" ? '<button class="btn btn-primary" id="retry-report">Повторить отправку преподавателю</button>' : '<a class="btn btn-ghost" href="homework.html">К домашним работам</a>') : '<button class="btn btn-secondary" id="check-answers">Проверить ответы</button><button class="btn btn-primary" id="submit-homework">Отправить преподавателю</button>'}</div></section>` : ""}`;
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
      const updatesDynamicOrdering = questions.some((item) =>
        item.type === "ordering" &&
        Utils.asArray(item.items).some((orderItem) =>
          Utils.asArray(orderItem?.labelParts).some((part) => part && typeof part === "object" && part.questionId === id)
        )
      );
      if (updatesDynamicOrdering) render();
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
        const { data, error } = await Cloud.client.functions.invoke(Cloud.functionName("notifyTelegram", "notify-telegram"), {
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
    setHero("Vocabulary Hub", "Flashcards, pronunciation and tests for lesson words.");
    const progressMap = Object.fromEntries(allWordProgress.map((item) => [item.word_key, item]));
    const topicCards = topics.map((topic) => {
      const unique = topic.words;
      const known = unique.filter((word) => progressMap[Utils.wordKey(word)]?.status === "known").length;
      const percent = Utils.percent(known, unique.length);
      const complete = Boolean(known === unique.length && unique.length);
      return {
        complete,
        html: `<article class="card resource-hub-card"><div class="resource-hub-header"><div class="resource-hub-icon" aria-hidden="true">${Utils.escape(topic.icon || "💬")}</div><div class="resource-hub-copy"><p class="eyebrow">${Utils.escape(topic.label || `Lesson ${topic.lessonNumber || ""}`)}</p><h3>${Utils.escape(topic.title)}</h3><p>${unique.length} words and phrases</p></div><span class="status-badge ${complete ? "status-complete" : ""}">${known}/${unique.length}</span></div><div class="resource-hub-progress"><div class="progress-row-head"><strong>Learned</strong><span>${percent}%</span></div><div class="progress-track" aria-label="${percent}% learned"><div class="progress-fill" style="width:${percent}%"></div></div></div><div class="resource-hub-actions"><p>A word is learned after a correct answer in a completed test.</p><a class="btn btn-primary" href="${Utils.escape(topic.page || `vocabulary.html?topic=${encodeURIComponent(topic.id)}`)}">Open vocabulary</a></div></article>`
      };
    });
    const available = topicCards.filter((item) => !item.complete);
    const learned = topicCards.filter((item) => item.complete);
    const renderTopicSection = (title, items, emptyTitle, emptyText) => `<section class="section resource-hub-section"><div class="section-header"><h2>${Utils.escape(title)}</h2><span class="section-count">${items.length}</span></div>${items.length ? `<div class="hub-list resource-hub-list">${items.map((item) => item.html).join("")}</div>` : UI.empty("💥", emptyTitle, emptyText)}</section>`;
    main.innerHTML = `<div class="page-heading"><p class="eyebrow">Word practice</p><h1>Vocabulary</h1><p class="lead">Learn lesson words, listen to pronunciation and finish a test to mark words as learned.</p></div>${topics.length ? `${renderTopicSection("Available", available, "No available vocabulary", "All published vocabulary topics are learned.")}${renderTopicSection("Learned", learned, "No learned vocabulary yet", "Completed vocabulary topics will appear here after all words are learned.")}` : UI.empty("💥", "Словарных тренажёров пока нет", "Новые темы появятся после уроков.")}`;
  }

  async function initVocabulary() {
    UI.loading();
    const topicId = Utils.query("topic");
    const topics = await DataService.vocabularyTopics();
    const topic = topics.find((item) => item.id === topicId);
    if (!topic) return UI.error("Vocabulary topic unavailable", "Open a topic from the Vocabulary page.");
    const words = topic.words;
    setHero(topic.title, `${topic.label || "Vocabulary topic"} · ${words.length} unique words`, { backHref: "vocabulary-hub.html", backLabel: "Back to topics" });
    const progressRows = await Promise.all(words.map((word) => ProgressService.loadVocabularyProgress(Utils.wordKey(word))));
    const progress = Object.fromEntries(words.map((word, index) => [Utils.wordKey(word), progressRows[index] || { word_key: Utils.wordKey(word), status: "new" }]));
    let mode = "all";
    let cardIndex = 0;
    let cardRevealed = false;
    let testState = null;

    const pronunciationButton = (word, extraClass = "") => (config.features.wordPronunciation && "speechSynthesis" in window) ? `<button class="pronounce-btn ${extraClass}" type="button" data-speak="${Utils.escape(word.en)}" aria-label="Listen to the pronunciation: ${Utils.escape(word.en)}" title="Listen: ${Utils.escape(word.en)}">🔊</button>` : "";
    const statusBadge = (word) => {
      const status = progress[Utils.wordKey(word)]?.status || "new";
      const labels = { new: "New", known: "Learned", difficult: "Difficult" };
      const cls = status === "known" ? "status-complete" : status === "difficult" ? "status-error" : "";
      return `<span class="status-badge ${cls}">${labels[status]}</span>`;
    };

    const renderWordCard = (word) => {
      const state = progress[Utils.wordKey(word)]?.status || "new";
      return `<article class="card word-card word-row has-pronunciation ${state === "known" ? "known" : state === "difficult" ? "difficult" : ""}"><div class="word-card-main"><div class="word-head"><div class="word-en">${Utils.escape(word.en)}</div><div class="transcription">${Utils.escape(word.transcription || "")}</div></div><div class="word-translation">${Utils.escape(word.ru)}</div></div>${pronunciationButton(word, "word-card-pronounce")}${word.exampleEn ? `<div class="word-example"><strong>${Utils.escape(word.exampleEn)}</strong>${word.exampleRu ? `<br>${Utils.escape(word.exampleRu)}` : ""}</div>` : ""}<div class="word-card-status">${statusBadge(word)}</div></article>`;
    };

    const renderAll = (list = words) => {
      if (!list.length) return UI.empty("🌱", "No words here", "This section will fill after a completed test.");
      const groups = [];
      const groupMap = new Map();
      list.forEach((word) => {
        const category = word.category || "Other useful words";
        if (!groupMap.has(category)) {
          const group = { category, words: [] };
          groupMap.set(category, group);
          groups.push(group);
        }
        groupMap.get(category).words.push(word);
      });
      const sections = groups.map((group, index) => ({ ...group, id: `vocab-section-${index + 1}` }));
      const navigation = sections.length > 1 ? `<nav class="vocab-section-nav" aria-label="Vocabulary sections"><span class="vocab-section-nav-label">Jump to:</span>${sections.map((group) => `<a class="vocab-section-link" href="#${group.id}">${Utils.escape(group.category)} <span>${group.words.length}</span></a>`).join("")}</nav>` : "";
      return `${navigation}<div class="vocab-groups">${sections.map((group) => `<section class="vocab-group" id="${group.id}"><div class="vocab-group-heading"><h2>${Utils.escape(group.category)}</h2><span class="badge">${group.words.length}</span></div><div class="word-list">${group.words.map(renderWordCard).join("")}</div></section>`).join("")}</div>`;
    };

    const renderCards = () => {
      if (!words.length) return UI.empty("🃏", "No cards", "Add words to the lesson vocabulary.");
      const word = words[cardIndex % words.length];
      return `<div class="card flashcard"><div><div class="small muted">Card ${cardIndex + 1} of ${words.length}</div><div class="flashcard-word">${Utils.escape(word.en)}</div><div class="transcription">${Utils.escape(word.transcription || "")}</div>${cardRevealed ? `<div class="flashcard-translation">${Utils.escape(word.ru)}</div>${word.exampleEn ? `<p><strong>${Utils.escape(word.exampleEn)}</strong><br><span class="muted">${Utils.escape(word.exampleRu || "")}</span></p>` : ""}` : '<p class="muted">Think of the meaning, then reveal the card.</p>'}<div class="button-row" style="justify-content:center">${pronunciationButton(word, "flash-pronounce")}<button class="btn btn-secondary" id="reveal-card">${cardRevealed ? "Hide meaning" : "Reveal meaning"}</button><button class="btn btn-primary" id="next-card">Next</button></div><p class="small muted">Viewing or revealing a card does not mark the word as learned.</p></div></div>`;
    };

    const buildTest = () => {
      const testSize = Math.min(30, words.length);
      const shuffled = [...words].sort(() => Math.random() - .5).slice(0, testSize);
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
      if (!testState) return `<div class="card"><h2>Vocabulary test</h2><p>Each test contains up to <strong>30 randomly selected words</strong>. Complete the test and press <strong>Finish test</strong> to mark correct words as learned.</p><div class="notice notice-warning">No 🔊 buttons are shown in test mode.</div><div class="button-row"><button class="btn btn-primary" id="start-vocab-test">Start test</button></div></div>`;
      return `<div class="card"><div class="card-title-row"><div><p class="eyebrow">Test</p><h2>Choose the correct meaning</h2></div><span class="badge">${testState.questions.length} words</span></div><div class="vocab-question-options">${testState.questions.map((question, index) => `<fieldset class="card"><legend><strong>${index + 1}. ${Utils.escape(question.word.en)}</strong></legend>${question.options.map((option) => `<label class="option"><input type="radio" name="vocab-${index}" data-vocab-index="${index}" value="${Utils.escape(option)}" ${testState.answers[index] === option ? "checked" : ""}><span>${Utils.escape(option)}</span></label>`).join("")}</fieldset>`).join("")}</div><div class="button-row"><button class="btn btn-primary" id="finish-vocab-test">Finish test</button><button class="btn btn-ghost" id="cancel-vocab-test">Cancel</button></div></div>`;
    };

    const alignVocabularyCardDividers = () => {
      document.querySelectorAll(".word-list").forEach((list) => {
        const cards = [...list.querySelectorAll(".word-row")];
        const groups = new Map();
        cards.forEach((card) => {
          const mainBlock = card.querySelector(".word-card-main");
          if (mainBlock) mainBlock.style.minHeight = "";
        });
        cards.forEach((card) => {
          const rowKey = Math.round(card.offsetTop);
          if (!groups.has(rowKey)) groups.set(rowKey, []);
          groups.get(rowKey).push(card);
        });
        groups.forEach((rowCards) => {
          const height = Math.max(...rowCards.map((card) => card.querySelector(".word-card-main")?.getBoundingClientRect().height || 0));
          rowCards.forEach((card) => {
            const mainBlock = card.querySelector(".word-card-main");
            if (mainBlock && height) mainBlock.style.minHeight = `${Math.ceil(height)}px`;
          });
        });
      });
    };
    const scheduleVocabularyAlignment = () => requestAnimationFrame(() => requestAnimationFrame(alignVocabularyCardDividers));

    const render = () => {
      const difficult = words.filter((word) => progress[Utils.wordKey(word)]?.status === "difficult");
      main.innerHTML = `<div class="page-heading"><p class="eyebrow">${Utils.escape(topic.label || "Vocabulary")}</p><h1>${Utils.escape(topic.title)}</h1><p class="lead">${Utils.escape(topic.description || `${words.length} useful words and phrases.`)} <strong>${words.length}</strong> entries, grouped by meaning.</p></div><div class="mode-tabs" role="tablist" aria-label="Vocabulary modes">${[["all","All words"],["cards","Cards"],["difficult","Difficult"],["test","Test"]].map(([key,label]) => `<button class="mode-tab ${mode === key ? "active" : ""}" data-mode="${key}" role="tab" aria-selected="${mode === key}">${label}</button>`).join("")}</div><section>${mode === "all" ? renderAll() : mode === "cards" ? renderCards() : mode === "difficult" ? renderAll(difficult) : renderTest()}</section>`;
      bind();
      scheduleVocabularyAlignment();
      if (window.__polinaVocabularyResizeHandler) window.removeEventListener("resize", window.__polinaVocabularyResizeHandler);
      window.__polinaVocabularyResizeHandler = scheduleVocabularyAlignment;
      window.addEventListener("resize", window.__polinaVocabularyResizeHandler, { passive: true });
    };

    const bind = () => {
      document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => { mode = button.dataset.mode; render(); }));
      document.querySelectorAll("[data-speak]").forEach((button) => button.addEventListener("click", () => PronunciationService.speak(button.dataset.speak, button)));
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
            learned_at: isCorrect ? (previous.learned_at || Utils.now()) : null,
            learned_via: isCorrect ? "completed-vocabulary-test" : null
          };
          progress[key] = await ProgressService.saveVocabularyProgress(next, { silent: true });
          outcomes.push({ word_key: key, correct: isCorrect });
        }
        const topicRecord = await ProgressService.load("vocabularyTopics", topic.id) || { topic_id: topic.id, tests: [] };
        const testTotal = testState.questions.length;
        topicRecord.tests = [...Utils.asArray(topicRecord.tests), { completed_at: Utils.now(), correct, total: testTotal, percent: Utils.percent(correct, testTotal), outcomes }];
        await ProgressService.save("vocabularyTopics", topic.id, topicRecord);
        const score = Utils.percent(correct, testTotal);
        testState = null;
        mode = "all";
        render();
        UI.toast(`Test completed: ${correct}/${testTotal} · ${score}%`);
      });
    };
    render();
  }

  function grammarTable(table) {
    if (!table || !Array.isArray(table.headers) || !Array.isArray(table.rows)) return "";
    return `<div class="table-wrap"><table><thead><tr>${table.headers.map((header) => `<th>${Utils.escape(header)}</th>`).join("")}</tr></thead><tbody>${table.rows.map((row) => `<tr>${row.map((cell) => `<td>${Utils.escape(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  function renderGrammarExerciseItem(item, blockId, index, locked = false) {
    const itemId = String(item.id || index + 1);
    const number = item.number === undefined ? index + 1 : item.number;
    const prompt = Utils.escape(item.prompt || "");
    const inputId = `grammar-${blockId}-${itemId}`.replace(/[^a-zA-Z0-9_-]/g, "-");
    const numberMarkup = number === "" || number === null ? "" : `<span class="exercise-number">${Utils.escape(number)}</span>`;

    if (item.example) {
      return `<div class="exercise-item exercise-example" data-exercise-item="${Utils.escape(itemId)}">
        <div class="exercise-item-header">${numberMarkup}<div class="exercise-prompt">${prompt}</div></div>
        <div class="example-answer"><span>Example</span><strong>${Utils.escape(item.exampleAnswer || "")}</strong></div>
      </div>`;
    }

    let control = "";
    if (item.input === "multiple" || item.input === "single") {
      const inputType = item.input === "multiple" ? "checkbox" : "radio";
      control = `<div class="option-list compact-options">${Utils.asArray(item.options).map((option, optionIndex) => `<label class="option"><input type="${inputType}" name="${Utils.escape(inputId)}" value="${optionIndex}" ${locked ? "disabled" : ""}><span>${Utils.escape(option)}</span></label>`).join("")}</div>`;
    } else if (item.input === "select") {
      control = `<select id="${Utils.escape(inputId)}" ${locked ? "disabled" : ""}><option value="">Choose an answer</option>${Utils.asArray(item.options).map((option, optionIndex) => `<option value="${optionIndex}">${Utils.escape(option)}</option>`).join("")}</select>`;
    } else if (item.input === "textarea") {
      control = `<textarea id="${Utils.escape(inputId)}" placeholder="${Utils.escape(item.placeholder || "")}" ${locked ? "readonly" : ""}></textarea>`;
    } else if (item.input === "gaps") {
      const answers = Utils.asArray(item.answers);
      const segments = Utils.asArray(item.segments);
      control = `<div class="sentence-gaps" aria-label="${prompt}">${answers.map((answer, gapIndex) => `${gapIndex < segments.length ? `<span>${Utils.escape(segments[gapIndex])}</span>` : ""}<input class="gap-input" data-gap-index="${gapIndex}" aria-label="Gap ${gapIndex + 1}" autocomplete="off" ${locked ? "readonly" : ""}>`).join("")}${segments.length > answers.length ? `<span>${Utils.escape(segments[segments.length - 1])}</span>` : ""}</div>`;
    } else {
      control = `<input class="text-field" id="${Utils.escape(inputId)}" autocomplete="off" placeholder="${Utils.escape(item.placeholder || "")}" ${locked ? "readonly" : ""}>`;
    }

    return `<div class="exercise-item" data-exercise-item="${Utils.escape(itemId)}" data-input-type="${Utils.escape(item.input || "text")}">
      <div class="exercise-item-header">${numberMarkup}<label class="exercise-prompt" for="${Utils.escape(inputId)}">${prompt}</label></div>
      <div class="exercise-control">${control}</div>
      <div class="feedback" aria-live="polite"></div>
    </div>`;
  }

  function normaliseGrammarAnswer(value) {
    return Utils.normaliseText(value)
      .normalize("NFKC")
      .replace(/[.!?,;:]+$/g, "")
      .replace(/\s+/g, " ");
  }

  function grammarTextMatches(item, actual) {
    const accepted = Array.isArray(item.acceptedAnswers) && item.acceptedAnswers.length
      ? item.acceptedAnswers
      : Array.isArray(item.answer) ? item.answer : [item.answer];
    return accepted.some((answer) => normaliseGrammarAnswer(answer) !== "" && normaliseGrammarAnswer(answer) === normaliseGrammarAnswer(actual));
  }

  function checkGrammarExerciseItem(item, itemNode) {
    const inputType = item.input || "text";
    let actual;
    let correct = false;

    if (inputType === "multiple") {
      actual = [...itemNode.querySelectorAll("input:checked")].map((input) => Number(input.value)).sort((a, b) => a - b);
      const expected = [...Utils.asArray(item.answer)].map(Number).sort((a, b) => a - b);
      correct = JSON.stringify(actual) === JSON.stringify(expected);
    } else if (inputType === "single") {
      actual = itemNode.querySelector("input:checked")?.value ?? "";
      correct = Number(actual) === Number(item.answer);
    } else if (inputType === "select") {
      actual = itemNode.querySelector("select")?.value ?? "";
      correct = actual !== "" && Number(actual) === Number(item.answer);
    } else if (inputType === "gaps") {
      actual = [...itemNode.querySelectorAll("[data-gap-index]")].map((input) => input.value);
      const expected = Utils.asArray(item.answers);
      correct = expected.length > 0 && expected.every((answer, index) => {
        const accepted = Array.isArray(answer) ? answer : [answer];
        return accepted.some((variant) => normaliseGrammarAnswer(variant) === normaliseGrammarAnswer(actual[index]));
      });
    } else {
      actual = itemNode.querySelector("input, textarea")?.value || "";
      correct = grammarTextMatches(item, actual);
    }
    return { actual, correct };
  }

  function checkGrammarExerciseBlock(block, node) {
    const actual = {};
    let correctCount = 0;
    let total = 0;
    Utils.asArray(block.items).forEach((item, index) => {
      if (item.example) return;
      const itemId = String(item.id || index + 1);
      const itemNode = node.querySelector(`[data-exercise-item="${CSS.escape(itemId)}"]`);
      if (!itemNode) return;
      const result = checkGrammarExerciseItem(item, itemNode);
      actual[itemId] = result.actual;
      const feedback = itemNode.querySelector(".feedback");
      total += 1;
      if (result.correct) correctCount += 1;
      itemNode.classList.toggle("is-correct", result.correct);
      itemNode.classList.toggle("is-wrong", !result.correct);
      if (feedback) {
        feedback.className = `feedback show ${result.correct ? "good" : "bad"}`;
        feedback.textContent = result.correct ? "Correct!" : String(item.explanation || "Check the answer and try again.");
      }
    });
    return { actual, correctCount, total };
  }

  function renderGrammarExercise(block, index, locked = false) {
    const id = String(block.id || `grammar-exercise-${index + 1}`);
    const difficulty = String(block.difficulty || "Practice");
    const wordBank = Array.isArray(block.wordBank) && block.wordBank.length
      ? `<div class="word-bank" aria-label="Word bank"><strong class="word-bank-label">Word bank</strong>${block.wordBank.map((word) => `<span>${Utils.escape(word)}</span>`).join("")}</div>`
      : "";
    return `<article class="card lesson-block exercise-card grammar-exercise-card" data-task="${Utils.escape(id)}" data-type="exercise" data-grammar-exercise="${index}">
      <div class="exercise-heading grammar-exercise-heading">
        <div class="grammar-step-row"><span class="grammar-step-badge">Step ${index + 1}</span><span class="grammar-difficulty">${Utils.escape(difficulty)}</span></div>
        <h3>${Utils.escape(block.title || `Exercise ${index + 1}`)}</h3>
        ${block.instructions ? `<p class="muted exercise-instructions">${Utils.escape(block.instructions)}</p>` : ""}
        ${wordBank}
      </div>
      <div class="exercise-items">${Utils.asArray(block.items).map((item, itemIndex) => renderGrammarExerciseItem(item, id, itemIndex, locked)).join("")}</div>
    </article>`;
  }

  function renderGrammarPractice(topic, root, initialProgress) {
    const exercises = Utils.asArray(topic.exercises);
    let progress = initialProgress || { topic_id: topic.id, passed: false, attempts: 0, best_score: 0 };
    if (!exercises.length) {
      root.innerHTML = UI.empty("🧩", "Practice has not been added yet", "Exercises will appear with the teacher’s material.");
      return;
    }

    const draw = () => {
      const locked = Boolean(progress.passed);
      root.innerHTML = `${exercises.map((block, index) => renderGrammarExercise(block, index, locked)).join("")}
        <div class="card grammar-practice-actions">
          <div id="grammar-result">${locked ? '<h3>Topic completed</h3><p class="grammar-success-note">All answers are correct. The exercises are locked and the progress has been saved.</p>' : `<h3>Practise step by step</h3><p class="muted">Start with the easier tasks and move on to the more challenging ones.</p>${Number(progress.best_score || 0) ? `<p class="small muted">Best result: ${Number(progress.best_score || 0)}%</p>` : ""}`}</div>
          <div class="button-row">${locked ? '<a class="btn btn-ghost" href="grammar.html">Back to grammar</a>' : '<button class="btn btn-primary" type="button" id="check-grammar">Check exercises</button><button class="btn btn-secondary" type="button" id="retry-grammar">Start again</button>'}</div>
        </div>`;

      document.getElementById("check-grammar")?.addEventListener("click", async () => {
        let correct = 0;
        let total = 0;
        const answers = {};
        exercises.forEach((block, index) => {
          const node = root.querySelector(`[data-grammar-exercise="${index}"]`);
          if (!node) return;
          const result = checkGrammarExerciseBlock(block, node);
          answers[String(block.id || index + 1)] = result.actual;
          correct += Number(result.correctCount || 0);
          total += Number(result.total || 0);
        });
        const percent = Utils.percent(correct, total);
        const passScore = Number(topic.passScore || 80);
        progress = {
          ...progress,
          topic_id: topic.id,
          passed: Boolean(progress.passed) || percent >= passScore,
          attempts: Number(progress.attempts || 0) + 1,
          best_score: Math.max(Number(progress.best_score || 0), percent),
          last_score: percent,
          last_answers: answers,
          completed_at: percent >= passScore ? (progress.completed_at || Utils.now()) : progress.completed_at
        };
        progress = await ProgressService.saveGrammarProgress(progress);
        const resultNode = document.getElementById("grammar-result");
        if (resultNode) resultNode.innerHTML = `<h3>Score: ${correct} of ${total}</h3><p class="muted">${percent}% correct · pass score ${passScore}%</p>${percent >= passScore ? '<p class="grammar-success-note">Excellent! The topic is completed.</p>' : '<p class="grammar-success-note">Review the tables and Common mistakes, then try again.</p>'}`;
        UI.toast(`Grammar result: ${correct}/${total} · ${percent}%`);
        if (percent >= passScore) draw();
      });

      document.getElementById("retry-grammar")?.addEventListener("click", draw);
    };
    draw();
  }

  async function initGrammar() {
    UI.loading();
    setHero("Grammar", "Clear explanations and practice for published grammar topics.");
    const [topics, progressRows] = await Promise.all([DataService.grammarIndex(), ProgressService.loadAll("grammar")]);
    const progressMap = Object.fromEntries(progressRows.map((item) => [item.topic_id, item]));
    const passed = topics.filter((topic) => progressMap[topic.id]?.passed).length;
    const percent = Utils.percent(passed, topics.length);
    const topicCards = topics.map((topic) => {
      const item = progressMap[topic.id] || {};
      const complete = Boolean(item.passed);
      return {
        complete,
        html: `<a class="card interactive grammar-topic-card" href="${Utils.escape(topic.page || `grammar-topic.html?id=${encodeURIComponent(topic.id)}`)}"><div class="grammar-topic-icon">${complete ? "✅" : "📐"}</div><div class="grammar-topic-copy"><span class="homework-number">Topic ${Number(topic.number || topic.order || 0)}</span><h3>${Utils.escape(topic.title)}</h3><p>${Utils.escape(topic.subtitle || "")}</p></div><div class="grammar-topic-meta"><span class="status-badge ${complete ? "status-complete" : ""}">${complete ? "Completed" : `${Number(item.best_score || 0)}% best`}</span><span class="grammar-topic-arrow" aria-hidden="true">→</span></div></a>`
      };
    });
    const available = topicCards.filter((item) => !item.complete);
    const completed = topicCards.filter((item) => item.complete);
    const renderGrammarSection = (title, items, emptyTitle, emptyText) => `<section class="section grammar-topics-section" aria-labelledby="grammar-${title.toLowerCase()}-title"><div class="section-heading"><div><span class="eyebrow">Learning path</span><h2 id="grammar-${title.toLowerCase()}-title">${Utils.escape(title)}</h2></div><span class="section-count">${items.length}</span></div>${items.length ? `<div class="hub-list grammar-topic-list">${items.map((item) => item.html).join("")}</div>` : UI.empty("📐", emptyTitle, emptyText)}</section>`;
    main.innerHTML = `<div class="page-heading"><p class="eyebrow">Knowledge base</p><h1>Grammar</h1><p class="lead">Clear theory, visual patterns and step-by-step practice for the current homework.</p></div>
      <section class="section grammar-overview-section" aria-label="Grammar statistics">
        <div class="summary-grid grammar-summary-grid">
          <div class="card summary-card"><strong>${passed}</strong><span>Completed</span></div>
          <div class="card summary-card"><strong>${topics.length}</strong><span>Total</span></div>
          <div class="card summary-card"><strong>${Utils.escape(config.student.level)}</strong><span>Level</span></div>
        </div>
        <div class="card grammar-overall-progress"><div class="progress-row"><div class="progress-row-head"><strong>Overall progress</strong><span>${passed} of ${topics.length}</span></div><div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="${topics.length}" aria-valuenow="${passed}"><div class="progress-fill green" style="width:${percent}%"></div></div></div></div>
      </section>
      ${topics.length ? `${renderGrammarSection("Available", available, "No available grammar", "All published grammar topics are completed.")}${renderGrammarSection("Completed", completed, "No completed grammar yet", "Completed grammar topics will appear here after the practice is passed.")}` : UI.empty("📐", "No grammar topics have been published yet", `Materials will be added in line with the lessons and the coursebook “${config.student.textbook}”.`)}`;
  }

  async function initGrammarTopic() {
    UI.loading();
    const id = Utils.query("id");
    if (!id) return UI.error("Grammar topic not selected", "Open a topic from the Grammar page.");
    let topic;
    try { topic = await DataService.grammar(id); } catch { return UI.error("Grammar topic unavailable", "Check data/grammar-data.js and the topic id."); }
    setHero(topic.title, topic.subtitle || "Rules, examples and practice in one place.", { backHref: "grammar.html", backLabel: "Back to grammar" });
    const progress = await ProgressService.loadGrammarProgress(id) || { topic_id: id, passed: false, attempts: 0, best_score: 0 };
    const glanceCards = Utils.asArray(topic.glanceCards);
    const anchorLinks = Utils.asArray(topic.anchorLinks);
    const miniRules = Utils.asArray(topic.miniRules);
    const tables = Utils.asArray(topic.tables).length ? Utils.asArray(topic.tables) : (topic.table ? [topic.table] : []);
    const exampleGroups = Utils.asArray(topic.exampleGroups);
    const examples = Utils.asArray(topic.examples);
    const mistakes = Utils.asArray(topic.commonMistakes);
    const visual = topic.visual || null;

    main.innerHTML = `<div class="page-heading"><p class="eyebrow">Grammar · ${Utils.escape(topic.level || config.student.level)}</p><h1>${Utils.escape(topic.title)}</h1><p class="lead">${Utils.escape(topic.subtitle || "")}</p></div>
      <article class="card grammar-intro-card">
        <span class="eyebrow">Grammar focus</span>
        <h2>${Utils.escape(topic.title)}</h2>
        <p class="muted grammar-lead">${Utils.escape(topic.explanation || "")}</p>
        ${topic.formula ? `<div class="grammar-formula-box"><strong>Quick formula</strong><p>${Utils.escape(topic.formula)}</p></div>` : ""}
        ${visual?.src ? `<figure class="grammar-visual-card"><img src="${Utils.escape(visual.src)}" alt="${Utils.escape(visual.alt || topic.title)}">${visual.caption ? `<figcaption>${Utils.escape(visual.caption)}</figcaption>` : ""}</figure>` : ""}
        ${anchorLinks.length ? `<div class="grammar-anchor-links">${anchorLinks.map((link) => `<a class="grammar-anchor-link" href="#${Utils.escape(link.id)}">${Utils.escape(link.title)}</a>`).join("")}</div>` : ""}
      </article>

      ${glanceCards.length ? `<section class="section" id="grammar-at-a-glance" aria-labelledby="grammar-at-a-glance-title"><div class="section-heading"><div><span class="eyebrow">Quick overview</span><h2 id="grammar-at-a-glance-title">How to choose quickly</h2></div></div><div class="grammar-glance-grid">${glanceCards.map((card) => `<article class="card grammar-glance-card"><div class="grammar-glance-head"><span class="grammar-glance-icon">${Utils.escape(card.icon || "✦")}</span><div><h3>${Utils.escape(card.label || "")}</h3><p class="muted">${Utils.escape(card.hint || "")}</p></div></div><div class="grammar-pattern">${Utils.escape(card.pattern || "")}</div><p class="grammar-example-sentence">${Utils.escape(card.example || "")}</p></article>`).join("")}</div></section>` : ""}

      ${miniRules.length ? `<section class="section" id="grammar-rule-map" aria-labelledby="grammar-rule-map-title"><div class="section-heading"><div><span class="eyebrow">Rule map</span><h2 id="grammar-rule-map-title">Step-by-step guide</h2></div></div><div class="grammar-mini-grid">${miniRules.map((rule) => `<article class="card grammar-mini-card"><h3>${Utils.escape(rule.title || "")}</h3><p>${Utils.escape(rule.text || "")}</p>${rule.example ? `<div class="grammar-mini-example">${Utils.escape(rule.example)}</div>` : ""}</article>`).join("")}</div></section>` : ""}

      ${tables.length ? `<section class="section" id="grammar-tables" aria-labelledby="grammar-tables-title"><div class="section-heading"><div><span class="eyebrow">Tables</span><h2 id="grammar-tables-title">Tables</h2></div></div><div class="list">${tables.map((table) => `<article class="card lesson-block"><h3>${Utils.escape(table.title || "Table")}</h3>${grammarTable(table)}</article>`).join("")}</div></section>` : ""}

      ${exampleGroups.length || examples.length ? `<section class="section" id="grammar-examples" aria-labelledby="grammar-examples-title"><div class="section-heading"><div><span class="eyebrow">Examples</span><h2 id="grammar-examples-title">Examples in context</h2></div></div><div class="list">${exampleGroups.map((group) => `<article class="card lesson-block grammar-example-group"><h3>${Utils.escape(group.title || "Examples")}</h3><div class="list">${Utils.asArray(group.items).map((item) => `<p class="grammar-example-item">• ${Utils.escape(item)}</p>`).join("")}</div></article>`).join("")}${examples.length ? `<article class="card lesson-block grammar-example-group"><h3>More examples</h3><div class="list">${examples.map((example) => `<p class="grammar-example-item">• ${Utils.escape(example)}</p>`).join("")}</div></article>` : ""}</div></section>` : ""}

      ${mistakes.length ? `<section class="section" id="grammar-mistakes" aria-labelledby="grammar-mistakes-title"><div class="section-heading"><div><span class="eyebrow">Common mistakes</span><h2 id="grammar-mistakes-title">Common mistakes</h2></div></div><article class="card info-card lesson-block"><div class="list">${mistakes.map((mistake) => `<p>• ${Utils.escape(mistake)}</p>`).join("")}</div></article></section>` : ""}

      <section class="section" id="grammar-practice-section" aria-labelledby="grammar-practice-title"><div class="section-heading"><div><span class="eyebrow">Practice</span><h2 id="grammar-practice-title">${Utils.asArray(topic.exercises).length} exercises: from easier to more challenging</h2></div></div><div id="grammar-quiz"></div></section>`;

    renderGrammarPractice(topic, document.getElementById("grammar-quiz"), progress);
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
        const { data, error } = await Cloud.client.functions.invoke(Cloud.functionName("notifyTelegram", "notify-telegram"), { body: { action: "diagnostic", studentId: STUDENT_ID, requestedAt: started.toISOString() } });
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
