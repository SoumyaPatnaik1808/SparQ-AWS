import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface RefereeRequest {
  action?: unknown;
  topic?: unknown;
  p1Answer?: unknown;
  p2Answer?: unknown;
}

interface MultipleChoiceQuestion {
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
}

const questionBank: MultipleChoiceQuestion[] = [
  { topic: "Programming", question: "What does a pure function guarantee for the same inputs?", options: ["The same output without side effects", "A faster runtime", "Automatic parallelism", "A database connection"], correctIndex: 0 },
  { topic: "Programming", question: "Which data structure follows FIFO ordering?", options: ["Stack", "Queue", "Tree", "Graph"], correctIndex: 1 },
  { topic: "UI/UX Design", question: "What is the primary purpose of a user flow?", options: ["To define brand colors", "To map the steps a user takes to complete a goal", "To measure page load time", "To choose a font family"], correctIndex: 1 },
  { topic: "UI/UX Design", question: "Which practice most directly improves keyboard accessibility?", options: ["Removing focus styles", "Using only hover interactions", "Providing a logical tab order", "Adding more animation"], correctIndex: 2 },
  { topic: "3D Modeling", question: "What does a normal map primarily change?", options: ["The mesh topology", "The perceived surface lighting", "The object scale", "The render resolution"], correctIndex: 1 },
  { topic: "3D Modeling", question: "What is a polygon's face?", options: ["A point", "An edge", "A flat surface bounded by edges", "A texture file"], correctIndex: 2 },
  { topic: "Data Science", question: "What does a classification model predict?", options: ["A continuous measurement only", "A category or class", "A database schema", "A chart color"], correctIndex: 1 },
  { topic: "Data Science", question: "Why is a test set kept separate from training data?", options: ["To evaluate generalization on unseen examples", "To increase the number of features", "To remove all outliers", "To guarantee perfect accuracy"], correctIndex: 0 },
  { topic: "Audio Engineering", question: "What does a compressor primarily reduce?", options: ["Dynamic range", "Stereo width", "Sample rate", "Track length"], correctIndex: 0 },
  { topic: "Audio Engineering", question: "What is clipping in digital audio?", options: ["A low-pass filter", "Distortion caused by exceeding the maximum level", "A stereo panning technique", "A file format"], correctIndex: 1 },
];

const topicAliases: Record<string, string> = {
  programming: "Programming",
  coding: "Programming",
  software: "Programming",
  javascript: "Programming",
  typescript: "Programming",
  python: "Programming",
  design: "UI/UX Design",
  ux: "UI/UX Design",
  ui: "UI/UX Design",
  modeling: "3D Modeling",
  "3d": "3D Modeling",
  data: "Data Science",
  science: "Data Science",
  machine: "Data Science",
  audio: "Audio Engineering",
  music: "Audio Engineering",
};

function getQuestionForTopic(topic: string) {
  const normalizedTopic = topic.trim().toLowerCase();
  const matchedAlias = Object.entries(topicAliases).find(([alias]) => normalizedTopic.includes(alias));
  const bankTopic = matchedAlias?.[1] ?? topic.trim();
  const matchingQuestions = questionBank.filter((item) => item.topic === bankTopic);
  if (matchingQuestions.length > 0) {
    return matchingQuestions[Math.floor(Math.random() * matchingQuestions.length)];
  }

  return {
    topic: topic.trim(),
    question: `Which approach is most useful when building a strong foundation in ${topic.trim()}?`,
    options: [
      `Learn the core concepts of ${topic.trim()} and apply them in a small project`,
      "Skip the fundamentals and memorize isolated answers",
      "Avoid practicing until you know every advanced topic",
      "Rely on unrelated examples without checking their context",
    ],
    correctIndex: 0,
  };
}

export async function POST(request: Request) {
  try {
    const { action, topic } = (await request.json()) as RefereeRequest;
    if (action === "question") {
      if (typeof topic !== "string" || !topic.trim()) {
        return NextResponse.json({ error: "A skill is required." }, { status: 400 });
      }
      return NextResponse.json(getQuestionForTopic(topic));
    }
    return NextResponse.json({ error: "Unsupported referee action." }, { status: 400 });
  } catch (error) {
    console.error("Arena referee error:", error);
    const message = error instanceof Error ? error.message : "Unable to evaluate the duel.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
