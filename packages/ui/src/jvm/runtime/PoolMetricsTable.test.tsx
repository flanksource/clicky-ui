import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { METRICS } from "../fixtures/classes";
import { PoolMetricsTable } from "./PoolMetricsTable";

describe("PoolMetricsTable", () => {
  it("shows the pool name and one column per selected attribute", () => {
    render(<PoolMetricsTable label="Server connectors" pools={METRICS.connectors} />);
    const region = screen.getByRole("region", { name: "Server connectors" });
    expect(within(region).getByRole("columnheader", { name: /currentThreadsBusy/ })).toBeInTheDocument();
    expect(within(region).getByRole("columnheader", { name: /maxThreads/ })).toBeInTheDocument();
    expect(within(region).queryByRole("columnheader", { name: /objectName/ })).toBeNull();
    expect(within(region).getByText('"http-nio-8080"')).toHaveAttribute("title", 'Catalina:name="http-nio-8080",type=ThreadPool');
    expect(within(region).getByText("37")).toBeInTheDocument();
    expect(within(region).getByText("200")).toBeInTheDocument();
  });

  it("unions the attributes of pools that report different ones", () => {
    render(
      <PoolMetricsTable
        label="Data sources"
        pools={[
          { name: "a", ActiveConnections: 1 },
          { name: "b", IdleConnections: 2 },
        ]}
      />,
    );
    expect(screen.getByRole("columnheader", { name: /ActiveConnections/ })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /IdleConnections/ })).toBeInTheDocument();
  });
});
