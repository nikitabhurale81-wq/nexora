import { Suspense } from "react";
import { ChatWorkspace } from "@/components/chat/chat-workspace";

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="grid h-full place-items-center text-sm text-cyan-300">Loading AI workspace…</div>}>
      <ChatWorkspace />
    </Suspense>
  );
}
