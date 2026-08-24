export type GuidanceTone = "do" | "avoid" | "rule";

export type GuidanceBlock =
  | {
      kind: "section";
      title: string;
      description?: string;
    }
  | {
      kind: "practice" | "annotation";
      tone: GuidanceTone;
      title: string;
      body: string;
    }
  | {
      kind: "variant";
      title: string;
      verdict: string;
      selected?: boolean;
    }
  | {
      kind: "callout";
      tone: string;
      title?: string;
      body: string;
    }
  | {
      kind: "list";
      title: string;
      tone: "use" | "avoid";
      items: string[];
    }
  | {
      kind: "table";
      headers: string[];
      rows: string[][];
    };

export type ExtractedGuidance = {
  blocks: GuidanceBlock[];
};
