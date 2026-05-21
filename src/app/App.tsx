import { Plus } from "lucide-react";
import { useState } from "react";

import { BottomNav, type AppTab } from "@/features/navigation/ui/BottomNav";
import { regionRecords } from "@/features/records/model/regionRecords";
import { FeedScreen } from "@/screens/FeedScreen";
import { MapScreen } from "@/screens/MapScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";

export function App() {
  const [records, setRecords] = useState(regionRecords);
  const [activeTab, setActiveTab] = useState<AppTab>("map");
  const [selectedRecordId, setSelectedRecordId] = useState<
    string | undefined
  >();
  const [shouldStartCreateRecord, setShouldStartCreateRecord] = useState(false);

  const handleSelectRecord = (recordId: string) => {
    setSelectedRecordId(recordId);
    setShouldStartCreateRecord(false);
    setActiveTab("map");
  };

  const handleOpenCreateForm = () => {
    setActiveTab("map");
    setShouldStartCreateRecord(true);
  };

  return (
    <main className="h-svh overflow-hidden text-[var(--color-text)] lg:mx-auto lg:h-auto lg:max-w-6xl lg:overflow-visible lg:pt-4 ">
      <header className="mb-4 hidden items-center justify-between gap-4 lg:flex">
        <h1 className="m-0 text-[28px] font-extrabold tracking-normal">
          Have Been Korea
        </h1>
        <button
          className="inline-flex h-[42px] items-center gap-2 rounded-xl bg-[var(--color-text)] px-3.5 text-sm font-extrabold text-[var(--color-card-bg)]"
          aria-label="새 기록"
          type="button"
          onClick={handleOpenCreateForm}
        >
          <Plus size={18} strokeWidth={2.4} aria-hidden="true" />새 기록
        </button>
      </header>

      {activeTab === "feed" ? (
        <FeedScreen records={records} onSelectRecord={handleSelectRecord} />
      ) : activeTab === "profile" ? (
        <ProfileScreen />
      ) : (
        <MapScreen
          records={records}
          selectedRecordId={selectedRecordId}
          shouldStartCreateRecord={shouldStartCreateRecord}
          onSelectRecord={setSelectedRecordId}
          onStartCreateRecordHandled={() => setShouldStartCreateRecord(false)}
          setRecords={setRecords}
        />
      )}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onCreateRecord={handleOpenCreateForm}
      />
    </main>
  );
}
