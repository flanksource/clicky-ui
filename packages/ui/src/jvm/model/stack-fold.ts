export interface StackFold {
  /** Frames (`at` lines) in one copy of the repeated block. */
  unitFrames: number;
  repeats: number;
}

export interface FoldedStack {
  text: string;
  folds: StackFold[];
  /** Frames removed from `text` compared with the input. */
  foldedFrames: number;
}

type Repeat = { start: number; period: number; repeats: number };

// The longest block a fold looks for; leaves room for units that alternate two paths.
const MAX_PERIOD = 400;
// A block seen twice is ordinary code reuse; three times is a recursion.
const MIN_REPEATS = 3;
const MAX_FOLDS = 8;
const FRAME_LINE = /^\s*at\s/;
// `- locked <0x…>` lines differ in their object address on every recursion level.
const OBJECT_ADDRESS = /<0x[0-9a-f]+>/gi;

/** Number of frames (`at` lines) in jstack-format text. */
export function countStackFrames(text: string): number {
  return text.split("\n").filter((line) => FRAME_LINE.test(line)).length;
}

/**
 * Folds every block of jstack lines that repeats back to back at least three
 * times down to its first copy, comparing lock lines without their addresses.
 * The folded text is for reading; the full text stays what is downloaded.
 */
export function foldRepeatedFrames(text: string): FoldedStack {
  let lines = text.split("\n");
  const folds: StackFold[] = [];
  for (let i = 0; i < MAX_FOLDS; i++) {
    const best = longestRepeat(lines);
    if (!best) break;
    const unit = lines.slice(best.start, best.start + best.period);
    folds.push({ unitFrames: unit.filter((line) => FRAME_LINE.test(line)).length, repeats: best.repeats });
    lines = [...lines.slice(0, best.start + best.period), ...lines.slice(best.start + best.repeats * best.period)];
  }
  return {
    text: folds.length > 0 ? lines.join("\n") : text,
    folds,
    foldedFrames: folds.reduce((sum, fold) => sum + (fold.repeats - 1) * fold.unitFrames, 0),
  };
}

// The tandem repeat that removes the most lines: for each period p, a run of
// lines equal to the line p further on spans a block of period p. Lines are
// compared as interned ids so a 10k-line stack stays cheap.
function longestRepeat(lines: string[]): Repeat | null {
  const ids = internLines(lines);
  let best: Repeat | null = null;
  let bestRemoved = 0;
  const consider = (start: number, run: number, period: number) => {
    const repeats = Math.floor((run + period) / period);
    const removed = (repeats - 1) * period;
    if (repeats >= MIN_REPEATS && removed > bestRemoved) {
      best = { start, period, repeats };
      bestRemoved = removed;
    }
  };
  for (let period = 1; period <= Math.min(MAX_PERIOD, Math.floor(ids.length / MIN_REPEATS)); period++) {
    let run = 0;
    for (let i = 0; i + period < ids.length; i++) {
      if (ids[i] === ids[i + period]) {
        run++;
        continue;
      }
      if (run > 0) consider(i - run, run, period);
      run = 0;
    }
    if (run > 0) consider(ids.length - period - run, run, period);
  }
  return best;
}

function internLines(lines: string[]): number[] {
  const seen = new Map<string, number>();
  return lines.map((line) => {
    const key = line.replace(OBJECT_ADDRESS, "<…>").trim();
    let id = seen.get(key);
    if (id === undefined) {
      id = seen.size;
      seen.set(key, id);
    }
    return id;
  });
}
