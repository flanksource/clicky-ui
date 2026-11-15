import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { METRICS } from "../fixtures/classes";
import { RuntimeInfo } from "./RuntimeInfo";

describe("RuntimeInfo", () => {
  it("lists Java, home, OS, processors, load and uptime", () => {
    render(<RuntimeInfo runtime={METRICS.runtime} />);
    expect(screen.getByText("21.0.5")).toBeInTheDocument();
    expect(screen.getByText("/usr/lib/jvm/java-21")).toBeInTheDocument();
    expect(screen.getByText("Linux 6.8.0")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("2.40")).toBeInTheDocument();
    expect(screen.getByText("27.2 h")).toBeInTheDocument();
  });

  it("says the load average is unavailable when the OS reports a negative value", () => {
    render(<RuntimeInfo runtime={{ ...METRICS.runtime, systemLoadAverage: -1 }} />);
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
  });

  it("omits the Java home row when the agent does not report it", () => {
    const { javaHome: _javaHome, ...runtime } = METRICS.runtime;
    render(<RuntimeInfo runtime={runtime} />);
    expect(screen.queryByText("Java home")).toBeNull();
  });
});
