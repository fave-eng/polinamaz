window.APP_CONFIG = {
  student: {
    id: "polinamaz",
    nameRu: "Полина",
    nameEn: "Polina",
    level: "A2.2",
    textbook: "Outcomes",
    textbookEdition: "2nd edition Intermediate"
  },

  supabase: {
    url: "",
    anonKey: "",
    tables: {
      homework: "homework_progress",
      vocabulary: "vocabulary_progress",
      vocabularyTopics: "vocabulary_topic_progress",
      grammar: "grammar_progress"
    }
  },

  interface: {
    language: "en",
    russianTextPercent: 30
  },

  features: {
    homework: true,
    vocabulary: true,
    grammar: true,
    cloudSync: true,
    wordPronunciation: true,
    telegramNotifications: true
  },

  site: {
    baseUrl: "",
    appVersion: "1.0.0"
  }
};
