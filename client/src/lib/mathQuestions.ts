export interface QuestionTemplate {
  grade: number;
  operation: "addition" | "subtraction" | "multiplication" | "division";
  minValue: number;
  maxValue: number;
  templates: string[];
}

export const questionTemplates: QuestionTemplate[] = [
  // Lower Primary (Grade 1-2)
  {
    grade: 1,
    operation: "addition",
    minValue: 1,
    maxValue: 10,
    templates: [
      "What is {a} + {b}?",
      "Add {a} and {b}",
      "If you have {a} apples and get {b} more, how many do you have?",
      "{a} plus {b} equals what?",
    ]
  },
  {
    grade: 1,
    operation: "subtraction",
    minValue: 1,
    maxValue: 10,
    templates: [
      "What is {a} - {b}?",
      "Subtract {b} from {a}",
      "If you have {a} toys and give away {b}, how many are left?",
      "{a} minus {b} equals what?",
    ]
  },

  // Upper Primary (Grade 3-4)
  {
    grade: 2,
    operation: "addition",
    minValue: 10,
    maxValue: 50,
    templates: [
      "Calculate {a} + {b}",
      "What is the sum of {a} and {b}?",
      "Add {a} to {b}",
      "{a} + {b} = ?",
    ]
  },
  {
    grade: 2,
    operation: "subtraction",
    minValue: 10,
    maxValue: 50,
    templates: [
      "Calculate {a} - {b}",
      "What is the difference between {a} and {b}?",
      "Subtract {b} from {a}",
      "{a} - {b} = ?",
    ]
  },
  {
    grade: 2,
    operation: "multiplication",
    minValue: 2,
    maxValue: 10,
    templates: [
      "What is {a} × {b}?",
      "Multiply {a} by {b}",
      "What is {a} times {b}?",
      "{a} × {b} = ?",
    ]
  },

  // Form 1 (Grade 5)
  {
    grade: 3,
    operation: "addition",
    minValue: 50,
    maxValue: 200,
    templates: [
      "Calculate {a} + {b}",
      "What is {a} plus {b}?",
      "Find the sum: {a} + {b}",
      "{a} + {b} = ?",
    ]
  },
  {
    grade: 3,
    operation: "multiplication",
    minValue: 10,
    maxValue: 15,
    templates: [
      "Calculate {a} × {b}",
      "What is {a} multiplied by {b}?",
      "Find the product: {a} × {b}",
      "{a} × {b} = ?",
    ]
  },
  {
    grade: 3,
    operation: "division",
    minValue: 2,
    maxValue: 12,
    templates: [
      "What is {dividend} ÷ {b}?",
      "Divide {dividend} by {b}",
      "How many times does {b} go into {dividend}?",
      "{dividend} ÷ {b} = ?",
    ]
  },

  // Form 2-4 (Grade 6-8)
  {
    grade: 4,
    operation: "addition",
    minValue: 100,
    maxValue: 1000,
    templates: [
      "Calculate {a} + {b}",
      "What is the sum of {a} and {b}?",
      "Add: {a} + {b}",
      "{a} + {b} = ?",
    ]
  },
  {
    grade: 4,
    operation: "multiplication",
    minValue: 15,
    maxValue: 25,
    templates: [
      "Calculate {a} × {b}",
      "What is {a} times {b}?",
      "Multiply: {a} × {b}",
      "{a} × {b} = ?",
    ]
  },
  {
    grade: 4,
    operation: "division",
    minValue: 5,
    maxValue: 20,
    templates: [
      "Calculate {dividend} ÷ {b}",
      "What is {dividend} divided by {b}?",
      "Divide: {dividend} ÷ {b}",
      "{dividend} ÷ {b} = ?",
    ]
  },
];

export function generateQuestion(grade: number, level: number = 1) {
  // Get templates for the grade
  const gradeTemplates = questionTemplates.filter(t => t.grade <= grade);
  if (gradeTemplates.length === 0) {
    throw new Error(`No templates found for grade ${grade}`);
  }

  // Select random template
  const template = gradeTemplates[Math.floor(Math.random() * gradeTemplates.length)];
  
  // Generate numbers based on difficulty level
  const difficultyMultiplier = Math.min(level * 0.5 + 1, 3);
  const minVal = Math.floor(template.minValue * difficultyMultiplier);
  const maxVal = Math.floor(template.maxValue * difficultyMultiplier);

  let a: number, b: number, answer: number, question: string;

  switch (template.operation) {
    case "addition":
      a = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
      b = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
      answer = a + b;
      question = template.templates[Math.floor(Math.random() * template.templates.length)]
        .replace("{a}", a.toString())
        .replace("{b}", b.toString());
      break;

    case "subtraction":
      a = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
      b = Math.floor(Math.random() * a) + 1; // Ensure positive result
      answer = a - b;
      question = template.templates[Math.floor(Math.random() * template.templates.length)]
        .replace("{a}", a.toString())
        .replace("{b}", b.toString());
      break;

    case "multiplication":
      a = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
      b = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
      answer = a * b;
      question = template.templates[Math.floor(Math.random() * template.templates.length)]
        .replace("{a}", a.toString())
        .replace("{b}", b.toString());
      break;

    case "division":
      b = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
      answer = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
      a = b * answer; // Ensure clean division
      question = template.templates[Math.floor(Math.random() * template.templates.length)]
        .replace("{dividend}", a.toString())
        .replace("{a}", a.toString())
        .replace("{b}", b.toString());
      break;

    default:
      throw new Error(`Unknown operation: ${template.operation}`);
  }

  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    question,
    answer,
    difficulty: level,
    operation: template.operation,
    grade: template.grade
  };
}

export function getWeakAreas(recentAnswers: Array<{ operation: string; correct: boolean }>) {
  const operationStats: { [key: string]: { total: number; correct: number } } = {};
  
  recentAnswers.forEach(({ operation, correct }) => {
    if (!operationStats[operation]) {
      operationStats[operation] = { total: 0, correct: 0 };
    }
    operationStats[operation].total++;
    if (correct) {
      operationStats[operation].correct++;
    }
  });

  const weakAreas: string[] = [];
  Object.entries(operationStats).forEach(([operation, stats]) => {
    const accuracy = stats.correct / stats.total;
    if (accuracy < 0.7 && stats.total >= 3) { // Less than 70% accuracy with at least 3 attempts
      weakAreas.push(operation);
    }
  });

  return weakAreas;
}
