import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContextMeter } from "./ContextMeter";
import { effortLevelColor } from "./effort-icons";
import { providerIcon, providerIconColor } from "./provider-icons";

describe("ContextMeter", () => {
  it("maps provider marks to their brand colors", () => {
    expect(providerIconColor("openai")).toContain("text-black");
    expect(providerIconColor("anthropic")).toBe(
      "text-[#C15F3C] [[data-theme=dark]_&]:text-[#D97757]",
    );
    expect(providerIconColor("mistral")).toContain("text-[#C2410C]");
    expect(providerIconColor("perplexity")).toContain("text-[#0F766E]");
    expect(providerIconColor("huggingface")).toContain("text-[#A16207]");
  });

  it("uses accessible light tones for effort labels", () => {
    expect(effortLevelColor("minimal")).toContain("text-slate-500");
    expect(effortLevelColor("low")).toContain("text-sky-700");
    expect(effortLevelColor("medium")).toContain("text-amber-700");
    expect(effortLevelColor("high")).toContain("text-orange-700");
    expect(effortLevelColor("xhigh")).toContain("text-orange-700");
    expect(effortLevelColor("max")).toContain("text-red-700");
    expect(effortLevelColor("ultra")).toContain("text-fuchsia-700");
    expect(effortLevelColor("adaptive")).toContain("text-indigo-700");
    expect(effortLevelColor("ultra-plus")).toBeUndefined();
  });

  it("centers a larger provider mark inside the radial gauge", () => {
    render(
      <ContextMeter
        mode="gauge"
        usedPercent={42}
        modelIcon={providerIcon("anthropic")}
        modelIconClassName={providerIconColor("anthropic")}
      />,
    );

    const trigger = screen.getByLabelText("Context 42% used");
    const gauge = trigger.querySelector("[data-context-gauge-ring]");
    expect(gauge).toHaveAttribute("width", "36");
    expect(gauge).toHaveAttribute("height", "36");
    expect(gauge).toHaveAttribute("viewBox", "0 0 36 36");
    expect(trigger).not.toHaveTextContent("42");
    expect(trigger.querySelector("svg.text-\\[\\#C15F3C\\]")).toHaveClass(
      "size-5",
    );
  });

  it("uses accessible semantic tones for every context state", () => {
    const { rerender } = render(
      <ContextMeter mode="gauge" usedPercent={42} />,
    );

    expect(screen.getByLabelText("Context 42% used").querySelector("svg")).toHaveClass(
      "text-emerald-600",
      "[[data-theme=dark]_&]:text-emerald-400",
    );

    rerender(<ContextMeter mode="gauge" usedPercent={64} />);
    expect(screen.getByLabelText("Context 64% used").querySelector("svg")).toHaveClass(
      "text-amber-700",
      "[[data-theme=dark]_&]:text-amber-400",
    );

    rerender(<ContextMeter mode="bar" usedPercent={91} />);
    const trigger = screen.getByLabelText("Context 91% used");
    expect(trigger.querySelector("span.block")).toHaveClass(
      "bg-red-600",
      "[[data-theme=dark]_&]:bg-red-400",
    );
    expect(trigger.lastElementChild).toHaveClass(
      "text-red-700",
      "[[data-theme=dark]_&]:text-red-400",
    );
  });

  it("shows colored provider and effort metadata in the hover card", async () => {
    render(
      <ContextMeter
        mode="gauge"
        usedPercent={42}
        model="claude-opus-4-8"
        modelIcon={providerIcon("anthropic")}
        modelIconClassName={providerIconColor("anthropic")}
        effort="high"
      />,
    );

    fireEvent.mouseEnter(screen.getByLabelText("Context 42% used"));

    const effort = await screen.findByText("High effort");
    expect(effort).toHaveClass("text-orange-700");
    expect(effort.querySelector("svg")).not.toBeNull();
    expect(
      [...document.querySelectorAll("svg")].filter((icon) =>
        icon.classList.contains("text-[#C15F3C]"),
      ),
    ).toHaveLength(2);
  });

  it("shows unknown effort metadata without a known icon or tone", async () => {
    render(
      <ContextMeter mode="gauge" usedPercent={42} effort="ultra-plus" />,
    );

    fireEvent.mouseEnter(screen.getByLabelText("Context 42% used"));

    const effort = await screen.findByText("Ultra-plus effort");
    expect(effort.className).not.toContain("text-");
    expect(effort.querySelector("svg")).toBeNull();
  });
});
