import type { Meta, StoryObj } from "@storybook/react-vite";
import { FrameSourceWindow } from "./FrameSourceWindow";

const meta = {
  title: "Data/Diagnostics/FrameSourceWindow",
  component: FrameSourceWindow,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Renders a resolved source window beneath a stack frame: a gutter of absolute line numbers with the frame's focal `line` highlighted. The plain (non-Shiki) renderer shared by JVM thread-dump and exception stack-trace frames. Use `frameHasSource(frame)` to decide whether to render it.",
      },
    },
  },
  argTypes: { frame: { control: false } },
  args: {
    frame: {
      sourceStartLine: 138,
      line: 142,
      sourceLines: [
        "  public Receipt charge(Money amount) {",
        "    var account = accounts.lookup(amount.customer());",
        "    if (account.balance().lessThan(amount)) {",
        "      throw new PaymentException(\"charge declined\");",
        "    }",
        "    return ledger.debit(account, amount);",
        "  }",
      ],
    },
  },
} satisfies Meta<typeof FrameSourceWindow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ExplicitLineNumbers: Story = {
  args: {
    frame: {
      sourceLineNumbers: [40, 41, 42, 43],
      line: 42,
      sourceLines: [
        "func (s *Service) Charge(amount int) error {",
        "  if s.balance < amount {",
        "    return ErrInsufficientFunds",
        "  }",
      ],
    },
  },
};

/** The calls a caller's source makes, each line marked and annotated, with no failing focal line. */
export const Markers: Story = {
  args: {
    frame: {
      sourceStartLine: 86,
      sourceLanguage: "xml",
      sourceLines: [
        '<MathIF IF="MemberCountMV > 0">',
        '  <MathVariable VARIABLENAME="ValidMV" TYPE="CALLRULE">ValidateExpressions</MathVariable>',
        "</MathIF>",
        '<MathVariable VARIABLENAME="PacketMV" TYPE="CALLRULE">TransactionBusinessRulePacket</MathVariable>',
      ],
    },
    markers: [
      { line: 87, content: <span className="rounded bg-red-500/10 px-1 text-red-700">calls ValidateExpressions · removed</span> },
      { line: 89, content: <span className="rounded bg-muted px-1">calls TransactionBusinessRulePacket</span> },
    ],
  },
};
