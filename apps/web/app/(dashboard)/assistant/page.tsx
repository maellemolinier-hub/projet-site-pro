import type { Metadata } from "next";
import { AssistantChat } from "@/components/assistant/AssistantChat";

export const metadata: Metadata = { title: "Assistant IA — ImmoExpert" };

export default function AssistantPage() {
  return (
    <div className="h-full px-4 sm:px-8">
      <AssistantChat />
    </div>
  );
}
