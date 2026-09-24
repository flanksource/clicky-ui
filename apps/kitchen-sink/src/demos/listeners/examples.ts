import type { JsonSchemaObject } from "@flanksource/clicky-ui";

export type ListenerExample = {
  id: string;
  label: string;
  description: string;
  schema: JsonSchemaObject;
  initialValue: Record<string, unknown>;
};

const loan: ListenerExample = {
  id: "loan",
  label: "Show · require · set",
  description:
    "A `const` guard with an `else` branch. Yes reveals and requires the amount, enables the rate and sets a starting amount; No hides the amount, disables the rate and resets both (the rate back to its schema default).",
  initialValue: { LoanOverride: "00" },
  schema: {
    type: "object",
    properties: {
      LoanOverride: {
        type: "string",
        title: "Loan override",
        enum: ["00", "01"],
        "x-enum-labels": { "00": "No", "01": "Yes" },
        "x-enum-display": "segmented",
        "x-on-change": [
          {
            when: { const: "01" },
            show: ["LoanAmount"],
            require: ["LoanAmount"],
            enable: ["LoanRate"],
            set: { LoanAmount: 1000 },
            else: { hide: ["LoanAmount"], disable: ["LoanRate"], reset: ["LoanAmount", "LoanRate"] },
          },
        ],
      },
      LoanAmount: { type: "number", title: "Loan amount" },
      LoanRate: { type: "number", title: "Loan rate", default: 3.5 },
    },
  },
};

const memberClass: ListenerExample = {
  id: "member-class",
  label: "Swap fields · not",
  description:
    "Two listeners on one picker. The first swaps which group field exists; the second uses a `not` guard (the JSON Schema spelling of `!=`) to ask for a change reason, pre-filled with `set`.",
  initialValue: { MemberClassGroupOption: "01" },
  schema: {
    type: "object",
    required: ["MemberClassGroupOption"],
    properties: {
      MemberClassGroupOption: {
        type: "string",
        title: "Member class group",
        enum: ["01", "02"],
        "x-enum-labels": { "01": "Add", "02": "Update" },
        "x-enum-display": "segmented",
        "x-on-change": [
          {
            when: { const: "01" },
            show: ["NewMemberClassGroup"],
            require: ["NewMemberClassGroup"],
            hide: ["CurrentMemberClassGroup"],
            reset: ["CurrentMemberClassGroup"],
            else: {
              hide: ["NewMemberClassGroup"],
              show: ["CurrentMemberClassGroup"],
              require: ["CurrentMemberClassGroup"],
              reset: ["NewMemberClassGroup"],
            },
          },
          {
            when: { not: { const: "01" } },
            show: ["ChangeReason"],
            set: { ChangeReason: "Amendment" },
            else: { hide: ["ChangeReason"], reset: ["ChangeReason"] },
          },
        ],
      },
      NewMemberClassGroup: { type: "string", title: "New member class group" },
      CurrentMemberClassGroup: { type: "string", title: "Current member class group" },
      ChangeReason: { type: "string", title: "Change reason" },
    },
  },
};

const shipping: ListenerExample = {
  id: "shipping",
  label: "enum guard · sections",
  description:
    "An `enum` guard matches any of several values. Fast methods require a delivery date; pickup hides the whole address section and asks for a store instead.",
  initialValue: { Method: "standard" },
  schema: {
    type: "object",
    properties: {
      Method: {
        type: "string",
        title: "Shipping method",
        enum: ["pickup", "standard", "express", "overnight"],
        "x-enum-display": "radio",
        "x-on-change": [
          {
            when: { enum: ["express", "overnight"] },
            show: ["DeliveryDate"],
            require: ["DeliveryDate"],
            else: { hide: ["DeliveryDate"], reset: ["DeliveryDate"] },
          },
          {
            when: { const: "pickup" },
            hide: ["Address"],
            reset: ["Address"],
            show: ["PickupStore"],
            require: ["PickupStore"],
            else: { hide: ["PickupStore"], reset: ["PickupStore"], require: ["Address"] },
          },
        ],
      },
      DeliveryDate: { type: "string", format: "date", title: "Delivery date" },
      PickupStore: { type: "string", title: "Pickup store", enum: ["Downtown", "Airport", "Harbour"] },
      Address: {
        type: "object",
        title: "Address",
        required: ["Street", "City"],
        properties: {
          Street: { type: "string", title: "Street" },
          City: { type: "string", title: "City" },
          Zip: { type: "string", title: "Zip" },
        },
      },
    },
  },
};

const expressions: ListenerExample = {
  id: "expressions",
  label: "when.expr",
  description:
    "`when.expr` is handed to the host's `expressionEvaluator` — here a JavaScript evaluator with `value`, `self` and `root` in scope. `expr` ANDs with predicate keywords: the STAFF coupon only discounts orders under 500. Discount is statically `x-disabled`.",
  initialValue: { Total: 250, Country: "GB" },
  schema: {
    type: "object",
    properties: {
      Total: {
        type: "number",
        title: "Order total",
        "x-on-change": [
          {
            when: { expr: "value > 1000" },
            show: ["Approver"],
            require: ["Approver"],
            else: { hide: ["Approver"], reset: ["Approver"] },
          },
        ],
      },
      Approver: { type: "string", title: "Approver" },
      Country: {
        type: "string",
        title: "Country",
        enum: ["US", "CA", "GB"],
        "x-on-change": [
          {
            when: { expr: "['US', 'CA'].includes(value)" },
            show: ["Region"],
            require: ["Region"],
            else: { hide: ["Region"], reset: ["Region"] },
          },
        ],
      },
      Region: { type: "string", title: "State / province" },
      Coupon: {
        type: "string",
        title: "Coupon",
        "x-on-change": [
          {
            when: { const: "STAFF", expr: "self.Total < 500" },
            set: { Discount: 20 },
            else: { reset: ["Discount"] },
          },
        ],
      },
      Discount: { type: "number", title: "Discount %", default: 0, "x-disabled": true },
    },
  },
};

const cascade: ListenerExample = {
  id: "cascade",
  label: "Cascading resets",
  description:
    "Changing the country resets the region, and that reset fires the region's own listener, which resets the city. Each field fires at most once per edit, so cycles end.",
  initialValue: {},
  schema: {
    type: "object",
    properties: {
      Country: {
        type: "string",
        title: "Country",
        enum: ["US", "CA"],
        "x-on-change": [
          { reset: ["Region"] },
          { when: { enum: ["US", "CA"] }, show: ["Region"], else: { hide: ["Region"] } },
        ],
      },
      Region: {
        type: "string",
        title: "Region",
        enum: ["West", "East"],
        "x-on-change": [
          { reset: ["City"] },
          { when: { enum: ["West", "East"] }, show: ["City"], else: { hide: ["City"] } },
        ],
      },
      City: { type: "string", title: "City" },
    },
  },
};

const nested: ListenerExample = {
  id: "nested",
  label: "Nested objects",
  description:
    "Listeners work at any depth; targets are siblings in the same object. Ticking the box disables, clears and un-requires the billing address.",
  initialValue: { Billing: { SameAsShipping: true } },
  schema: {
    type: "object",
    properties: {
      Shipping: {
        type: "object",
        title: "Shipping",
        properties: {
          ShippingStreet: { type: "string", title: "Shipping street" },
          ShippingCity: { type: "string", title: "Shipping city" },
        },
      },
      Billing: {
        type: "object",
        title: "Billing",
        properties: {
          SameAsShipping: {
            type: "boolean",
            title: "Same as shipping",
            "x-on-change": [
              {
                when: { const: true },
                disable: ["BillingStreet", "BillingCity"],
                reset: ["BillingStreet", "BillingCity"],
                else: { enable: ["BillingStreet", "BillingCity"], require: ["BillingStreet", "BillingCity"] },
              },
            ],
          },
          BillingStreet: { type: "string", title: "Billing street" },
          BillingCity: { type: "string", title: "Billing city" },
        },
      },
    },
  },
};

const patch: ListenerExample = {
  id: "patch",
  label: "patch · readOnly · writeOnly",
  description:
    "`patch` merges standard keywords over a sibling while the guard holds. Signing locks the amount (`readOnly` swaps the input for its value), retitles and bounds the rate, and makes the `writeOnly` API token read-only — which removes it, because a write-only value is never shown back.",
  initialValue: { Status: "draft", Amount: 1200, Rate: 4.5 },
  schema: {
    type: "object",
    properties: {
      Status: {
        type: "string",
        title: "Status",
        enum: ["draft", "signed"],
        "x-enum-labels": { draft: "Draft", signed: "Signed" },
        "x-enum-display": "segmented",
        "x-on-change": [
          {
            when: { const: "signed" },
            patch: {
              Amount: { readOnly: true },
              Rate: { title: "Agreed rate", minimum: 0, maximum: 25 },
              ApiToken: { readOnly: true },
            },
          },
        ],
      },
      Amount: { type: "number", title: "Amount" },
      Rate: { type: "number", title: "Rate", multipleOf: 0.25 },
      ApiToken: { type: "string", title: "API token", writeOnly: true },
    },
  },
};

const paths: ListenerExample = {
  id: "paths",
  label: "Paths · x-on-load",
  description:
    "Listeners on `input` reach into the sibling `groups` object by path: `groups/LoanTerms` is the table, `groups/LoanTerms/Fee` one of its columns (an array is crossed into its items). The root `x-on-load` starts the table and the fee column hidden; `x-on-change` runs after it, so each option reveals its own target. Locking patches the Rate column `readOnly`, which shows its values as text — the same cells a read-only table or form shows.",
  initialValue: {
    input: { LoanTermAction: "02", Fees: "00", Lock: "00" },
    groups: { LoanTerms: [{ Term: 12, Rate: 4.5, Fee: 10 }] },
  },
  schema: {
    type: "object",
    "x-on-load": [{ hide: ["groups/LoanTerms", "groups/LoanTerms/Fee"] }],
    properties: {
      input: {
        type: "object",
        title: "Input",
        properties: {
          LoanTermAction: {
            type: "string",
            title: "Loan terms",
            enum: ["01", "02"],
            "x-enum-labels": { "01": "Override", "02": "Default" },
            "x-enum-display": "segmented",
          },
          Fees: {
            type: "string",
            title: "Fees",
            enum: ["00", "01"],
            "x-enum-labels": { "00": "Without fees", "01": "With fees" },
            "x-enum-display": "segmented",
          },
          Lock: {
            type: "string",
            title: "Rates",
            enum: ["00", "01"],
            "x-enum-labels": { "00": "Editable", "01": "Locked" },
            "x-enum-display": "segmented",
          },
        },
        "x-on-change": [
          { when: { properties: { LoanTermAction: { const: "01" } } }, show: ["groups/LoanTerms"] },
          { when: { properties: { Fees: { const: "01" } } }, show: ["groups/LoanTerms/Fee"] },
          { when: { properties: { Lock: { const: "01" } } }, patch: { "groups/LoanTerms/Rate": { readOnly: true } } },
        ],
      },
      groups: {
        type: "object",
        title: "Groups",
        properties: {
          LoanTerms: {
            type: "array",
            title: "Loan term rates",
            "x-layout": "table",
            items: {
              type: "object",
              properties: {
                Term: { type: "integer", title: "Term" },
                Rate: { type: "number", title: "Rate" },
                Fee: { type: "number", title: "Fee" },
              },
            },
          },
        },
      },
    },
  },
};

export const LISTENER_EXAMPLES: ListenerExample[] = [loan, memberClass, shipping, expressions, cascade, nested, patch, paths];
