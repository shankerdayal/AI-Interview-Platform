"use client";

import { useEffect, useCallback, useState } from "react";

// Stream Video
import {
  StreamTheme,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
  CallingState,
  CallControls,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

// Stream Chat
import {
  Chat,
  Channel,
  MessageList,
  MessageInput,
  Window,
  useCreateChatClient,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

import { Badge } from "@/components/ui/badge";
import { MessageSquare, Sparkles, Loader2 } from "lucide-react";

import AIQuestionsPanel from "./AIQuestions";
import { generateAIReview } from "@/actions/aiReview";

export default function CallUI({
  callId,
  isInterviewer,
  booking,
  onLeave,
  apiKey,
  token,
  currentUser,
}) {
  const { useCallCallingState } = useCallStateHooks();
  const call = useCall();
  const callingState = useCallCallingState();

  const [activeTab, setActiveTab] = useState("chat");

  // AI Review States
  const [notes, setNotes] = useState("");
  const [review, setReview] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);

  const handleLeave = useCallback(async () => {
    try {
      if (call) {
        const isRecording = call.state?.recording;

        if (isRecording) {
          await call.stopRecording().catch(() => {});
        }

        await call.leave().catch(() => {});
      }
    } finally {
      onLeave();
    }
  }, [call, onLeave]);

  // Generate AI Review
  const handleGenerateReview = async () => {
    try {
      setLoadingReview(true);

      const result = await generateAIReview(notes);

      setReview(result);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingReview(false);
    }
  };

  const chatClient = useCreateChatClient({
    apiKey,
    tokenOrProvider: token,
    userData: {
      id: currentUser.id,
      name: currentUser.name,
      image: currentUser.imageUrl,
    },
  });

  const [chatChannel, setChatChannel] = useState(null);

  useEffect(() => {
    if (!chatClient) return;

    const channel = chatClient.channel("messaging", callId, {
      name: "Interview Chat",
      members: [
        booking.interviewer.clerkUserId,
        booking.interviewee.clerkUserId,
      ],
    });

    channel
      .watch()
      .then(() => setChatChannel(channel))
      .catch(console.error);

    return () => {
      channel.stopWatching().catch(() => {});
    };
  }, [chatClient, callId, booking]);

  if (callingState === CallingState.LEFT) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center gap-3">
        <p className="text-stone-400 text-sm">Leaving call…</p>
      </div>
    );
  }

  return (
    <div className="min-h-[92vh] bg-[#0a0a0b] flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/8 shrink-0">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-white/10 text-stone-500 text-xs"
          >
            {booking.interviewer.name}
            <span className="text-stone-700 mx-1.5">×</span>
            {booking.interviewee.name}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* VIDEO AREA */}
        <div className="flex flex-col flex-1 min-w-0">
          <StreamTheme>
            <SpeakerLayout participantBarPosition="bottom" />
            <CallControls onLeave={handleLeave} />
          </StreamTheme>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-85 shrink-0 flex flex-col border-l border-white/8 bg-[#0a0a0b]">
          {/* TABS */}
          <div className="flex border-b border-white/8 shrink-0">
            {/* CHAT TAB */}
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors ${
                activeTab === "chat"
                  ? "text-amber-400 border-b-2 border-amber-400"
                  : "text-stone-500 hover:text-stone-300"
              }`}
            >
              <MessageSquare size={13} />
              Chat
            </button>

            {/* AI TAB */}
            {isInterviewer && (
              <button
                type="button"
                onClick={() => setActiveTab("ai")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors ${
                  activeTab === "ai"
                    ? "text-amber-400 border-b-2 border-amber-400"
                    : "text-stone-500 hover:text-stone-300"
                }`}
              >
                <Sparkles size={13} />
                AI Tools
              </button>
            )}
          </div>

          {/* PANEL CONTENT */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {activeTab === "chat" ? (
              chatClient && chatChannel ? (
                <Chat client={chatClient} theme="str-chat__theme-dark">
                  <Channel channel={chatChannel}>
                    <Window>
                      <MessageList />
                      <MessageInput focus />
                    </Window>
                  </Channel>
                </Chat>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={18} className="text-stone-600 animate-spin" />
                </div>
              )
            ) : isInterviewer ? (
              <div className="p-4 h-full overflow-y-scroll max-h-screen space-y-6">
                {/* AI QUESTIONS */}
                <AIQuestionsPanel categories={booking.categories} />

                {/* AI FEEDBACK REPORT */}
                <div className="rounded-2xl border border-white/10 bg-[#111111] p-4">
                  <h2 className="text-sm font-semibold text-amber-400 mb-4">
                    📊 AI Feedback Report
                  </h2>

                  {/* NOTES */}
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add interviewer notes about candidate performance..."
                    className="w-full rounded-xl bg-[#18181b] border border-white/10 p-3 text-xs text-white min-h-[110px] outline-none"
                  />

                  {/* BUTTON */}
                  <button
                    onClick={handleGenerateReview}
                    disabled={loadingReview || !notes}
                    className="mt-3 w-full rounded-xl bg-amber-400 text-black py-2.5 text-xs font-semibold disabled:opacity-50"
                  >
                    {loadingReview
                      ? "Generating AI Review..."
                      : "Generate AI Review"}
                  </button>

                  {/* AI REVIEW OUTPUT */}
                  {review && (
                    <div className="mt-5 space-y-5">
                      {/* SCORES */}
                      <div className="space-y-2 text-xs text-stone-300">
                        <div className="flex justify-between">
                          <span>Technical Understanding</span>

                          <span className="text-amber-400">
                            {review.technical}/10
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span>Communication</span>

                          <span className="text-amber-400">
                            {review.communication}/10
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span>Problem Solving</span>

                          <span className="text-amber-400">
                            {review.problemSolving}/10
                          </span>
                        </div>
                      </div>

                      {/* STRENGTHS */}
                      <div>
                        <h3 className="text-xs font-medium text-green-400 mb-2">
                          Strengths
                        </h3>

                        <ul className="list-disc ml-4 space-y-1 text-xs text-stone-400">
                          {review.strengths?.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* WEAKNESSES */}
                      <div>
                        <h3 className="text-xs font-medium text-red-400 mb-2">
                          Areas for Improvement
                        </h3>

                        <ul className="list-disc ml-4 space-y-1 text-xs text-stone-400">
                          {review.weaknesses?.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* RECOMMENDATION */}
                      <div className="rounded-xl bg-amber-500/10 border border-amber-400/20 px-3 py-3 text-xs text-amber-400">
                        {review.recommendation}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
