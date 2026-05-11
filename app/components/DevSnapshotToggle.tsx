"use client";

import { Switch } from "@/components/ui/switch";

export function DevSnapshotToggle({
  enabled,
  onToggle,
  hasSnapshot,
}: {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  hasSnapshot: boolean;
}) {
  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2 rounded-md border border-stone-300 bg-white/90 px-3 py-2 text-xs text-stone-700 shadow-sm backdrop-blur">
      <Switch checked={enabled} onCheckedChange={onToggle} id="dev-snapshot" />
      <label htmlFor="dev-snapshot" className="cursor-pointer select-none">
        cache run {hasSnapshot ? "(stored)" : ""}
      </label>
    </div>
  );
}
