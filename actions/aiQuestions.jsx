"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { currentUser } from "@clerk/nextjs/server";

const CATEGORY_PROMPTS = {
  FRONTEND: "React, JavaScript, CSS",
  BACKEND: "Node.js, REST APIs, databases",
  FULLSTACK: "full-stack architecture, deployment",
  DSA: "data structures, algorithms",
  SYSTEM_DESIGN: "distributed systems, caching",
  BEHAVIORAL: "leadership, teamwork",
  DEVOPS: "Docker, CI/CD, cloud",
  MOBILE: "React Native, Android/iOS",
};

export const generateInterviewQuestions = async ({ category }) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const finalCategory = category || "BACKEND";

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const prompt = `Generate 6 professional technical interview questions with short ideal answers for ${finalCategory} covering ${CATEGORY_PROMPTS[finalCategory]}.

Return ONLY valid JSON array:
[
 {"question":"...", "answer":"..."},
 {"question":"...", "answer":"..."}
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const clean = text.replace(/```json|```/g, "").trim();

    let questions = [];

    try {
      questions = JSON.parse(clean);
    } catch (err) {
      console.log("Gemini raw response:", clean);
      throw new Error("AI parse failed");
    }

    return { questions };
  } catch (err) {
    console.log("Gemini full error:", err);
    throw new Error(
      "API configuration error. Please check your API Key and Region.",
    );
  }
};
