import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { AgentIdentity, AgentIdentityProvider } from "./AgentIdentity";

it("shows a colored provider, short model and known effort while preserving canonical identifiers", () => {
  render(<AgentIdentityProvider identities={{ session: { model: "claude-opus-5-5", effort: "high" } }}><AgentIdentity identityId="session" /></AgentIdentityProvider>);
  expect(screen.getByText("Opus 5.5")).toBeInTheDocument();
  expect(screen.getByLabelText("High effort").querySelector("svg")).not.toBeNull();
  expect(screen.getByTitle("claude-opus-5-5 · high effort").querySelector("svg")).toHaveClass("text-[#C15F3C]");
});

it("retains unknown identity and effort without inventing provider metadata", () => {
  render(<AgentIdentity model="custom/agent-next" effort="future" />);
  expect(screen.getByText("custom/agent-next")).toBeInTheDocument();
  expect(screen.getByLabelText("Future effort")).toHaveTextContent("future");
  expect(screen.getByLabelText("Future effort").querySelector("svg")).toBeNull();
});

it("keeps a supplied label while using session metadata for model and effort icons", () => {
  render(
    <AgentIdentityProvider identities={{ review: { model: "claude-opus-5-5", effort: "high" } }}>
      <AgentIdentity label="markdown-review" identityId="review" />
    </AgentIdentityProvider>,
  );
  expect(screen.getByText("markdown-review")).toBeInTheDocument();
  expect(screen.queryByText("Opus 5.5")).not.toBeInTheDocument();
  expect(screen.getByTitle("markdown-review · claude-opus-5-5 · high effort").querySelector("svg")).toHaveClass("text-[#C15F3C]");
  expect(screen.getByLabelText("High effort").querySelector("svg")).not.toBeNull();
});
