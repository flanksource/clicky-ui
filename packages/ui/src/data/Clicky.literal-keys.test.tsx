import { render, screen } from "@testing-library/react";
import { Clicky, type ClickyDocument } from "./Clicky";

describe("Clicky table literal keys", () => {
  it("renders dotted scalar and key-value cell names as literal keys", () => {
    const document: ClickyDocument = {
      version: 1,
      node: {
        kind: "table",
        columns: [
          { name: "process.serviceName", label: "Service" },
          { name: "process.tags", label: "Process tags", type: "key_values" },
        ],
        rows: [
          {
            cells: {
              "process.serviceName": {
                kind: "text",
                text: "checkout-api",
                plain: "checkout-api",
              },
              "process.tags": {
                kind: "map",
                fields: [
                  {
                    name: "host.name",
                    value: {
                      kind: "text",
                      text: "checkout-api-7d9",
                      plain: "checkout-api-7d9",
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    };

    render(<Clicky data={document} />);

    expect(screen.getByText("checkout-api")).toBeInTheDocument();
    expect(screen.getByText("host.name")).toBeInTheDocument();
    expect(screen.getByText("checkout-api-7d9")).toBeInTheDocument();
  });
});
