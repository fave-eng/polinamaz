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
  }
];
