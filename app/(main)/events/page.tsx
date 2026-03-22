"use client";

/*
Changes vs original:
- Simplified page shell so redesigned EventsSection controls the full premium events experience.
- Preserved routing and component entrypoint while keeping layout consistent with app chrome.
*/

import { EventsSection } from "@/components/discover/EventsSection";

export default function EventsPage() {
  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <EventsSection />
    </div>
  );
}
