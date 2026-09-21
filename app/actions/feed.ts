"use server";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1",
  // In a real app with proper IAM, credentials would be injected by the environment.
});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "SparQ_Database";

// Mock data as fallback in case DynamoDB is empty or not fully configured
const MOCK_POSTS = [
  {
    id: "1",
    authorName: "Elena Vance",
    authorTitle: "Stanford CS & Design",
    authorImage: "",
    rating: 4.9,
    swaps: 32,
    postTitle: "Mastering Blender 3D & Realtime Shaders",
    postDescription: "Direct 1-on-1 mentorship focused on real production techniques, shader graphs, and game engine readiness.",
    tags: ["Interactive 3D Pipeline"],
    learnItems: [
      "Procedural geometry nodes & non-destructive workflows",
      "Custom PBR shader networks & glass caustics",
      "Optimizing real-time assets for WebGL and three.js"
    ],
    lookingFor: "React Native Mobile Architecture",
    barterType: "1:1 Barter"
  },
  {
    id: "2",
    authorName: "Devlin K.",
    authorTitle: "MIT EECS & Systems",
    authorImage: "",
    rating: 4.8,
    swaps: 15,
    postTitle: "Rust Systems & Async Concurrency",
    postDescription: "Memory profiling with Valgrind, Tokio async tuning, and compiler guidance for low-level systems.",
    tags: ["Systems Programming", "Rust"],
    learnItems: [
      "Ownership and borrowing deep dive",
      "Building async web servers with Axum",
      "FFI and unsafe Rust practices"
    ],
    lookingFor: "Figma UI/UX Prototyping",
    barterType: "1:1 Barter"
  }
];

export async function getFeedPosts(): Promise<Array<Record<string, unknown>>> {
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });
    const response = await docClient.send(command);
    
    if (response.Items && response.Items.length > 0) {
      return response.Items;
    }
    
    return MOCK_POSTS;
  } catch (error) {
    console.error("DynamoDB Scan Error:", error);
    return MOCK_POSTS;
  }
}
