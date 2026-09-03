/**
 * Published grammar topics.
 * The structure follows the Grammar section used on Kristina's site.
 */
window.GRAMMAR_DATA = [
  {
    "id": "grammar-narrative-tenses",
    "number": 1,
    "order": 1,
    "title": "Narrative tenses: Past Simple, Past Continuous and Past Perfect",
    "subtitle": "Choose the right tense to show the main events, the background and the earlier past.",
    "level": "B1",
    "status": "published",
    "page": "grammar-topic.html?id=grammar-narrative-tenses",
    "passed": false,
    "attempts": 0,
    "passScore": 80,
    "explanation": "В рассказе о прошлом времена выполняют разные роли. Past Simple двигает историю вперёд, Past Continuous описывает фон или действие в процессе, а Past Perfect показывает событие, которое произошло раньше другого момента в прошлом. Сначала определи порядок событий, а затем выбери роль каждого действия.",
    "formula": "Past Perfect = earlier past · Past Continuous = background / action in progress · Past Simple = main event",
    "glanceCards": [
      {
        "icon": "▶️",
        "label": "Past Simple",
        "hint": "главное завершённое событие",
        "pattern": "V2 / did not + V1",
        "example": "The instructor arrived at nine."
      },
      {
        "icon": "🎬",
        "label": "Past Continuous",
        "hint": "фон или действие в процессе",
        "pattern": "was / were + V-ing",
        "example": "We were walking home when it started to rain."
      },
      {
        "icon": "⏪",
        "label": "Past Perfect",
        "hint": "действие произошло раньше другого прошлого события",
        "pattern": "had + V3 / had not + V3",
        "example": "I was nervous because I hadn’t prepared enough."
      },
      {
        "icon": "🧭",
        "label": "Story timeline",
        "hint": "сначала выстрой события по времени",
        "pattern": "earlier past → background → main event",
        "example": "I had checked the route before we left."
      }
    ],
    "anchorLinks": [
      {
        "id": "grammar-at-a-glance",
        "title": "Quick overview"
      },
      {
        "id": "grammar-rule-map",
        "title": "Rule map"
      },
      {
        "id": "grammar-tables",
        "title": "Tables"
      },
      {
        "id": "grammar-examples",
        "title": "Examples"
      },
      {
        "id": "grammar-mistakes",
        "title": "Common mistakes"
      },
      {
        "id": "grammar-practice-section",
        "title": "Practice"
      }
    ],
    "miniRules": [
      {
        "title": "1. Find the main events",
        "text": "События, которые последовательно двигают рассказ вперёд, обычно ставим в Past Simple.",
        "example": "She opened the door, walked in and sat down."
      },
      {
        "title": "2. Add the background",
        "text": "Если действие уже происходило в определённый момент или служит фоном, используй Past Continuous.",
        "example": "People were talking when the lights went out."
      },
      {
        "title": "3. Look further back",
        "text": "Если одно действие завершилось до другого события в прошлом и порядок важен, используй Past Perfect.",
        "example": "He apologised because he had forgotten the meeting."
      },
      {
        "title": "4. Do not overuse Past Perfect",
        "text": "Past Perfect обозначает более раннюю точку. Когда порядок уже понятен, дальнейшие последовательные события можно снова рассказывать в Past Simple.",
        "example": "She had packed her bag. Then she called a taxi and left."
      }
    ],
    "tables": [
      {
        "title": "The three jobs in a past story",
        "headers": [
          "Tense",
          "Main job",
          "Form",
          "Example"
        ],
        "rows": [
          [
            "Past Simple",
            "finished event / next event in the story",
            "V2 · didn’t + V1",
            "The lesson started at ten."
          ],
          [
            "Past Continuous",
            "background / action in progress",
            "was / were + V-ing",
            "I was waiting outside."
          ],
          [
            "Past Perfect",
            "event completed before another past event",
            "had + V3 · hadn’t + V3",
            "The teacher had already arrived."
          ]
        ]
      },
      {
        "title": "How two actions work together",
        "headers": [
          "Situation",
          "Typical pattern",
          "Example"
        ],
        "rows": [
          [
            "A short event interrupts an action",
            "Past Continuous + when + Past Simple",
            "I was crossing the road when my phone rang."
          ],
          [
            "Two actions happen at the same time",
            "while + Past Continuous, Past Continuous",
            "While I was cooking, my sister was setting the table."
          ],
          [
            "One event happened earlier",
            "Past Simple + because + Past Perfect",
            "He was tired because he hadn’t slept."
          ],
          [
            "A completed earlier event is the starting point",
            "Past Perfect. Then + Past Simple",
            "They had finished the work. Then they went home."
          ]
        ]
      }
    ],
    "exampleGroups": [
      {
        "title": "Build a clear timeline",
        "items": [
          "By eight o’clock, everyone had arrived, so the meeting started on time.",
          "I was looking for my keys when I remembered that I had left them at work.",
          "She felt more confident because she had practised the presentation twice."
        ]
      },
      {
        "title": "Background and main event",
        "items": [
          "The sun was shining and people were sitting outside when the storm began.",
          "We were driving through the countryside when the engine suddenly stopped.",
          "I was concentrating on the map, so I didn’t notice the message."
        ]
      },
      {
        "title": "Negative forms and questions",
        "items": [
          "I hadn’t seen the email before the class began.",
          "They weren’t listening when the teacher gave the instruction.",
          "Had you met him before you joined the company?"
        ]
      }
    ],
    "commonMistakes": [
      "I was saw him ✗ → I saw him ✓. После was / were нужен глагол с -ing, а короткое завершённое событие ставим в Past Simple.",
      "She had went home ✗ → She had gone home ✓. После had используется третья форма глагола.",
      "I didn’t had time ✗ → I didn’t have time ✓ или I hadn’t had time ✓. После did нужен инфинитив без to.",
      "He had arrived and had opened the door and had sat down — грамматически возможно, но звучит тяжело. После обозначения более раннего момента обычно возвращаемся к Past Simple.",
      "Past Continuous не означает просто «долго». Важно, что действие было в процессе в определённый момент или служило фоном."
    ],
    "exercises": [
      {
        "id": "narrative-step-1",
        "type": "exercise",
        "title": "Choose the job of the tense",
        "difficulty": "Easy",
        "instructions": "Выбери форму, которая лучше показывает роль действия в истории.",
        "items": [
          {
            "id": "ex",
            "number": "",
            "example": true,
            "prompt": "Example: The phone rang while I was having breakfast.",
            "exampleAnswer": "rang = main event; was having = background"
          },
          {
            "id": "1",
            "input": "single",
            "prompt": "When we reached the station, the train ___.",
            "options": [
              "already left",
              "had already left",
              "was already leave"
            ],
            "answer": 1,
            "explanation": "Поезд уехал раньше нашего прибытия, поэтому нужен Past Perfect."
          },
          {
            "id": "2",
            "input": "single",
            "prompt": "I ___ home when I saw the accident.",
            "options": [
              "walked",
              "was walking",
              "had walked"
            ],
            "answer": 1,
            "explanation": "Действие было в процессе и служит фоном: was walking."
          },
          {
            "id": "3",
            "input": "single",
            "prompt": "The door opened and a woman ___ into the room.",
            "options": [
              "walked",
              "was walking",
              "had walked"
            ],
            "answer": 0,
            "explanation": "Это следующее завершённое событие рассказа: Past Simple."
          },
          {
            "id": "4",
            "input": "single",
            "prompt": "He was upset because he ___ his wallet.",
            "options": [
              "lost",
              "was losing",
              "had lost"
            ],
            "answer": 2,
            "explanation": "Потеря произошла раньше состояния was upset."
          }
        ]
      },
      {
        "id": "narrative-step-2",
        "type": "exercise",
        "title": "Complete the contrasts",
        "difficulty": "Medium",
        "instructions": "Поставь глаголы в подходящую форму. В каждом предложении два пропуска.",
        "items": [
          {
            "id": "1",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "While I ",
              " (wait), I ",
              " (read) the notice on the door."
            ],
            "answers": [
              [
                "was waiting"
              ],
              [
                "read"
              ]
            ],
            "explanation": "Длительное действие — Past Continuous; короткое событие — Past Simple."
          },
          {
            "id": "2",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "She ",
              " (feel) relieved because she ",
              " (finish) the report."
            ],
            "answers": [
              [
                "felt"
              ],
              [
                "had finished"
              ]
            ],
            "explanation": "Сначала завершила отчёт, потом почувствовала облегчение."
          },
          {
            "id": "3",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "The children ",
              " (play) outside when it ",
              " (start) to snow."
            ],
            "answers": [
              [
                "were playing"
              ],
              [
                "started"
              ]
            ],
            "explanation": "Фон — were playing; событие — started."
          },
          {
            "id": "4",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "I ",
              " (not understand) the joke because I ",
              " (not hear) the beginning."
            ],
            "answers": [
              [
                "didn't understand",
                "did not understand"
              ],
              [
                "hadn't heard",
                "had not heard"
              ]
            ],
            "explanation": "Непонимание — основное событие; начало шутки было пропущено раньше."
          }
        ]
      },
      {
        "id": "narrative-step-3",
        "type": "exercise",
        "title": "Correct the tense",
        "difficulty": "Hard",
        "instructions": "Перепиши предложение полностью, исправив грамматическую ошибку.",
        "items": [
          {
            "id": "1",
            "input": "text",
            "prompt": "Correct the sentence: I was recognising him as soon as he spoke.",
            "placeholder": "Write the correct sentence",
            "acceptedAnswers": [
              "I recognised him as soon as he spoke.",
              "I recognized him as soon as he spoke.",
              "I recognised him as soon as he spoke",
              "I recognized him as soon as he spoke"
            ],
            "explanation": "Recognise — короткое завершённое событие, поэтому Past Simple."
          },
          {
            "id": "2",
            "input": "text",
            "prompt": "Correct the sentence: She had forgot her password before the test started.",
            "placeholder": "Write the correct sentence",
            "acceptedAnswers": [
              "She had forgotten her password before the test started.",
              "She had forgotten her password before the test started"
            ],
            "explanation": "После had нужна третья форма: forgotten."
          },
          {
            "id": "3",
            "input": "text",
            "prompt": "Correct the sentence: We didn't slept well the night before.",
            "placeholder": "Write the correct sentence",
            "acceptedAnswers": [
              "We didn't sleep well the night before.",
              "We did not sleep well the night before.",
              "We didn't sleep well the night before",
              "We did not sleep well the night before"
            ],
            "explanation": "После did not используется начальная форма sleep."
          },
          {
            "id": "4",
            "input": "text",
            "prompt": "Correct the sentence: The car moved slowly when the driver was suddenly stopping.",
            "placeholder": "Write the correct sentence",
            "acceptedAnswers": [
              "The car was moving slowly when the driver suddenly stopped.",
              "The car was moving slowly when the driver suddenly stopped"
            ],
            "explanation": "Движение — фон; sudden stop — короткое событие."
          }
        ]
      },
      {
        "id": "narrative-step-4",
        "type": "exercise",
        "title": "Mini-story challenge",
        "difficulty": "Challenge",
        "instructions": "Заполни мини-историю. Сначала мысленно расставь события на временной линии.",
        "items": [
          {
            "id": "1",
            "input": "gaps",
            "prompt": "Complete the story.",
            "segments": [
              "Yesterday I ",
              " (arrive) late because my alarm ",
              " (not ring)."
            ],
            "answers": [
              [
                "arrived"
              ],
              [
                "hadn't rung",
                "had not rung"
              ]
            ],
            "explanation": "Не сработавший будильник — более ранняя причина."
          },
          {
            "id": "2",
            "input": "gaps",
            "prompt": "Complete the story.",
            "segments": [
              "As I ",
              " (run) to the bus stop, I ",
              " (realise) that I had left my bag at home."
            ],
            "answers": [
              [
                "was running"
              ],
              [
                "realised",
                "realized"
              ]
            ],
            "explanation": "Бег — действие в процессе; осознание — короткое событие."
          },
          {
            "id": "3",
            "input": "gaps",
            "prompt": "Complete the story.",
            "segments": [
              "By the time I ",
              " (get) back, the bus ",
              " (leave)."
            ],
            "answers": [
              [
                "got"
              ],
              [
                "had left"
              ]
            ],
            "explanation": "Автобус уехал до того момента, когда говорящий вернулся."
          },
          {
            "id": "4",
            "input": "gaps",
            "prompt": "Complete the story.",
            "segments": [
              "I ",
              " (call) a taxi and ",
              " (wait) outside until it arrived."
            ],
            "answers": [
              [
                "called"
              ],
              [
                "waited"
              ]
            ],
            "explanation": "Последовательные завершённые события рассказываем в Past Simple."
          }
        ]
      }
    ],
    "linkedLessonId": "lesson-2"
  },
  {
    "id": "grammar-past-time-linkers",
    "number": 2,
    "order": 2,
    "title": "Before, after and by the time",
    "subtitle": "Show the order of past events clearly and connect the clauses correctly.",
    "level": "B1",
    "status": "published",
    "page": "grammar-topic.html?id=grammar-past-time-linkers",
    "passed": false,
    "attempts": 0,
    "passScore": 80,
    "explanation": "Связки before, after и by the time помогают читателю понять порядок событий. Они не заменяют времена: нужно решить, достаточно ли самого союза или важно дополнительно подчеркнуть более раннее действие с помощью Past Perfect. В конце темы также сравним while / during и until — они встречаются в письменной части домашней работы.",
    "formula": "before / after + clause · by the time + Past Simple, had + V3 · while + clause · during + noun · until + end point",
    "glanceCards": [
      {
        "icon": "⬅️",
        "label": "before",
        "hint": "одно событие происходит раньше другого",
        "pattern": "before + subject + verb",
        "example": "I checked the address before I left."
      },
      {
        "icon": "➡️",
        "label": "after",
        "hint": "следующее событие происходит позже",
        "pattern": "after + subject + verb",
        "example": "After we had finished, we went home."
      },
      {
        "icon": "⏰",
        "label": "by the time",
        "hint": "к определённому моменту действие уже завершилось",
        "pattern": "by the time + Past Simple, Past Perfect",
        "example": "By the time she arrived, the class had started."
      },
      {
        "icon": "🔗",
        "label": "while / during / until",
        "hint": "процесс, период и конечная точка",
        "pattern": "while + clause · during + noun · until + time / event",
        "example": "While I was working, my phone was off."
      }
    ],
    "anchorLinks": [
      {
        "id": "grammar-at-a-glance",
        "title": "Quick overview"
      },
      {
        "id": "grammar-rule-map",
        "title": "Rule map"
      },
      {
        "id": "grammar-tables",
        "title": "Tables"
      },
      {
        "id": "grammar-examples",
        "title": "Examples"
      },
      {
        "id": "grammar-mistakes",
        "title": "Common mistakes"
      },
      {
        "id": "grammar-practice-section",
        "title": "Practice"
      }
    ],
    "miniRules": [
      {
        "title": "1. Use before for the earlier point",
        "text": "Before вводит событие, которое служит границей: другое действие происходит раньше него. Если порядок и так очевиден, возможен Past Simple в обеих частях.",
        "example": "I checked my notes before the lesson started."
      },
      {
        "title": "2. Use after for the later point",
        "text": "After вводит уже завершившееся событие, после которого произошло следующее. Past Perfect помогает особенно ясно выделить первое действие.",
        "example": "After she had saved the file, she closed the laptop."
      },
      {
        "title": "3. Use by the time for a completed result",
        "text": "By the time означает «к тому моменту, когда». Событие, уже завершившееся к этой точке, обычно стоит в Past Perfect.",
        "example": "By the time we arrived, everyone had left."
      },
      {
        "title": "4. Separate while, during and until",
        "text": "While требует предложения, during — существительного, а until обозначает конечную точку действия.",
        "example": "While I was studying · during the lesson · until midnight"
      }
    ],
    "tables": [
      {
        "title": "Main linkers and their structures",
        "headers": [
          "Linker",
          "Structure",
          "Meaning",
          "Example"
        ],
        "rows": [
          [
            "before",
            "before + subject + verb",
            "до того как",
            "She called me before she left."
          ],
          [
            "after",
            "after + subject + verb",
            "после того как",
            "After he had explained, I understood."
          ],
          [
            "by the time",
            "by the time + past clause",
            "к тому моменту, когда",
            "By the time I arrived, they had started."
          ],
          [
            "while",
            "while + subject + verb",
            "пока / в то время как",
            "While I was preparing, she was checking the slides."
          ],
          [
            "during",
            "during + noun",
            "во время периода / события",
            "During the presentation, my phone rang."
          ],
          [
            "until",
            "until + time / event",
            "вплоть до конечной точки",
            "We worked until two in the morning."
          ]
        ]
      },
      {
        "title": "Do we always need Past Perfect?",
        "headers": [
          "Situation",
          "Natural choice",
          "Why"
        ],
        "rows": [
          [
            "The linker makes the order completely clear",
            "Past Simple can be enough",
            "After I finished, I went home."
          ],
          [
            "The earlier result is important",
            "Past Perfect + Past Simple",
            "After I had finished the report, I sent it."
          ],
          [
            "Something was already complete by a later point",
            "Past Perfect is normally expected",
            "By the time he called, I had left."
          ],
          [
            "An action continued to an end point",
            "Past Simple / Continuous + until",
            "I worked until midnight."
          ]
        ]
      }
    ],
    "exampleGroups": [
      {
        "title": "Before and after",
        "items": [
          "I read the instructions before I answered the questions.",
          "Before she realised the mistake, she had sent the message.",
          "After the meeting had ended, we discussed the result outside."
        ]
      },
      {
        "title": "By the time",
        "items": [
          "By the time I found the correct room, the class had already begun.",
          "The shop had closed by the time we got there.",
          "By the time he understood the problem, he had already made the same mistake twice."
        ]
      },
      {
        "title": "While, during and until",
        "items": [
          "While I was preparing the talk, I found several useful articles.",
          "During the lesson, we practised telling short stories.",
          "I worked until two in the morning, so I was exhausted the next day."
        ]
      }
    ],
    "commonMistakes": [
      "During I was preparing the talk ✗ → While I was preparing the talk ✓. During ставится перед существительным, while — перед предложением.",
      "By the time I had arrived, the class started ✗ → By the time I arrived, the class had started ✓. Более раннее завершённое действие — had started.",
      "After she had used the wrong word, she had gone red — второй Past Perfect обычно не нужен. Правильно: After she had used the wrong word, she went red.",
      "I worked before two o’clock ✗, если имеется в виду продолжительность до двух часов. Нужен until: I worked until two o’clock.",
      "Before и after уже показывают порядок, поэтому Past Perfect не обязателен в каждом предложении. Используй его, когда нужно подчеркнуть более ранний результат или избежать двусмысленности."
    ],
    "exercises": [
      {
        "id": "linkers-step-1",
        "type": "exercise",
        "title": "Choose the linker",
        "difficulty": "Easy",
        "instructions": "Выбери связку, которая передаёт нужное отношение между событиями.",
        "items": [
          {
            "id": "ex",
            "number": "",
            "example": true,
            "prompt": "Example: I checked the door before I left.",
            "exampleAnswer": "before = the checking happened first"
          },
          {
            "id": "1",
            "input": "single",
            "prompt": "___ we had finished dinner, we went for a walk.",
            "options": [
              "After",
              "Until",
              "During"
            ],
            "answer": 0,
            "explanation": "Прогулка произошла после ужина: After."
          },
          {
            "id": "2",
            "input": "single",
            "prompt": "___ the film, nobody spoke.",
            "options": [
              "While",
              "During",
              "By the time"
            ],
            "answer": 1,
            "explanation": "После during требуется существительное: during the film."
          },
          {
            "id": "3",
            "input": "single",
            "prompt": "I waited ___ the bus arrived.",
            "options": [
              "after",
              "until",
              "during"
            ],
            "answer": 1,
            "explanation": "Until обозначает конечную точку ожидания."
          },
          {
            "id": "4",
            "input": "single",
            "prompt": "___ I was reading, my sister was listening to music.",
            "options": [
              "While",
              "During",
              "By the time"
            ],
            "answer": 0,
            "explanation": "После while идёт полноценное предложение."
          }
        ]
      },
      {
        "id": "linkers-step-2",
        "type": "exercise",
        "title": "Complete the time relationship",
        "difficulty": "Medium",
        "instructions": "Впиши подходящую связку: before, after, by the time, while, during или until.",
        "wordBank": [
          "before",
          "after",
          "by the time",
          "while",
          "during",
          "until"
        ],
        "items": [
          {
            "id": "1",
            "input": "text",
            "prompt": "___ the teacher arrived, the students had already opened their books.",
            "answer": "by the time",
            "explanation": "К моменту прихода учителя действие уже завершилось."
          },
          {
            "id": "2",
            "input": "text",
            "prompt": "I checked the spelling ___ I printed the document.",
            "answer": "before",
            "explanation": "Проверка произошла раньше печати."
          },
          {
            "id": "3",
            "input": "text",
            "prompt": "___ the interview, I took notes.",
            "answer": "during",
            "explanation": "After during comes a noun phrase: the interview."
          },
          {
            "id": "4",
            "input": "text",
            "prompt": "She stayed in the office ___ the report was ready.",
            "answer": "until",
            "explanation": "Until показывает конечную точку действия stayed."
          }
        ]
      },
      {
        "id": "linkers-step-3",
        "type": "exercise",
        "title": "Link the events and choose the tenses",
        "difficulty": "Hard",
        "instructions": "Поставь глаголы в правильные формы. Обрати внимание на более раннее действие.",
        "items": [
          {
            "id": "1",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "By the time I ",
              " (reach) the platform, the train ",
              " (leave)."
            ],
            "answers": [
              [
                "reached"
              ],
              [
                "had left"
              ]
            ],
            "explanation": "The train left before I reached the platform."
          },
          {
            "id": "2",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "After she ",
              " (check) the figures, she ",
              " (send) the report."
            ],
            "answers": [
              [
                "had checked",
                "checked"
              ],
              [
                "sent"
              ]
            ],
            "explanation": "After уже показывает порядок; had checked подчёркивает завершённость, checked тоже возможно."
          },
          {
            "id": "3",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "Before he ",
              " (join) the course, he ",
              " (never study) English online."
            ],
            "answers": [
              [
                "joined"
              ],
              [
                "had never studied"
              ]
            ],
            "explanation": "Опыт отсутствовал до момента joining the course."
          },
          {
            "id": "4",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "While we ",
              " (wait), we ",
              " (talk) about the homework."
            ],
            "answers": [
              [
                "were waiting"
              ],
              [
                "talked",
                "were talking"
              ]
            ],
            "explanation": "Waiting — процесс; второе действие может быть завершённым разговором или параллельным процессом."
          }
        ]
      },
      {
        "id": "linkers-step-4",
        "type": "exercise",
        "title": "Correct the linker mistake",
        "difficulty": "Challenge",
        "instructions": "Перепиши предложение полностью, исправив связку или форму времени.",
        "items": [
          {
            "id": "1",
            "input": "text",
            "prompt": "Correct the sentence: During I was waiting, I read the instructions.",
            "placeholder": "Write the correct sentence",
            "acceptedAnswers": [
              "While I was waiting, I read the instructions.",
              "While I was waiting, I read the instructions"
            ],
            "explanation": "While + clause; during + noun."
          },
          {
            "id": "2",
            "input": "text",
            "prompt": "Correct the sentence: By the time we had arrived, the meeting started.",
            "placeholder": "Write the correct sentence",
            "acceptedAnswers": [
              "By the time we arrived, the meeting had started.",
              "By the time we arrived, the meeting had started"
            ],
            "explanation": "The meeting started first, so it needs Past Perfect."
          },
          {
            "id": "3",
            "input": "text",
            "prompt": "Correct the sentence: I worked before midnight and then went home.",
            "placeholder": "Write the correct sentence",
            "acceptedAnswers": [
              "I worked until midnight and then went home.",
              "I worked until midnight and then went home"
            ],
            "explanation": "Until marks the end point of the work."
          },
          {
            "id": "4",
            "input": "text",
            "prompt": "Correct the sentence: After he had finished, he had called a taxi.",
            "placeholder": "Write the correct sentence",
            "acceptedAnswers": [
              "After he had finished, he called a taxi.",
              "After he finished, he called a taxi.",
              "After he had finished, he called a taxi",
              "After he finished, he called a taxi"
            ],
            "explanation": "The later event is in Past Simple; Past Perfect is only needed for the earlier one when emphasis is useful."
          }
        ]
      }
    ],
    "linkedLessonId": "lesson-2"
  },
  {
    "id": "grammar-linking-verbs",
    "number": 3,
    "order": 3,
    "title": "Linking verbs: be, feel, look, seem and sound",
    "subtitle": "Describe a person’s state or impression by linking the subject with an adjective.",
    "level": "B1",
    "status": "published",
    "page": "grammar-topic.html?id=grammar-linking-verbs",
    "linkedLessonId": "lesson-5",
    "passed": false,
    "attempts": 0,
    "passScore": 100,
    "explanation": "Связующие глаголы не называют действие. Они соединяют человека или предмет с описанием его состояния или впечатления: I feel tired, you look worried, that sounds great. После них обычно ставится прилагательное, а форму самого глагола выбираем по времени и подлежащему.",
    "formula": "subject + linking verb + adjective · I feel guilty. She looks stressed. It sounds great.",
    "glanceCards": [
      {
        "icon": "●",
        "label": "be",
        "hint": "нейтрально сообщает состояние",
        "pattern": "am / is / are · was / were + adjective",
        "example": "He was upset."
      },
      {
        "icon": "♥",
        "label": "feel",
        "hint": "говорим о внутреннем ощущении",
        "pattern": "feel / feels · felt + adjective",
        "example": "I feel guilty."
      },
      {
        "icon": "👁",
        "label": "look / seem",
        "hint": "впечатление по виду или общая оценка",
        "pattern": "look(s) / looked · seem(s) / seemed + adjective",
        "example": "You seem a bit down."
      },
      {
        "icon": "♫",
        "label": "sound",
        "hint": "впечатление по голосу или услышанной информации",
        "pattern": "sound(s) / sounded + adjective",
        "example": "You sounded really fed up."
      }
    ],
    "anchorLinks": [
      {
        "id": "grammar-at-a-glance",
        "title": "Quick overview"
      },
      {
        "id": "grammar-rule-map",
        "title": "Rule map"
      },
      {
        "id": "grammar-tables",
        "title": "Tables"
      },
      {
        "id": "grammar-examples",
        "title": "Examples"
      },
      {
        "id": "grammar-mistakes",
        "title": "Common mistakes"
      },
      {
        "id": "grammar-practice-section",
        "title": "Practice"
      }
    ],
    "miniRules": [
      {
        "title": "1. Сначала выбери смысл",
        "text": "be просто называет состояние; feel передаёт внутреннее ощущение; look — впечатление по внешнему виду; sound — по голосу или информации; seem — общее впечатление.",
        "example": "I feel nervous, but I look calm."
      },
      {
        "title": "2. После глагола ставь прилагательное",
        "text": "Связующий глагол соединяет подлежащее с признаком. Поэтому после него употребляется adjective, а не наречие.",
        "example": "She looks tired. Not: She looks tiredly."
      },
      {
        "title": "3. Изменяй глагол по времени",
        "text": "В настоящем времени учитывай he/she/it; для прошлого используй was/were, felt, looked, seemed, sounded.",
        "example": "You sound relaxed now. You sounded stressed yesterday."
      },
      {
        "title": "4. Усилители стоят перед прилагательным",
        "text": "really, very, a bit, quite и a lot more уточняют степень признака.",
        "example": "He seems a bit down. You sound a lot more relaxed."
      }
    ],
    "tables": [
      {
        "title": "Meaning and form",
        "headers": [
          "Verb",
          "Use",
          "Present",
          "Past",
          "Example"
        ],
        "rows": [
          [
            "be",
            "state as a fact",
            "am / is / are",
            "was / were",
            "They were upset."
          ],
          [
            "feel",
            "inner feeling",
            "feel / feels",
            "felt",
            "I felt disappointed."
          ],
          [
            "look",
            "visual impression",
            "look / looks",
            "looked",
            "You look stressed."
          ],
          [
            "seem",
            "general impression",
            "seem / seems",
            "seemed",
            "She seems pleased."
          ],
          [
            "sound",
            "impression from voice or information",
            "sound / sounds",
            "sounded",
            "That sounds great."
          ]
        ]
      },
      {
        "title": "Position of modifiers",
        "headers": [
          "Pattern",
          "Example"
        ],
        "rows": [
          [
            "linking verb + adjective",
            "I feel guilty."
          ],
          [
            "linking verb + really / very + adjective",
            "He sounded really fed up."
          ],
          [
            "linking verb + a bit + adjective",
            "You seem a bit down."
          ],
          [
            "linking verb + a lot more + adjective",
            "You sound a lot more relaxed."
          ]
        ]
      }
    ],
    "exampleGroups": [
      {
        "title": "Present situations",
        "items": [
          "I feel guilty about what I said.",
          "You seem a bit down. What’s up?",
          "That sounds great.",
          "She looks stressed today."
        ]
      },
      {
        "title": "Past situations",
        "items": [
          "You sounded really fed up yesterday.",
          "I was really pleased to see her.",
          "She felt embarrassed because he was there.",
          "I felt disappointed, but I’m OK now."
        ]
      }
    ],
    "commonMistakes": [
      "She looks sadly ✗ → She looks sad ✓. После linking verb обычно нужно прилагательное.",
      "He feel upset ✗ → He feels upset ✓. В Present Simple с he/she/it добавляем -s.",
      "You sound relaxed yesterday ✗ → You sounded relaxed yesterday ✓. Для завершённого прошлого нужна прошедшая форма.",
      "I am feel guilty ✗ → I feel guilty ✓ или I am guilty ✓. Не соединяй be и feel в одной простой форме."
    ],
    "exercises": [
      {
        "id": "linking-step-1",
        "type": "exercise",
        "title": "Choose the linking verb",
        "difficulty": "Easy",
        "instructions": "Выбери подходящий глагол.",
        "items": [
          {
            "id": "ex",
            "number": "",
            "example": true,
            "prompt": "Example: I ___ tired after work.",
            "exampleAnswer": "feel"
          },
          {
            "id": "1",
            "input": "single",
            "prompt": "You ___ worried. Is everything OK?",
            "options": [
              "look",
              "look at",
              "are looking at"
            ],
            "answer": 0
          },
          {
            "id": "2",
            "input": "single",
            "prompt": "That ___ great! Congratulations!",
            "options": [
              "sounds",
              "listens",
              "hears"
            ],
            "answer": 0
          },
          {
            "id": "3",
            "input": "single",
            "prompt": "She ___ a bit down today.",
            "options": [
              "seems",
              "seeming",
              "seem"
            ],
            "answer": 0
          }
        ]
      },
      {
        "id": "linking-step-2",
        "type": "exercise",
        "title": "Use the correct form",
        "difficulty": "Medium",
        "instructions": "Поставь глагол в правильную форму.",
        "items": [
          {
            "id": "1",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "Yesterday you ",
              " really fed up. (sound)"
            ],
            "answers": [
              [
                "sounded"
              ]
            ]
          },
          {
            "id": "2",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "He ",
              " guilty about the argument. (feel)"
            ],
            "answers": [
              [
                "feels"
              ]
            ]
          },
          {
            "id": "3",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "They ",
              " upset after the news. (be)"
            ],
            "answers": [
              [
                "were"
              ]
            ]
          }
        ]
      },
      {
        "id": "linking-step-3",
        "type": "exercise",
        "title": "Build natural descriptions",
        "difficulty": "Challenging",
        "instructions": "Заполни пропуски подходящими словами.",
        "wordBank": [
          "felt",
          "looked",
          "seem",
          "sound",
          "pleased",
          "stressed",
          "down",
          "relaxed"
        ],
        "items": [
          {
            "id": "1",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "You ",
              " a bit ",
              ". What’s up?"
            ],
            "answers": [
              [
                "seem"
              ],
              [
                "down"
              ]
            ]
          },
          {
            "id": "2",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "I ",
              " really ",
              " to see her."
            ],
            "answers": [
              [
                "felt",
                "was"
              ],
              [
                "pleased"
              ]
            ]
          },
          {
            "id": "3",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "You ",
              " a lot more ",
              " now."
            ],
            "answers": [
              [
                "sound"
              ],
              [
                "relaxed"
              ]
            ]
          }
        ]
      },
      {
        "id": "linking-step-4",
        "type": "exercise",
        "title": "Complete the situation",
        "difficulty": "Hard",
        "instructions": "Впиши полное сочетание в правильной форме.",
        "items": [
          {
            "id": "1",
            "input": "text",
            "prompt": "Yesterday Ben’s voice showed that he was tired of everything. Ben ___ . (sound / fed up)",
            "answer": "sounded fed up",
            "acceptedAnswers": [
              "sounded fed up",
              "sounded really fed up"
            ]
          },
          {
            "id": "2",
            "input": "text",
            "prompt": "Mia did not get onto the course, so yesterday she ___ . (feel / disappointed)",
            "answer": "felt disappointed"
          },
          {
            "id": "3",
            "input": "text",
            "prompt": "Now Alex gives the impression that he is calmer than before. Alex ___ now. (sound / a lot more / relaxed)",
            "answer": "sounds a lot more relaxed"
          },
          {
            "id": "4",
            "input": "text",
            "prompt": "Her face showed tension when I saw her. She ___ . (look / stressed)",
            "answer": "looked stressed",
            "acceptedAnswers": [
              "looked stressed",
              "looked a bit stressed"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "grammar-present-simple-continuous",
    "number": 4,
    "order": 4,
    "title": "Present simple and continuous",
    "shortTitle": "Present simple and continuous",
    "subtitle": "Choose present simple for routines and facts, and present continuous for actions happening now or temporary situations.",
    "level": "B1",
    "status": "published",
    "page": "grammar-topic.html?id=grammar-present-simple-continuous",
    "linkedLessonId": "lesson-6",
    "passed": false,
    "attempts": 0,
    "passScore": 80,
    "explanation": "Present Simple показывает привычки, регулярные действия, факты и состояния. Present Continuous показывает действие, которое происходит сейчас, временную ситуацию или будущую личную договорённость. Сначала спроси себя: это обычная привычка или ситуация прямо сейчас / временно? В вопросах Present Simple использует do / does, а Present Continuous использует am / is / are. Краткие ответы тоже строятся с этими помощниками: Yes, I do / No, I don't; Yes, she does / No, she doesn't; Yes, I am / No, I'm not; Yes, he is / No, he isn't.",
    "formula": "Present Simple = do / does + V1 · Present Continuous = am / is / are + V-ing",
    "glanceCards": [
      {
        "icon": "🔁",
        "label": "Routines",
        "hint": "обычно, регулярно",
        "pattern": "do / does + V1",
        "example": "I usually study in the evening."
      },
      {
        "icon": "📍",
        "label": "Now",
        "hint": "происходит сейчас",
        "pattern": "am / is / are + V-ing",
        "example": "She is doing her homework now."
      },
      {
        "icon": "⏳",
        "label": "Temporary",
        "hint": "временно, в этот период",
        "pattern": "am / is / are + V-ing",
        "example": "He is working late this week."
      },
      {
        "icon": "🧠",
        "label": "States",
        "hint": "чувства, мнение, владение",
        "pattern": "Present Simple",
        "example": "I know the answer."
      }
    ],
    "anchorLinks": [
      {
        "id": "grammar-at-a-glance",
        "title": "Quick overview"
      },
      {
        "id": "grammar-rule-map",
        "title": "Rule map"
      },
      {
        "id": "grammar-tables",
        "title": "Tables"
      },
      {
        "id": "grammar-examples",
        "title": "Examples"
      },
      {
        "id": "grammar-mistakes",
        "title": "Common mistakes"
      },
      {
        "id": "grammar-practice-section",
        "title": "Practice"
      }
    ],
    "miniRules": [
      {
        "title": "1. Use Present Simple for habits",
        "text": "Если действие повторяется или является частью расписания, используй Present Simple.",
        "example": "Do you get to school by bus every day?"
      },
      {
        "title": "2. Use Present Continuous for now",
        "text": "Если действие происходит в момент речи, используй am / is / are + V-ing.",
        "example": "Why are you crying?"
      },
      {
        "title": "3. Use Present Continuous for temporary situations",
        "text": "Если ситуация актуальна только сейчас или в этот период, тоже используй Present Continuous.",
        "example": "We are meeting my boss later."
      },
      {
        "title": "4. Watch the spelling",
        "text": "В Continuous добавляем -ing: make → making, sit → sitting. В Present Simple с he / she / it добавляем -s или -es: work → works, watch → watches.",
        "example": "She watches TV, but now she is making dinner."
      },
      {
        "title": "5. Some verbs are usually simple",
        "text": "Глаголы состояния, например know, want, need, like, usually не ставятся в continuous, когда описывают состояние.",
        "example": "Do you want to talk about it?"
      }
    ],
    "tables": [
      {
        "title": "Form",
        "headers": [
          "Meaning",
          "Positive",
          "Negative",
          "Question"
        ],
        "rows": [
          [
            "Present Simple",
            "I work / She works",
            "I don't work / She doesn't work",
            "Do you work? / Does she work?"
          ],
          [
            "Present Continuous",
            "I am working / She is working",
            "I am not working / She isn't working",
            "Are you working? / Is she working?"
          ],
          [
            "Short answers",
            "Yes, I do / Yes, she does",
            "No, I don't / No, she doesn't",
            "Yes, I am / No, he isn't"
          ]
        ]
      },
      {
        "title": "Typical clues",
        "headers": [
          "Use",
          "Common words",
          "Example"
        ],
        "rows": [
          [
            "Habit or routine",
            "usually, always, every day, on Fridays",
            "What do you do on Friday evenings?"
          ],
          [
            "Now",
            "now, at the moment, today",
            "How is the match going?"
          ],
          [
            "Temporary situation",
            "this week, these days, at the moment",
            "I'm working on a project this week."
          ],
          [
            "State",
            "want, need, know, like, sound",
            "Do you need help?"
          ]
        ]
      }
    ],
    "exampleGroups": [
      {
        "title": "Present Simple",
        "items": [
          "How do your kids get to school every day?",
          "Do you fancy joining our book group?",
          "What does he do every day?"
        ]
      },
      {
        "title": "Present Continuous",
        "items": [
          "Who is winning?",
          "Why are those people standing there?",
          "Is your brother enjoying his new job?"
        ]
      },
      {
        "title": "Common contrast",
        "items": [
          "I usually visit my parents on Saturdays, but I'm visiting my aunt this Saturday.",
          "She works in a bank, but today she is working from home.",
          "He wants to talk now, but he is not saying much."
        ]
      }
    ],
    "commonMistakes": [
      "Do you doing homework? ✗ → Are you doing homework? ✓. Для действия сейчас нужен be + V-ing.",
      "Does he enjoys it? ✗ → Does he enjoy it? ✓. После does глагол идёт без -s.",
      "I am knowing the answer ✗ → I know the answer ✓. Know обычно описывает состояние.",
      "She work every day ✗ → She works every day ✓. В Present Simple с he/she/it добавляем -s.",
      "Are you fancy joining us? ✗ → Do you fancy joining us? ✓. Fancy в значении 'хотеть / быть не против' обычно идёт в Present Simple."
    ],
    "exercises": [
      {
        "id": "present-simple-continuous-step-1",
        "type": "exercise",
        "title": "Choose the tense",
        "difficulty": "Easy",
        "instructions": "Выбери, какое время лучше подходит по смыслу.",
        "items": [
          {
            "id": "1",
            "input": "single",
            "prompt": "What ___ you usually do on Friday evenings?",
            "options": [
              "do",
              "are"
            ],
            "answer": 0
          },
          {
            "id": "2",
            "input": "single",
            "prompt": "Why ___ you crying?",
            "options": [
              "do",
              "are"
            ],
            "answer": 1
          },
          {
            "id": "3",
            "input": "single",
            "prompt": "She ___ coffee every morning.",
            "options": [
              "drinks",
              "is drinking"
            ],
            "answer": 0
          },
          {
            "id": "4",
            "input": "single",
            "prompt": "Listen! The phone ___ .",
            "options": [
              "rings",
              "is ringing"
            ],
            "answer": 1
          }
        ]
      },
      {
        "id": "present-simple-continuous-step-2",
        "type": "exercise",
        "title": "Complete the gap",
        "difficulty": "Medium",
        "instructions": "Впиши правильную форму в пропуск.",
        "items": [
          {
            "id": "1",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "How's the lesson ",
              "?"
            ],
            "answers": [
              [
                "going"
              ]
            ]
          },
          {
            "id": "2",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "What time ",
              " she start work?"
            ],
            "answers": [
              [
                "does"
              ]
            ]
          },
          {
            "id": "3",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "They ",
              " dinner at the moment."
            ],
            "answers": [
              [
                "are having"
              ]
            ]
          },
          {
            "id": "4",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "He ",
              " help right now."
            ],
            "answers": [
              [
                "needs"
              ]
            ]
          }
        ]
      },
      {
        "id": "present-simple-continuous-step-3",
        "type": "exercise",
        "title": "Choose the correct question",
        "difficulty": "Medium+",
        "instructions": "Выбери правильный вопрос.",
        "items": [
          {
            "id": "1",
            "input": "select",
            "prompt": "Where / you / go / now?",
            "options": [
              "Where do you go now?",
              "Where are you going now?"
            ],
            "answer": 1
          },
          {
            "id": "2",
            "input": "select",
            "prompt": "What / he / do / every day?",
            "options": [
              "What is he doing every day?",
              "What does he do every day?"
            ],
            "answer": 1
          },
          {
            "id": "3",
            "input": "select",
            "prompt": "Why / they / stand / there?",
            "options": [
              "Why are they standing there?",
              "Why do they stand there?"
            ],
            "answer": 0
          },
          {
            "id": "4",
            "input": "select",
            "prompt": "Do / you / want / to talk?",
            "options": [
              "Are you wanting to talk?",
              "Do you want to talk?"
            ],
            "answer": 1
          }
        ]
      },
      {
        "id": "present-simple-continuous-step-4",
        "type": "exercise",
        "title": "Build the answer",
        "difficulty": "Hard",
        "instructions": "Впиши полную форму или полное предложение.",
        "items": [
          {
            "id": "1",
            "input": "text",
            "prompt": "Usually he drives to work, but today he ___ by bus. (go)",
            "answer": "is going"
          },
          {
            "id": "2",
            "input": "text",
            "prompt": "I can't talk now. I ___ for my exam. (prepare)",
            "answer": "am preparing",
            "acceptedAnswers": [
              "am preparing",
              "I'm preparing"
            ]
          },
          {
            "id": "3",
            "input": "text",
            "prompt": "Make a sentence: she / love / this song.",
            "answer": "She loves this song.",
            "acceptedAnswers": [
              "She loves this song.",
              "She loves this song"
            ]
          },
          {
            "id": "4",
            "input": "text",
            "prompt": "Make a question: why / he / look / so nervous today?",
            "answer": "Why does he look so nervous today?",
            "acceptedAnswers": [
              "Why does he look so nervous today?",
              "Why does he look so nervous today"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "grammar-ing-ed-adjectives",
    "number": 5,
    "order": 5,
    "title": "-ing / -ed adjectives",
    "shortTitle": "-ing / -ed adjectives",
    "subtitle": "Choose -ed for a person's feeling and -ing for the thing, person or situation that causes the feeling.",
    "level": "B1",
    "status": "published",
    "page": "grammar-topic.html?id=grammar-ing-ed-adjectives",
    "linkedLessonId": "lesson-6",
    "passed": false,
    "attempts": 0,
    "passScore": 80,
    "explanation": "У этих прилагательных есть две разные роли. Форма -ed говорит о чувстве человека: I am bored = мне скучно. Форма -ing описывает причину этого чувства: This book is boring = эта книга скучная, она вызывает скуку. Сначала задай вопрос: кто чувствует? Если человек чувствует, обычно нужен -ed. Что вызывает чувство? Если предмет, ситуация или человек производит впечатление, нужен -ing.",
    "formula": "-ed = I feel this · -ing = it makes me feel this",
    "visual": {
      "src": "assets/grammar/ing-ed-adjectives.png",
      "alt": "Visual explanation of -ed and -ing adjectives: I am bored, this book is boring.",
      "caption": "-ed описывает чувство человека. -ing описывает предмет, ситуацию или человека, который вызывает это чувство."
    },
    "glanceCards": [
      {
        "icon": "🙂",
        "label": "-ed",
        "hint": "если говорим о своих чувствах",
        "pattern": "person + be / feel + -ed",
        "example": "I am bored. She felt relaxed."
      },
      {
        "icon": "📘",
        "label": "-ing",
        "hint": "если описываем причину чувства",
        "pattern": "thing / situation + be + -ing",
        "example": "This book is boring. The trip was relaxing."
      },
      {
        "icon": "❓",
        "label": "Question 1",
        "hint": "Who feels it?",
        "pattern": "I / she / they / people -> -ed",
        "example": "They were confused."
      },
      {
        "icon": "🎯",
        "label": "Question 2",
        "hint": "What causes it?",
        "pattern": "film / lesson / news / result -> -ing",
        "example": "The explanation was confusing."
      }
    ],
    "anchorLinks": [
      {
        "id": "grammar-at-a-glance",
        "title": "Quick overview"
      },
      {
        "id": "grammar-rule-map",
        "title": "Rule map"
      },
      {
        "id": "grammar-tables",
        "title": "Tables"
      },
      {
        "id": "grammar-examples",
        "title": "Examples"
      },
      {
        "id": "grammar-mistakes",
        "title": "Common mistakes"
      },
      {
        "id": "grammar-practice-section",
        "title": "Practice"
      }
    ],
    "miniRules": [
      {
        "title": "1. Найди человека, который чувствует",
        "text": "Если слово описывает состояние человека, ставим -ed. Это ответ на вопрос: How does the person feel?",
        "example": "I was disappointed. = Я был/была расстроен(а)."
      },
      {
        "title": "2. Найди причину чувства",
        "text": "Если слово описывает предмет, ситуацию, новость, урок, фильм или результат, ставим -ing. Это ответ на вопрос: What is it like?",
        "example": "The result was disappointing. = Результат был разочаровывающим."
      },
      {
        "title": "3. Один корень - две формы",
        "text": "Обычно пара строится от одного глагола: bore -> bored / boring, interest -> interested / interesting, excite -> excited / exciting.",
        "example": "I am interested in the story because the story is interesting."
      },
      {
        "title": "4. Не переводи дословно с русского",
        "text": "Русское “мне скучно” переводится как I am bored. I am boring значит “я скучный/скучная” для других людей.",
        "example": "I am bored because the film is boring."
      }
    ],
    "tables": [
      {
        "title": "Meaning contrast",
        "headers": [
          "Ending",
          "Meaning",
          "Typical subject",
          "Example"
        ],
        "rows": [
          [
            "-ing",
            "causes the feeling",
            "book, film, lesson, story, result, person",
            "The story was inspiring."
          ],
          [
            "-ed",
            "feels the emotion",
            "I, you, he, she, people",
            "We were inspired by the story."
          ]
        ]
      },
      {
        "title": "Common pairs",
        "headers": [
          "Verb",
          "-ing adjective",
          "-ed adjective"
        ],
        "rows": [
          [
            "interest",
            "interesting",
            "interested"
          ],
          [
            "bore",
            "boring",
            "bored"
          ],
          [
            "annoy",
            "annoying",
            "annoyed"
          ],
          [
            "embarrass",
            "embarrassing",
            "embarrassed"
          ],
          [
            "exhaust",
            "exhausting",
            "exhausted"
          ]
        ]
      }
    ],
    "exampleGroups": [
      {
        "title": "-ing: cause of the feeling",
        "items": [
          "The book is boring. = The book makes me bored.",
          "The music was relaxing. = The music made me relaxed.",
          "The exam grade was disappointing. = The grade made me disappointed."
        ]
      },
      {
        "title": "-ed: person's feeling",
        "items": [
          "I am bored. = I feel bored.",
          "She was shocked by the result. = She felt shocked.",
          "They were confused at the end of the lesson. = They felt confused."
        ]
      },
      {
        "title": "Both forms in one sentence",
        "items": [
          "I was bored because the film was boring.",
          "He felt embarrassed because the situation was embarrassing.",
          "We were excited because the plan was exciting."
        ]
      }
    ],
    "commonMistakes": [
      "I am boring ✗ → I am bored ✓. Если ты чувствуешь скуку, нужен -ed.",
      "The film was bored ✗ → The film was boring ✓. Фильм вызывает чувство, поэтому -ing.",
      "I was confusing ✗ → I was confused ✓. Человек обычно confused, ситуация confusing.",
      "The trip was exhausted ✗ → The trip was exhausting ✓. Поездка утомляет, человек exhausted.",
      "I am interested in the characters ✓. После interested часто используется in."
    ],
    "exercises": [
      {
        "id": "ing-ed-step-1",
        "type": "exercise",
        "title": "Choose the meaning",
        "difficulty": "Easy",
        "instructions": "Выбери, что описывает прилагательное.",
        "items": [
          {
            "id": "1",
            "input": "single",
            "prompt": "boring",
            "options": [
              "cause",
              "feeling"
            ],
            "answer": 0
          },
          {
            "id": "2",
            "input": "single",
            "prompt": "bored",
            "options": [
              "cause",
              "feeling"
            ],
            "answer": 1
          },
          {
            "id": "3",
            "input": "single",
            "prompt": "annoying",
            "options": [
              "cause",
              "feeling"
            ],
            "answer": 0
          },
          {
            "id": "4",
            "input": "single",
            "prompt": "annoyed",
            "options": [
              "cause",
              "feeling"
            ],
            "answer": 1
          }
        ]
      },
      {
        "id": "ing-ed-step-2",
        "type": "exercise",
        "title": "Choose the adjective",
        "difficulty": "Medium",
        "instructions": "Выбери правильное прилагательное.",
        "items": [
          {
            "id": "1",
            "input": "select",
            "prompt": "The ending was ___ .",
            "options": [
              "disappointed",
              "disappointing"
            ],
            "answer": 1
          },
          {
            "id": "2",
            "input": "select",
            "prompt": "I was ___ when I saw the scenery.",
            "options": [
              "surprised",
              "surprising"
            ],
            "answer": 0
          },
          {
            "id": "3",
            "input": "select",
            "prompt": "The lesson was ___ .",
            "options": [
              "confused",
              "confusing"
            ],
            "answer": 1
          },
          {
            "id": "4",
            "input": "select",
            "prompt": "She felt ___ after the journey.",
            "options": [
              "exhausted",
              "exhausting"
            ],
            "answer": 0
          }
        ]
      },
      {
        "id": "ing-ed-step-3",
        "type": "exercise",
        "title": "Complete the form",
        "difficulty": "Medium+",
        "instructions": "Впиши форму adjective from the verb in brackets.",
        "items": [
          {
            "id": "1",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "It was an ",
              " programme. (interest)"
            ],
            "answers": [
              [
                "interesting"
              ]
            ]
          },
          {
            "id": "2",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "I felt ",
              " after the trip. (exhaust)"
            ],
            "answers": [
              [
                "exhausted"
              ]
            ]
          },
          {
            "id": "3",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "The news was ",
              " . (shock)"
            ],
            "answers": [
              [
                "shocking"
              ]
            ]
          },
          {
            "id": "4",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "He was very ",
              " by the problem. (confuse)"
            ],
            "answers": [
              [
                "confused"
              ]
            ]
          }
        ]
      },
      {
        "id": "ing-ed-step-4",
        "type": "exercise",
        "title": "Use both forms",
        "difficulty": "Hard",
        "instructions": "Впиши две формы: -ed for the feeling and -ing for the cause.",
        "items": [
          {
            "id": "1",
            "input": "text",
            "prompt": "I was ___ because the film was ___ . (bore)",
            "answer": "bored, boring",
            "acceptedAnswers": [
              "bored, boring",
              "bored boring"
            ]
          },
          {
            "id": "2",
            "input": "text",
            "prompt": "She felt ___ because the situation was ___ . (embarrass)",
            "answer": "embarrassed, embarrassing",
            "acceptedAnswers": [
              "embarrassed, embarrassing",
              "embarrassed embarrassing"
            ]
          },
          {
            "id": "3",
            "input": "text",
            "prompt": "We were ___ because the plan was ___ . (excite)",
            "answer": "excited, exciting",
            "acceptedAnswers": [
              "excited, exciting",
              "excited exciting"
            ]
          },
          {
            "id": "4",
            "input": "text",
            "prompt": "They were ___ because the explanation was ___ . (confuse)",
            "answer": "confused, confusing",
            "acceptedAnswers": [
              "confused, confusing",
              "confused confusing"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "grammar-future-plans",
    "number": 6,
    "order": 6,
    "title": "Future plans",
    "shortTitle": "Future plans",
    "subtitle": "Choose between going to, present continuous, might, will probably and have got to.",
    "level": "B1",
    "status": "published",
    "linkedLessonId": "lesson-7",
    "page": "grammar-topic.html?id=grammar-future-plans",
    "passed": false,
    "attempts": 0,
    "passScore": 80,
    "explanation": "В английском мы выбираем форму будущего не просто по слову 'буду', а по тому, насколько план уже решён. Если это твёрдый план или намерение - чаще be going to. Если это договорённость с конкретным временем - present continuous. Если это только возможность - might. Если это прогноз или ожидание - will probably. Если это обязанность или необходимость - have got to или must.",
    "formula": "be going to = plan/intention · Present Continuous = arrangement · might = possible plan · will probably = prediction · have got to/must = obligation",
    "glanceCards": [
      {
        "icon": "🧭",
        "label": "be going to",
        "hint": "план или намерение",
        "pattern": "am/is/are + going to + V1",
        "example": "We are going to be away in June."
      },
      {
        "icon": "📅",
        "label": "Present Continuous",
        "hint": "личная договорённость, уже организовано",
        "pattern": "am/is/are + V-ing",
        "example": "I'm having lunch with James today."
      },
      {
        "icon": "❔",
        "label": "might",
        "hint": "возможно, но не точно",
        "pattern": "might + V1",
        "example": "I might try couch-surfing this year."
      },
      {
        "icon": "✅",
        "label": "have got to / must",
        "hint": "нужно, есть обязанность",
        "pattern": "have/has got to + V1",
        "example": "I've got to revise for my exams."
      }
    ],
    "anchorLinks": [
      {
        "id": "grammar-at-a-glance",
        "title": "Quick overview"
      },
      {
        "id": "grammar-rule-map",
        "title": "Rule map"
      },
      {
        "id": "grammar-tables",
        "title": "Tables"
      },
      {
        "id": "grammar-examples",
        "title": "Examples"
      },
      {
        "id": "grammar-mistakes",
        "title": "Common mistakes"
      },
      {
        "id": "grammar-practice-section",
        "title": "Practice"
      }
    ],
    "miniRules": [
      {
        "title": "1. Use be going to for plans and intentions",
        "text": "Если человек уже решил что-то сделать, но это не обязательно точная встреча в календаре, используй be going to.",
        "example": "We're going to stay in a hotel near the beach."
      },
      {
        "title": "2. Use present continuous for arrangements",
        "text": "Если действие уже организовано: встреча, поездка, бронь, конкретное время - часто нужен present continuous.",
        "example": "I'm meeting Anna at six."
      },
      {
        "title": "3. Use might when the plan is not certain",
        "text": "Might показывает возможность: человек рассматривает идею, но ещё не решил окончательно.",
        "example": "We might go camping if the weather is good."
      },
      {
        "title": "4. Use will probably for predictions and have got to for necessity",
        "text": "Will probably - когда ты ожидаешь, что что-то случится. Have got to / must - когда нужно что-то сделать.",
        "example": "It'll probably take ages. I've got to pay him back."
      }
    ],
    "tables": [
      {
        "title": "Which future form do I need?",
        "headers": [
          "Meaning",
          "Form",
          "Example"
        ],
        "rows": [
          [
            "plan / intention",
            "am/is/are going to + verb",
            "They are going to travel in July."
          ],
          [
            "fixed arrangement",
            "am/is/are + verb-ing",
            "I'm seeing the doctor tomorrow."
          ],
          [
            "possible plan",
            "might + verb",
            "She might join us later."
          ],
          [
            "prediction",
            "will probably + verb",
            "It will probably be too cold."
          ],
          [
            "necessity",
            "have/has got to + verb",
            "I've got to revise tonight."
          ]
        ]
      },
      {
        "title": "Statements, negatives and questions",
        "headers": [
          "Form",
          "Positive",
          "Negative",
          "Question"
        ],
        "rows": [
          [
            "be going to",
            "I'm going to leave.",
            "I'm not going to leave.",
            "Are you going to leave?"
          ],
          [
            "present continuous",
            "I'm meeting Dan.",
            "I'm not meeting Dan.",
            "Are you meeting Dan?"
          ],
          [
            "might",
            "I might go.",
            "I might not go.",
            "Might you go? / Are you likely to go?"
          ],
          [
            "will probably",
            "It'll probably rain.",
            "It probably won't rain.",
            "Do you think it'll rain?"
          ],
          [
            "have got to",
            "I've got to work.",
            "I haven't got to work.",
            "Have you got to work?"
          ]
        ]
      }
    ],
    "exampleGroups": [
      {
        "title": "Plans and arrangements",
        "items": [
          "We're going to be away in June.",
          "I'm having lunch with James today.",
          "They're going to visit Mexico this year."
        ]
      },
      {
        "title": "Uncertain plans and predictions",
        "items": [
          "I might not go away at all.",
          "It'll probably be another very hot summer.",
          "The appointment will probably take ages."
        ]
      },
      {
        "title": "Necessity",
        "items": [
          "I've got to pay him back.",
          "She's got to revise for her exams.",
          "We must book the tickets today."
        ]
      }
    ],
    "commonMistakes": [
      "I must to pay him back ✗ → I must pay him back ✓. После must глагол идёт без to.",
      "I am thinking to go ✗ → I am thinking of going ✓. После thinking используем of + -ing.",
      "I will probably to stay ✗ → I will probably stay ✓. После will нужен глагол без to.",
      "Where do you go on holiday this year? ✗ → Where are you going on holiday this year? ✓ Если речь о конкретном плане на этот год, нужен future plan, а не привычка.",
      "I'm not going to be here and I'm spending two months in Australia. Present continuous подходит, потому что поездка уже организована."
    ],
    "exercises": [
      {
        "id": "future-plans-step-1",
        "type": "exercise",
        "title": "Choose the meaning",
        "difficulty": "Easy",
        "instructions": "Выбери, что показывает выделенная форма.",
        "items": [
          {
            "id": "1",
            "input": "single",
            "prompt": "I'm having lunch with James today.",
            "options": [
              "a fixed arrangement",
              "a general habit",
              "an obligation"
            ],
            "answer": 0,
            "explanation": "Present continuous показывает уже организованную встречу."
          },
          {
            "id": "2",
            "input": "single",
            "prompt": "I might go camping this summer.",
            "options": [
              "a certain plan",
              "a possible plan",
              "a rule"
            ],
            "answer": 1,
            "explanation": "Might значит 'возможно'."
          },
          {
            "id": "3",
            "input": "single",
            "prompt": "I've got to revise tonight.",
            "options": [
              "necessity",
              "prediction",
              "invitation"
            ],
            "answer": 0,
            "explanation": "Have got to показывает необходимость."
          },
          {
            "id": "4",
            "input": "single",
            "prompt": "It'll probably be very crowded.",
            "options": [
              "prediction",
              "arrangement",
              "past event"
            ],
            "answer": 0,
            "explanation": "Will probably показывает прогноз."
          }
        ]
      },
      {
        "id": "future-plans-step-2",
        "type": "exercise",
        "title": "Complete the form",
        "difficulty": "Medium",
        "instructions": "Впиши правильную форму.",
        "items": [
          {
            "id": "1",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "We ",
              " visit the old town tomorrow. (going)"
            ],
            "answers": [
              [
                "are going to",
                "'re going to"
              ]
            ],
            "explanation": "We are going to + verb."
          },
          {
            "id": "2",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "She ",
              " dinner with friends tonight. (have)"
            ],
            "answers": [
              [
                "is having",
                "'s having"
              ]
            ],
            "explanation": "Present continuous для договорённости."
          },
          {
            "id": "3",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "I ",
              " not go away this year. (might)"
            ],
            "answers": [
              [
                "might"
              ]
            ],
            "explanation": "После might сразу идёт verb."
          },
          {
            "id": "4",
            "input": "gaps",
            "prompt": "Complete the sentence.",
            "segments": [
              "He ",
              " pay for the tickets today. (got)"
            ],
            "answers": [
              [
                "has got to",
                "'s got to"
              ]
            ],
            "explanation": "He has got to + verb."
          }
        ]
      },
      {
        "id": "future-plans-step-3",
        "type": "exercise",
        "title": "Choose the best future form",
        "difficulty": "Medium+",
        "instructions": "Выбери форму, которая лучше подходит по смыслу.",
        "items": [
          {
            "id": "1",
            "input": "select",
            "prompt": "Where ___ on holiday this year?",
            "options": [
              "do you go",
              "are you going",
              "you must go"
            ],
            "answer": 1,
            "explanation": "This year = конкретный план, поэтому are you going."
          },
          {
            "id": "2",
            "input": "select",
            "prompt": "I'm not sure. I ___ stay at home.",
            "options": [
              "might",
              "am having",
              "have got"
            ],
            "answer": 0,
            "explanation": "I'm not sure = might."
          },
          {
            "id": "3",
            "input": "select",
            "prompt": "The bus ___ probably take ages.",
            "options": [
              "is",
              "will",
              "has got to"
            ],
            "answer": 1,
            "explanation": "Will probably = прогноз."
          },
          {
            "id": "4",
            "input": "select",
            "prompt": "I'm thinking ___ travelling this summer.",
            "options": [
              "to go",
              "of going",
              "go"
            ],
            "answer": 1,
            "explanation": "Правильно: thinking of + -ing."
          }
        ]
      },
      {
        "id": "future-plans-step-4",
        "type": "exercise",
        "title": "Rewrite the idea",
        "difficulty": "Hard",
        "instructions": "Перепиши предложение, сохранив смысл.",
        "items": [
          {
            "id": "1",
            "input": "text",
            "prompt": "Perhaps I'll try couch-surfing this year. Use might.",
            "answer": "I might try couch-surfing this year",
            "acceptedAnswers": [
              "I might try couch-surfing this year",
              "I might try couch-surfing this year.",
              "I might try couch surfing this year",
              "I might try couch surfing this year."
            ],
            "explanation": "Might заменяет perhaps."
          },
          {
            "id": "2",
            "input": "text",
            "prompt": "I have to revise for my exams. Use got.",
            "answer": "I've got to revise for my exams",
            "acceptedAnswers": [
              "I've got to revise for my exams",
              "I've got to revise for my exams.",
              "I have got to revise for my exams",
              "I have got to revise for my exams."
            ],
            "explanation": "Have got to = have to."
          },
          {
            "id": "3",
            "input": "text",
            "prompt": "Jim might go travelling this summer. Use thinking.",
            "answer": "Jim is thinking of going travelling this summer",
            "acceptedAnswers": [
              "Jim is thinking of going travelling this summer",
              "Jim is thinking of going travelling this summer.",
              "Jim's thinking of going travelling this summer",
              "Jim's thinking of going travelling this summer.",
              "Jim is thinking of going traveling this summer",
              "Jim is thinking of going traveling this summer."
            ],
            "explanation": "Thinking of + -ing."
          },
          {
            "id": "4",
            "input": "text",
            "prompt": "They definitely won't be on holiday in July. Use going.",
            "answer": "They definitely aren't going on holiday in July",
            "acceptedAnswers": [
              "They definitely aren't going on holiday in July",
              "They definitely aren't going on holiday in July.",
              "They are definitely not going on holiday in July",
              "They are definitely not going on holiday in July."
            ],
            "explanation": "Negative be going to: aren't going to / aren't going on holiday."
          }
        ]
      }
    ]
  },
  {
    "id": "grammar-habit-and-frequency",
    "number": 7,
    "order": 7,
    "title": "Habit and frequency",
    "shortTitle": "Habit and frequency",
    "subtitle": "Ask how often something happens and talk about past and present habits.",
    "level": "B1",
    "status": "published",
    "linkedLessonId": "lesson-8",
    "page": "grammar-topic.html?id=grammar-habit-and-frequency",
    "passed": false,
    "attempts": 0,
    "passScore": 80,
    "explanation": "Habit and frequency helps you talk about regular actions: how often you do something now, whether you ever do it, and what you did regularly in the past. Use present simple for current habits, adverbs of frequency for how often, and used to for past habits that are no longer true.",
    "formula": "How often do you ...? · Do you ever ...? · I hardly ever / often / usually ... · I used to ...",
    "glanceCards": [
      {
        "icon": "🔁",
        "label": "Present habits",
        "hint": "regular actions now",
        "pattern": "present simple",
        "example": "I go clubbing at least three times a week."
      },
      {
        "icon": "❓",
        "label": "Frequency questions",
        "hint": "ask how often",
        "pattern": "How often do you + verb?",
        "example": "How often do you eat out?"
      },
      {
        "icon": "⏱️",
        "label": "Frequency words",
        "hint": "say how often",
        "pattern": "always / often / hardly ever / never",
        "example": "I hardly ever listen to music now."
      },
      {
        "icon": "↩️",
        "label": "Past habits",
        "hint": "regular in the past, not now",
        "pattern": "used to + verb",
        "example": "I used to have loads of free time."
      }
    ],
    "anchorLinks": [
      {
        "id": "grammar-at-a-glance",
        "title": "Quick overview"
      },
      {
        "id": "grammar-rule-map",
        "title": "Rule map"
      },
      {
        "id": "grammar-tables",
        "title": "Tables"
      },
      {
        "id": "grammar-examples",
        "title": "Examples"
      },
      {
        "id": "grammar-mistakes",
        "title": "Common mistakes"
      },
      {
        "id": "grammar-practice-section",
        "title": "Practice"
      }
    ],
    "miniRules": [
      {
        "title": "1. Use present simple for habits now",
        "text": "For routines and regular activities, use the present simple.",
        "example": "I play tennis on Saturdays."
      },
      {
        "title": "2. Ask frequency with How often",
        "text": "How often asks about the number of times something happens.",
        "example": "How often do you go to the gym?"
      },
      {
        "title": "3. Use ever in questions",
        "text": "Ever means at any time and is common in questions about habits.",
        "example": "Do you ever work weekends?"
      },
      {
        "title": "4. Use used to for past habits",
        "text": "Used to shows something was regular or true in the past but is different now.",
        "example": "I used to take every weekend off."
      }
    ],
    "tables": [
      {
        "title": "Current habits",
        "headers": [
          "Use",
          "Form",
          "Example"
        ],
        "rows": [
          [
            "regular action now",
            "present simple",
            "I go walking whenever I can."
          ],
          [
            "frequency question",
            "How often do you + verb?",
            "How often do you eat out?"
          ],
          [
            "ever question",
            "Do you ever + verb?",
            "Do you ever play golf?"
          ],
          [
            "frequency answer",
            "frequency phrase",
            "About once every two months."
          ]
        ]
      },
      {
        "title": "Past habits with used to",
        "headers": [
          "Meaning",
          "Form",
          "Example"
        ],
        "rows": [
          [
            "past habit, not now",
            "used to + verb",
            "I used to have loads of time."
          ],
          [
            "past repeated action",
            "used to + verb",
            "I used to spend weekends with my family."
          ],
          [
            "single finished past event",
            "past simple, not used to",
            "I worked late one day last week."
          ]
        ]
      }
    ],
    "exampleGroups": [
      {
        "title": "Frequency questions",
        "items": [
          "How often do you eat out?",
          "Do you ever work weekends?",
          "How often do you go walking in the country?"
        ]
      },
      {
        "title": "Frequency answers",
        "items": [
          "All the time.",
          "Quite often.",
          "Hardly ever.",
          "Never."
        ]
      },
      {
        "title": "Past habits",
        "items": [
          "I used to take every weekend off.",
          "My colleagues used to leave work on time.",
          "I used to spend all weekend with my family."
        ]
      }
    ],
    "commonMistakes": [
      "How often you eat out? ✗ → How often do you eat out? ✓",
      "Do you go ever clubbing? ✗ → Do you ever go clubbing? ✓",
      "I was used to have free time ✗ → I used to have free time ✓",
      "I used to worked late ✗ → I used to work late ✓",
      "Do not use used to for one single finished event: I worked late one day last week."
    ],
    "exercises": [
      {
        "id": "habit-frequency-step-1",
        "type": "exercise",
        "title": "Choose the right question form",
        "difficulty": "Easy",
        "instructions": "Выбери правильный вопрос о привычках.",
        "items": [
          {
            "id": "1",
            "input": "single",
            "prompt": "___ do you eat out?",
            "options": [
              "How often",
              "How much",
              "How long"
            ],
            "answer": 0,
            "explanation": "How often asks about frequency."
          },
          {
            "id": "2",
            "input": "single",
            "prompt": "___ you ever work weekends?",
            "options": [
              "Do",
              "Are",
              "Have"
            ],
            "answer": 0,
            "explanation": "Present simple questions use do/does."
          },
          {
            "id": "3",
            "input": "single",
            "prompt": "How often ___ go walking?",
            "options": [
              "you do",
              "do you",
              "are you"
            ],
            "answer": 1,
            "explanation": "Question order: do + subject + verb."
          },
          {
            "id": "4",
            "input": "single",
            "prompt": "Do you ever ___ golf?",
            "options": [
              "play",
              "playing",
              "played"
            ],
            "answer": 0,
            "explanation": "After do, use the base verb."
          }
        ]
      },
      {
        "id": "habit-frequency-step-2",
        "type": "exercise",
        "title": "Complete with frequency words",
        "difficulty": "Medium",
        "instructions": "Впиши подходящее слово или фразу.",
        "items": [
          {
            "id": "1",
            "input": "gaps",
            "prompt": "Complete the answer.",
            "segments": [
              "I listen to music all ",
              "."
            ],
            "answers": [
              "the time"
            ],
            "explanation": "All the time = very often."
          },
          {
            "id": "2",
            "input": "gaps",
            "prompt": "Complete the answer.",
            "segments": [
              "I ",
              " ever have the time."
            ],
            "answers": [
              "hardly"
            ],
            "explanation": "Hardly ever = almost never."
          },
          {
            "id": "3",
            "input": "gaps",
            "prompt": "Complete the answer.",
            "segments": [
              "Probably five times a week. Quite ",
              "."
            ],
            "answers": [
              "often"
            ],
            "explanation": "Quite often describes frequency."
          },
          {
            "id": "4",
            "input": "gaps",
            "prompt": "Complete the answer.",
            "segments": [
              "I listen to music nearly ",
              " day."
            ],
            "answers": [
              "every"
            ],
            "explanation": "Nearly every day = almost daily."
          }
        ]
      },
      {
        "id": "habit-frequency-step-3",
        "type": "exercise",
        "title": "Used to or past simple?",
        "difficulty": "Medium",
        "instructions": "Выбери, где можно использовать used to.",
        "items": [
          {
            "id": "1",
            "input": "single",
            "prompt": "When I was at school, I had loads of free time.",
            "options": [
              "used to have",
              "not possible"
            ],
            "answer": 0,
            "explanation": "This describes a past state that is different now."
          },
          {
            "id": "2",
            "input": "single",
            "prompt": "I worked from six until ten one day last week.",
            "options": [
              "used to work",
              "not possible"
            ],
            "answer": 1,
            "explanation": "One day last week is a single past event."
          },
          {
            "id": "3",
            "input": "single",
            "prompt": "My colleagues always left work on time.",
            "options": [
              "used to leave",
              "not possible"
            ],
            "answer": 0,
            "explanation": "Always shows a repeated past habit."
          },
          {
            "id": "4",
            "input": "single",
            "prompt": "I spent all weekend with my family before I started working.",
            "options": [
              "used to spend",
              "not possible"
            ],
            "answer": 0,
            "explanation": "This was a regular past habit."
          }
        ]
      },
      {
        "id": "habit-frequency-step-4",
        "type": "exercise",
        "title": "Rewrite the sentence",
        "difficulty": "Hard",
        "instructions": "Перепиши с правильной формой.",
        "items": [
          {
            "id": "1",
            "input": "text",
            "prompt": "Ask about eating out. Use How often.",
            "answer": "How often do you eat out?",
            "acceptedAnswers": [
              "How often do you eat out?",
              "How often do you eat out"
            ],
            "explanation": "Use do + subject + base verb."
          },
          {
            "id": "2",
            "input": "text",
            "prompt": "Ask about weekend work. Use ever.",
            "answer": "Do you ever work weekends?",
            "acceptedAnswers": [
              "Do you ever work weekends?",
              "Do you ever work weekends"
            ],
            "explanation": "Ever goes before the main verb."
          },
          {
            "id": "3",
            "input": "text",
            "prompt": "Replace: I took every weekend off.",
            "answer": "I used to take every weekend off.",
            "acceptedAnswers": [
              "I used to take every weekend off.",
              "I used to take every weekend off"
            ],
            "explanation": "Used to + base verb."
          },
          {
            "id": "4",
            "input": "text",
            "prompt": "Replace: My colleagues always left work on time.",
            "answer": "My colleagues used to leave work on time.",
            "acceptedAnswers": [
              "My colleagues used to leave work on time.",
              "My colleagues used to leave work on time"
            ],
            "explanation": "Leave is the base verb after used to."
          }
        ]
      }
    ]
  }
];
