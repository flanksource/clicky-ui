import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestFailureDetail } from "./TestFailureDetail";

const PANIC_ONE = `goroutine 18 [running]:
testing.tRunner.func1.2({0x1, 0x2})
\t/usr/local/go1.22/src/testing/testing.go:1631 +0x24a
billing.TestCharge(0xc000)
\t/app/billing/charge_test.go:44 +0x1a
`;

const PANIC_MANY = `${PANIC_ONE}
goroutine 1 [chan receive]:
main.main()
\t/app/main.go:9 +0x20
`;

const GO_TEST_STACK = "auth/login_test.go:88 +0x1a4\nauth/login_test.go:71 +0x90\ntesting.tRunner +0xff";

describe("TestFailureDetail", () => {
  it("shows the summary", () => {
    render(<TestFailureDetail failure={{ kind: "panic", summary: "panic: nil pointer dereference" }} />);
    expect(screen.getByText("panic: nil pointer dereference")).toBeInTheDocument();
  });

  it("renders a single-goroutine panic dump as one goroutine card without the filter UI", () => {
    const { container } = render(<TestFailureDetail failure={{ kind: "panic", stack: PANIC_ONE }} />);
    expect(container.querySelector('[data-failure-stack="go"]')).not.toBeNull();
    expect(screen.getByText("g18")).toBeInTheDocument();
    expect(screen.queryByLabelText("Filter goroutines")).not.toBeInTheDocument();
  });

  it("renders a multi-goroutine dump with the goroutine filters", () => {
    render(<TestFailureDetail failure={{ kind: "panic", stack: PANIC_MANY }} />);
    expect(screen.getByLabelText("Filter goroutines")).toBeInTheDocument();
    expect(screen.getByText("2 / 2 goroutines")).toBeInTheDocument();
  });

  it("leaves a stack that is not a goroutine dump as a log", () => {
    const { container } = render(<TestFailureDetail failure={{ kind: "go_test", stack: GO_TEST_STACK }} />);
    expect(container.querySelector('[data-failure-stack="go"]')).toBeNull();
    expect(screen.queryByLabelText("Filter goroutines")).not.toBeInTheDocument();
    expect(container).toHaveTextContent("auth/login_test.go:88");
  });

  it("renders no stack section when there is no stack", () => {
    const { container } = render(<TestFailureDetail failure={{ kind: "raw", summary: "failed" }} />);
    expect(container.querySelector('[data-failure-stack="go"]')).toBeNull();
  });
});
