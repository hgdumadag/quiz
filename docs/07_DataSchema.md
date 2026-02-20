# 7. Data Dictionary & JSON Schema Specification

## 7.1 Exam JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://example.com/schemas/exam.schema.json",
  "title": "Interactive Exam System - Exam Schema",
  "description": "Schema for exam definition JSON files",
  "type": "object",
  "required": ["examMetadata", "questions"],
  "properties": {
    "examMetadata": {
      "type": "object",
      "required": ["id", "title", "subject"],
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the exam",
          "pattern": "^[a-z0-9-]+$",
          "examples": ["stats-101-midterm", "audit-ai-week3"]
        },
        "title": {
          "type": "string",
          "description": "Human-readable exam title",
          "minLength": 1,
          "maxLength": 200,
          "examples": ["Statistics 101 - Midterm Exam"]
        },
        "subject": {
          "type": "string",
          "description": "Subject area or topic",
          "examples": ["Statistics", "Audit", "Mathematics"]
        },
        "description": {
          "type": "string",
          "description": "Optional detailed description",
          "maxLength": 1000
        },
        "version": {
          "type": "string",
          "description": "Exam version (semantic versioning)",
          "pattern": "^\\d+\\.\\d+(\\.\\d+)?$",
          "default": "1.0",
          "examples": ["1.0", "2.1.3"]
        },
        "author": {
          "type": "string",
          "description": "Exam creator name",
          "examples": ["George"]
        },
        "timeLimit": {
          "type": "integer",
          "description": "Time limit in minutes (Assessment Mode)",
          "minimum": 1,
          "maximum": 480,
          "examples": [60, 90, 120]
        },
        "passingScore": {
          "type": "number",
          "description": "Minimum percentage to pass",
          "minimum": 0,
          "maximum": 100,
          "default": 70,
          "examples": [70, 80, 85]
        },
        "allowedModes": {
          "type": "array",
          "description": "Which modes are enabled for this exam",
          "items": {
            "type": "string",
            "enum": ["practice", "assessment"]
          },
          "minItems": 1,
          "default": ["practice", "assessment"]
        }
      }
    },
    "questions": {
      "type": "array",
      "description": "Array of exam questions",
      "minItems": 1,
      "maxItems": 100,
      "items": {
        "type": "object",
        "required": ["id", "type", "question", "points"],
        "properties": {
          "id": {
            "type": "string",
            "description": "Unique question identifier within exam",
            "pattern": "^q[0-9]+$",
            "examples": ["q1", "q2", "q15"]
          },
          "type": {
            "type": "string",
            "description": "Question type",
            "enum": ["multiple-choice", "true-false", "short-answer", "long-answer"]
          },
          "category": {
            "type": "string",
            "description": "Topic or category",
            "examples": ["descriptive-stats", "probability", "hypothesis-testing"]
          },
          "difficulty": {
            "type": "string",
            "description": "Difficulty level",
            "enum": ["easy", "medium", "hard"]
          },
          "points": {
            "type": "integer",
            "description": "Points awarded for correct answer",
            "minimum": 1,
            "maximum": 20
          },
          "question": {
            "type": "string",
            "description": "The question text",
            "minLength": 1,
            "maxLength": 2000
          }
        },
        "allOf": [
          {
            "if": {
              "properties": {"type": {"const": "multiple-choice"}}
            },
            "then": {
              "required": ["options", "correctAnswer"],
              "properties": {
                "options": {
                  "type": "array",
                  "description": "Answer choices",
                  "minItems": 2,
                  "maxItems": 10,
                  "items": {"type": "string"}
                },
                "correctAnswer": {
                  "type": "integer",
                  "description": "Index of correct option (0-based)",
                  "minimum": 0
                },
                "explanation": {"type": "string"},
                "hints": {
                  "type": "array",
                  "items": {"type": "string"},
                  "maxItems": 3
                },
                "commonMistakes": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": ["misconception", "hint"],
                    "properties": {
                      "misconception": {"type": "string"},
                      "hint": {"type": "string"}
                    }
                  }
                }
              }
            }
          },
          {
            "if": {
              "properties": {"type": {"const": "true-false"}}
            },
            "then": {
              "required": ["correctAnswer"],
              "properties": {
                "correctAnswer": {
                  "type": "boolean",
                  "description": "True or False"
                },
                "explanation": {"type": "string"},
                "hints": {
                  "type": "array",
                  "items": {"type": "string"},
                  "maxItems": 3
                },
                "commonMistakes": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": ["misconception", "hint"],
                    "properties": {
                      "misconception": {"type": "string"},
                      "hint": {"type": "string"}
                    }
                  }
                }
              }
            }
          },
          {
            "if": {
              "properties": {"type": {"const": "short-answer"}}
            },
            "then": {
              "required": ["rubric", "expectedAnswer"],
              "properties": {
                "maxLength": {
                  "type": "integer",
                  "description": "Maximum character length",
                  "default": 200,
                  "minimum": 50,
                  "maximum": 500
                },
                "rubric": {
                  "type": "object",
                  "required": ["keyPoints"],
                  "properties": {
                    "keyPoints": {
                      "type": "array",
                      "description": "List of key points expected",
                      "items": {"type": "string"}
                    },
                    "gradingCriteria": {
                      "type": "object",
                      "properties": {
                        "correct": {"type": "string"},
                        "partial": {"type": "string"},
                        "incorrect": {"type": "string"}
                      }
                    }
                  }
                },
                "expectedAnswer": {
                  "type": "string",
                  "description": "Model answer"
                },
                "hints": {
                  "type": "array",
                  "items": {"type": "string"},
                  "maxItems": 3
                },
                "commonMistakes": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": ["pattern", "hint"],
                    "properties": {
                      "pattern": {"type": "string"},
                      "hint": {"type": "string"}
                    }
                  }
                }
              }
            }
          },
          {
            "if": {
              "properties": {"type": {"const": "long-answer"}}
            },
            "then": {
              "required": ["rubric", "expectedAnswer"],
              "properties": {
                "maxLength": {
                  "type": "integer",
                  "description": "Maximum character length",
                  "default": 500,
                  "minimum": 200,
                  "maximum": 2000
                },
                "rubric": {
                  "type": "object",
                  "required": ["keyPoints", "gradingCriteria"],
                  "properties": {
                    "keyPoints": {
                      "type": "array",
                      "description": "List of key points expected",
                      "items": {"type": "string"}
                    },
                    "gradingCriteria": {
                      "type": "object",
                      "required": ["excellent", "good", "satisfactory", "needs-improvement", "incorrect"],
                      "properties": {
                        "excellent": {"type": "string"},
                        "good": {"type": "string"},
                        "satisfactory": {"type": "string"},
                        "needs-improvement": {"type": "string"},
                        "incorrect": {"type": "string"}
                      }
                    }
                  }
                },
                "expectedAnswer": {
                  "type": "string",
                  "description": "Model answer"
                },
                "hints": {
                  "type": "array",
                  "items": {"type": "string"},
                  "maxItems": 3
                },
                "commonMistakes": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": ["pattern", "hint"],
                    "properties": {
                      "pattern": {"type": "string"},
                      "hint": {"type": "string"}
                    }
                  }
                }
              }
            }
          }
        ]
      }
    },
    "settings": {
      "type": "object",
      "description": "Optional exam-specific settings",
      "properties": {
        "shuffleQuestions": {
          "type": "boolean",
          "description": "Randomize question order",
          "default": false
        },
        "shuffleOptions": {
          "type": "boolean",
          "description": "Randomize MC/TF options",
          "default": false
        },
        "showProgressBar": {
          "type": "boolean",
          "default": true
        },
        "allowReview": {
          "type": "boolean",
          "description": "Allow reviewing questions before submit",
          "default": true
        },
        "practiceMode": {
          "type": "object",
          "properties": {
            "maxHintsPerQuestion": {
              "type": "integer",
              "minimum": 1,
              "maximum": 5,
              "default": 3
            },
            "showHintsProgressively": {
              "type": "boolean",
              "default": true
            },
            "allowUnlimitedAttempts": {
              "type": "boolean",
              "default": true
            }
          }
        },
        "assessmentMode": {
          "type": "object",
          "properties": {
            "oneAttemptOnly": {
              "type": "boolean",
              "default": true
            },
            "showResultsAfterSubmit": {
              "type": "boolean",
              "default": true
            },
            "allowReviewWithAnswers": {
              "type": "boolean",
              "default": true
            }
          }
        }
      }
    }
  }
}
```

## 7.2 Example Exam JSON

```json
{
  "examMetadata": {
    "id": "stats-101-midterm",
    "title": "Statistics 101 - Midterm Exam",
    "subject": "Statistics",
    "description": "Covers descriptive statistics and probability basics",
    "version": "1.0",
    "author": "George",
    "timeLimit": 60,
    "passingScore": 70,
    "allowedModes": ["practice", "assessment"]
  },
  
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "category": "descriptive-stats",
      "difficulty": "easy",
      "points": 2,
      "question": "What does the mean represent in a dataset?",
      "options": [
        "The middle value when data is ordered",
        "The arithmetic average of all values",
        "The most frequently occurring value",
        "The range of the dataset"
      ],
      "correctAnswer": 1,
      "explanation": "The mean is the arithmetic average, calculated by summing all values and dividing by the count.",
      "hints": [
        "Think about how you calculate this measure from all the data points",
        "It involves adding up all values and dividing",
        "It's also called the 'arithmetic average'"
      ],
      "commonMistakes": [
        {
          "misconception": "Confusing mean with median",
          "hint": "Mean uses ALL values equally, median only cares about the middle position"
        },
        {
          "misconception": "Confusing mean with mode",
          "hint": "Mean is calculated mathematically, mode is simply counted"
        }
      ]
    },
    
    {
      "id": "q2",
      "type": "true-false",
      "category": "probability",
      "difficulty": "medium",
      "points": 2,
      "question": "The probability of two independent events both occurring is found by adding their individual probabilities.",
      "correctAnswer": false,
      "explanation": "For independent events to BOTH occur, you MULTIPLY their probabilities. Addition is used for OR (either event occurring).",
      "hints": [
        "Think about the difference between AND vs OR in probability",
        "Review the multiplication rule for independent events",
        "Consider: if each event has 50% chance, would adding give you 100%?"
      ],
      "commonMistakes": [
        {
          "misconception": "Confusing AND (multiply) with OR (add)",
          "hint": "When BOTH events must occur, use multiplication. When EITHER can occur, use addition."
        }
      ]
    },
    
    {
      "id": "q3",
      "type": "short-answer",
      "category": "descriptive-stats",
      "difficulty": "medium",
      "points": 5,
      "maxLength": 200,
      "question": "Calculate the variance for this dataset: [2, 4, 6, 8, 10]. Show your work.",
      "rubric": {
        "keyPoints": [
          "Calculate mean (which is 6)",
          "Find squared deviations from mean",
          "Sum the squared deviations (should be 40)",
          "Divide by n (population) or n-1 (sample)",
          "Final answer: 8 (population) or 10 (sample)"
        ],
        "gradingCriteria": {
          "correct": "Shows all steps correctly, arrives at 8 or 10 with proper justification",
          "partial": "Correct method but arithmetic error, or correct answer without full work",
          "incorrect": "Wrong formula or major conceptual error"
        }
      },
      "expectedAnswer": "Mean = (2+4+6+8+10)/5 = 30/5 = 6. Squared deviations: (2-6)²=16, (4-6)²=4, (6-6)²=0, (8-6)²=4, (10-6)²=16. Sum = 40. Population variance = 40/5 = 8. Sample variance = 40/4 = 10.",
      "hints": [
        "Start by calculating the mean of all five numbers",
        "Remember: variance measures spread by using SQUARED deviations",
        "Did you square each deviation before averaging them?",
        "Check whether you need population variance (÷n) or sample variance (÷n-1)"
      ],
      "commonMistakes": [
        {
          "pattern": "forgot to square",
          "hint": "Variance uses SQUARED deviations, not absolute values. Did you square each difference?"
        },
        {
          "pattern": "wrong denominator",
          "hint": "Are you calculating population variance (÷5) or sample variance (÷4)? Both are valid if justified."
        },
        {
          "pattern": "calculation error",
          "hint": "Double-check your arithmetic. Verify each squared deviation: 16, 4, 0, 4, 16."
        }
      ]
    },
    
    {
      "id": "q4",
      "type": "long-answer",
      "category": "probability",
      "difficulty": "hard",
      "points": 10,
      "maxLength": 500,
      "question": "A company conducts quality checks on 1000 products. 3% are defective. If you randomly select 2 products without replacement, what is the probability that both are defective? Show your work and explain your reasoning clearly.",
      "rubric": {
        "keyPoints": [
          "Calculate number of defective products (30 out of 1000)",
          "Recognize this is conditional probability (without replacement)",
          "First selection: P(defective) = 30/1000",
          "Second selection: P(defective | first defective) = 29/999",
          "Multiply probabilities: (30/1000) × (29/999)",
          "Calculate final answer ≈ 0.000870 or 0.087%",
          "Explain reasoning step-by-step"
        ],
        "gradingCriteria": {
          "excellent": "All steps shown correctly, clear explanation, correct final answer (9-10 points)",
          "good": "Minor calculation error but method is correct, good explanation (7-8 points)",
          "satisfactory": "Correct approach but missing steps or unclear explanation (5-6 points)",
          "needs-improvement": "Incorrect method or major conceptual gap (1-4 points)",
          "incorrect": "Completely wrong approach or no work shown (0 points)"
        }
      },
      "expectedAnswer": "First, calculate defective products: 3% of 1000 = 0.03 × 1000 = 30 defective products. Since we're selecting without replacement, the probabilities change after the first selection. P(1st defective) = 30/1000 = 0.03. If the first is defective, there are now 29 defective products left out of 999 total. P(2nd defective | 1st defective) = 29/999 ≈ 0.029029. For BOTH events to occur, multiply: P(both defective) = (30/1000) × (29/999) = 870/999000 ≈ 0.0008709 or approximately 0.0871%.",
      "hints": [
        "First step: How many products out of 1000 are defective? Calculate 3% of 1000.",
        "After selecting one defective product, how many remain? How many total products remain?",
        "Remember: 'without replacement' means the second probability is affected by the first selection.",
        "For both events to happen, you need to multiply their probabilities."
      ],
      "commonMistakes": [
        {
          "pattern": "used 30/1000 twice",
          "hint": "After taking one defective product, both the numerator AND denominator change. You can't use 30/1000 for both selections."
        },
        {
          "pattern": "added instead of multiplied",
          "hint": "When BOTH events must occur (not just one or the other), multiply the probabilities."
        },
        {
          "pattern": "wrong percentage calculation",
          "hint": "3% of 1000 = 0.03 × 1000 = 30. Double-check your calculation of defective products."
        },
        {
          "pattern": "ignored without replacement",
          "hint": "The problem states 'without replacement' - this is crucial. The second probability must reflect one less defective product and one less total product."
        }
      ]
    }
  ],
  
  "settings": {
    "shuffleQuestions": false,
    "shuffleOptions": false,
    "showProgressBar": true,
    "allowReview": true,
    "practiceMode": {
      "maxHintsPerQuestion": 3,
      "showHintsProgressively": true,
      "allowUnlimitedAttempts": true
    },
    "assessmentMode": {
      "oneAttemptOnly": true,
      "showResultsAfterSubmit": true,
      "allowReviewWithAnswers": true
    }
  }
}
```

## 7.3 Data Dictionary

### Core Entities

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| **User** | Person using the system | userId, userName, role (student/admin) |
| **Exam** | Assessment containing questions | examId, title, subject, timeLimit |
| **Question** | Individual exam item | questionId, type, text, points |
| **ExamSession** | Instance of user taking exam | sessionId, userId, examId, mode |
| **QuestionResponse** | User's answer to a question | responseId, answer, isCorrect, feedback |
| **Result** | Final exam outcome | resultId, score, percentage, completionDate |

### Enumerations

| Enum | Values | Usage |
|------|--------|-------|
| **UserRole** | student, superadmin | Access control |
| **QuestionType** | multiple-choice, true-false, short-answer, long-answer | Question rendering |
| **ExamMode** | practice, assessment | Behavioral differences |
| **SessionStatus** | in-progress, completed, abandoned | Track completion |
| **Difficulty** | easy, medium, hard | Question classification |

### Relationships

```
User (1) ─── has ─── (N) ExamSession
Exam (1) ─── contains ─── (N) Question
ExamSession (1) ─── generates ─── (N) QuestionResponse
ExamSession (1) ─── produces ─── (1) Result
User (N) ─── assigned ─── (N) Exam  [Assignment table]
```

---

