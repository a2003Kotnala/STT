type SegmentLike = {
  speakerLabel?: string | null;
  startMs: number;
  endMs: number;
  text: string;
};

function pad(value: number, length = 2) {
  return value.toString().padStart(length, "0");
}

export function formatSrtTimestamp(milliseconds: number) {
  const totalMs = Math.max(0, milliseconds);
  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const seconds = Math.floor((totalMs % 60_000) / 1_000);
  const ms = totalMs % 1_000;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(ms, 3)}`;
}

export function toSrt(segments: SegmentLike[]) {
  return segments
    .map((segment, index) => {
      const prefix = segment.speakerLabel ? `[${segment.speakerLabel}] ` : "";

      return [
        index + 1,
        `${formatSrtTimestamp(segment.startMs)} --> ${formatSrtTimestamp(segment.endMs)}`,
        `${prefix}${segment.text.trim()}`,
      ].join("\n");
    })
    .join("\n\n");
}
