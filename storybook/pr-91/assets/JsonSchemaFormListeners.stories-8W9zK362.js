import{r as B,j as c}from"./iframe-DxH86FBA.js";import{J as x}from"./JsonSchemaForm-CQNmWJv1.js";import"./preload-helper-CwXsRPHT.js";import"./utils-DW-IJACk.js";import"./Icon-w2YOVKhv.js";import"./DropdownMenu-D1hlo_Nj.js";import"./floating-ui.react-DSfQFonv.js";import"./index-L0gHVN2T.js";import"./index-CZl4QIDy.js";import"./button-O6d4Fxrc.js";import"./index-CPURVhFy.js";import"./loading-DCaPMG1Q.js";import"./DropdownMenuSubmenu-t2kTmtnY.js";import"./modalStack-DuyRP-Gh.js";import"./zIndex-BGbNBNA8.js";import"./Properties-DN4TjyBB.js";import"./IconButton-C9GSHWpU.js";import"./HoverCard-BGftSBK_.js";import"./json-schema-form-utils-DXLI5rc1.js";import"./json-schema-form-size-E77C3uZS.js";import"./collections-CoHfwOze.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-THEiNRgN.js";import"./FilterPill-Df2C1Mtk.js";import"./DateField-CevG5Bnl.js";import"./DatePicker-CC8lYb-q.js";import"./DateTimePicker-Bohm6PVx.js";import"./SegmentedControl-DLtJY0HA.js";import"./path-tree-cspfj8J9.js";import"./TreePickerField-RIb89bNl.js";import"./Tree-DYj4yj7v.js";import"./TreeNode-0_t9gltg.js";import"./AccordionList-CD0seW3U.js";import"./InputField-GC6L0KAW.js";import"./use-hotkey-_x9Fkqnd.js";import"./ListMenu-BHcfpHFX.js";import"./Markdown-DN46MpBL.js";import"./Callout-BCbp8nOy.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DPXYBExk.js";import"./CodeDiff-D61IJrGu.js";import"./HighlightedTokens-DNniJjSO.js";import"./JsonView-GcXUgX4X.js";const{expect:t,userEvent:o,waitFor:r,within:m}=__STORYBOOK_MODULE_TEST__,T={type:"object",required:["MemberClassGroupOption"],properties:{MemberClassGroupOption:{type:"string",title:"Member class group",enum:["01","02"],"x-enum-labels":{"01":"Add","02":"Update"},"x-enum-display":"segmented","x-on-change":[{when:{const:"01"},show:["NewMemberClassGroup"],require:["NewMemberClassGroup"],hide:["CurrentMemberClassGroup","ChangeReason"],reset:["CurrentMemberClassGroup","ChangeReason"],else:{hide:["NewMemberClassGroup"],show:["CurrentMemberClassGroup","ChangeReason"],require:["CurrentMemberClassGroup"],reset:["NewMemberClassGroup"],set:{ChangeReason:"Amendment"}}}]},NewMemberClassGroup:{type:"string",title:"New member class group"},CurrentMemberClassGroup:{type:"string",title:"Current member class group"},ChangeReason:{type:"string",title:"Change reason"},LoanOverride:{type:"string",title:"Loan override",enum:["00","01"],"x-enum-labels":{"00":"No","01":"Yes"},"x-enum-display":"segmented","x-on-change":[{when:{const:"01"},show:["LoanAmount"],require:["LoanAmount"],enable:["LoanRate"],set:{LoanAmount:1e3},else:{hide:["LoanAmount"],disable:["LoanRate"],reset:["LoanAmount","LoanRate"]}}]},LoanAmount:{type:"number",title:"Loan amount","x-on-change":[{when:{expr:"value > 100000"},show:["ApprovalCode"],require:["ApprovalCode"],else:{hide:["ApprovalCode"],reset:["ApprovalCode"]}}]},LoanRate:{type:"number",title:"Loan rate",default:3.5},ApprovalCode:{type:"string",title:"Approval code"}}},L={"value > 100000":n=>Number(n)>1e5},f=({expr:n,value:a})=>{const e=L[n];if(!e)throw new Error(`demo evaluator: unsupported expression "${n}"`);return e(a)},u=(n,a)=>({type:"array",title:n,"x-layout":"table",items:{type:"object",properties:a}}),C={type:"object","x-on-load":[{hide:["groups/LoanTerms","groups/LoanTerms/Fee","groups/Benefits"]}],properties:{input:{type:"object",title:"Input",properties:{LoanTermAction:{type:"string",title:"Loan terms",enum:["01","02"],"x-enum-labels":{"01":"Override","02":"Default"},"x-enum-display":"segmented"},Fees:{type:"string",title:"Fees",enum:["00","01"],"x-enum-labels":{"00":"Without fees","01":"With fees"},"x-enum-display":"segmented"},BenefitOption:{type:"string",title:"Benefits",enum:["00","01"],"x-enum-labels":{"00":"No benefits","01":"Benefit table"},"x-enum-display":"segmented"}},"x-on-change":[{when:{properties:{LoanTermAction:{const:"01"}}},show:["groups/LoanTerms"]},{when:{properties:{Fees:{const:"01"}}},show:["groups/LoanTerms/Fee"]},{when:{properties:{BenefitOption:{const:"01"}}},show:["groups/Benefits"]}]},groups:{type:"object",title:"Groups",properties:{LoanTerms:u("Loan term rates",{Term:{type:"integer",title:"Term"},Rate:{type:"number",title:"Rate"},Fee:{type:"number",title:"Fee"}}),Benefits:u("Benefits",{Benefit:{type:"string",title:"Benefit"},Cover:{type:"number",title:"Cover"}})}}}},A={MemberClassGroupOption:"01",LoanOverride:"00"};function R({schema:n,initial:a=A}){const[e,s]=B.useState(a);return c.jsxs("div",{className:"max-w-2xl space-y-4 p-4",children:[c.jsx(x,{schema:n,value:e,onChange:s,expressionEvaluator:f,showPreferencesMenu:!1}),c.jsx("pre",{"data-testid":"form-value",className:"overflow-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs",children:JSON.stringify(e,null,2)})]})}const we={title:"JsonSchemaForm/Listeners",component:R,args:{schema:T},parameters:{docs:{description:{component:["`x-on-change: [{ when, ...actions, else }]` on a property acts on its **sibling** fields.","","- **`when`** takes the same predicate grammar as an `if` (`const`, `enum`, `not`, nested `properties`),","  applied to the source field's value, plus an optional **`expr`** evaluated by the","  `expressionEvaluator` prop (sync: `({ expr, key, value, self, root }) => boolean`). Both must hold.","  Omitted, the listener always applies.","- **State actions** (`hide`/`show`, `enable`/`disable`, `require`/`optional`) are *derived*: they are","  re-evaluated from the current value every render, so a loaded record gets the right shape.","- **Value actions** (`reset` → schema `default` or removed, `set` → literal) are *transitional*: they fire","  in the same commit as the edit, and cascade into the listeners of any field they change.","- A `hide`/`show`/`enable`/`disable` target or `patch` key may be a **path** into a sibling's subtree:","  `groups/LoanTerms` hides a group, `groups/LoanTerms/Fee` one column of it (arrays are crossed into","  their `items`). Listeners on different paths under one sibling all stay applied.","- An object's **`x-on-load`** listeners (same shape, `when` read against the object itself) run before","  any `x-on-change`, so a change listener can override the load state. They allow state actions and `patch` only.","- Unknown targets, contradictory actions, an unevaluable `when`, or an `expr` without an evaluator throw."].join(`
`)}}}};function d(n){return JSON.parse(n.getByTestId("form-value").textContent??"{}")}const i={play:async({canvasElement:n,step:a})=>{const e=m(n);await a("Add shows and requires the new-group field",async()=>{t(e.getByLabelText(/^New member class group/)).toBeInTheDocument(),t(e.getByText("New member class group").closest("label")).toHaveTextContent("*"),t(e.queryByText("Current member class group")).not.toBeInTheDocument(),t(e.queryByText("Change reason")).not.toBeInTheDocument()}),await a("Update swaps the fields and sets a change reason",async()=>{await o.click(e.getByRole("radio",{name:"Update (02)"})),await r(()=>t(e.getByText("Current member class group")).toBeInTheDocument()),t(e.queryByText("New member class group")).not.toBeInTheDocument(),t(e.getByLabelText(/^Change reason/)).toHaveValue("Amendment")}),await a("Loan override enables the rate and sets a starting amount",async()=>{t(e.getByLabelText(/^Loan rate/)).toBeDisabled(),t(e.queryByText("Loan amount")).not.toBeInTheDocument(),await o.click(e.getByRole("radio",{name:"Yes (01)"})),await r(()=>t(e.getByLabelText(/^Loan amount/)).toHaveValue("1000")),t(e.getByLabelText(/^Loan rate/)).not.toBeDisabled()}),await a("An expr listener reveals the approval code above the threshold",async()=>{t(e.queryByText("Approval code")).not.toBeInTheDocument();const s=e.getByLabelText(/^Loan amount/);await o.clear(s),await o.type(s,"250000"),await r(()=>t(e.getByText("Approval code")).toBeInTheDocument())}),await a("Turning the override off hides and resets the loan fields",async()=>{await o.type(e.getByLabelText(/^Loan rate/),"{backspace}9"),await o.click(e.getByRole("radio",{name:"No (00)"})),await r(()=>t(e.queryByText("Loan amount")).not.toBeInTheDocument()),t(e.queryByText("Approval code")).not.toBeInTheDocument(),t(d(e)).toMatchObject({LoanOverride:"00",LoanRate:3.5}),t(d(e)).not.toHaveProperty("LoanAmount")})}};function p(n){return m(n).getAllByRole("columnheader").map(a=>a.textContent??"").filter(Boolean)}const l={args:{schema:C,initial:{input:{LoanTermAction:"02",Fees:"00",BenefitOption:"00"},groups:{LoanTerms:[{Term:12,Rate:4.5,Fee:10}],Benefits:[{Benefit:"Death",Cover:1e5}]}}},play:async({canvasElement:n,step:a})=>{const e=m(n);await a("x-on-load starts every group hidden",async()=>{t(e.queryAllByRole("table")).toHaveLength(0)}),await a("A path listener reveals the loan-term group, without its load-hidden fee column",async()=>{await o.click(e.getByRole("radio",{name:"Override (01)"})),await r(()=>t(e.getAllByRole("table")).toHaveLength(1)),t(p(e.getByRole("table"))).toEqual(["Term","Rate"])}),await a("A cell path reveals the fee column",async()=>{await o.click(e.getByRole("radio",{name:"With fees (01)"})),await r(()=>t(p(e.getByRole("table"))).toEqual(["Term","Rate","Fee"]))}),await a("A second group toggles independently of the first",async()=>{await o.click(e.getByRole("radio",{name:"Benefit table (01)"})),await r(()=>t(e.getAllByRole("table")).toHaveLength(2)),await o.click(e.getByRole("radio",{name:"Default (02)"})),await r(()=>t(e.getAllByRole("table")).toHaveLength(1)),t(p(e.getByRole("table"))).toEqual(["Benefit","Cover"])})}};var h,y,g;i.parameters={...i.parameters,docs:{...(h=i.parameters)==null?void 0:h.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Add shows and requires the new-group field", async () => {
      expect(canvas.getByLabelText(/^New member class group/)).toBeInTheDocument();
      expect(canvas.getByText("New member class group").closest("label")).toHaveTextContent("*");
      expect(canvas.queryByText("Current member class group")).not.toBeInTheDocument();
      expect(canvas.queryByText("Change reason")).not.toBeInTheDocument();
    });
    await step("Update swaps the fields and sets a change reason", async () => {
      await userEvent.click(canvas.getByRole("radio", {
        name: "Update (02)"
      }));
      await waitFor(() => expect(canvas.getByText("Current member class group")).toBeInTheDocument());
      expect(canvas.queryByText("New member class group")).not.toBeInTheDocument();
      expect(canvas.getByLabelText(/^Change reason/)).toHaveValue("Amendment");
    });
    await step("Loan override enables the rate and sets a starting amount", async () => {
      expect(canvas.getByLabelText(/^Loan rate/)).toBeDisabled();
      expect(canvas.queryByText("Loan amount")).not.toBeInTheDocument();
      await userEvent.click(canvas.getByRole("radio", {
        name: "Yes (01)"
      }));
      await waitFor(() => expect(canvas.getByLabelText(/^Loan amount/)).toHaveValue("1000"));
      expect(canvas.getByLabelText(/^Loan rate/)).not.toBeDisabled();
    });
    await step("An expr listener reveals the approval code above the threshold", async () => {
      expect(canvas.queryByText("Approval code")).not.toBeInTheDocument();
      const amount = canvas.getByLabelText(/^Loan amount/);
      await userEvent.clear(amount);
      await userEvent.type(amount, "250000");
      await waitFor(() => expect(canvas.getByText("Approval code")).toBeInTheDocument());
    });
    await step("Turning the override off hides and resets the loan fields", async () => {
      await userEvent.type(canvas.getByLabelText(/^Loan rate/), "{backspace}9");
      await userEvent.click(canvas.getByRole("radio", {
        name: "No (00)"
      }));
      await waitFor(() => expect(canvas.queryByText("Loan amount")).not.toBeInTheDocument());
      expect(canvas.queryByText("Approval code")).not.toBeInTheDocument();
      expect(formValue(canvas)).toMatchObject({
        LoanOverride: "00",
        LoanRate: 3.5
      });
      expect(formValue(canvas)).not.toHaveProperty("LoanAmount");
    });
  }
}`,...(g=(y=i.parameters)==null?void 0:y.docs)==null?void 0:g.source}}};var v,w,b;l.parameters={...l.parameters,docs:{...(v=l.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    schema: groupsSchema,
    initial: {
      input: {
        LoanTermAction: "02",
        Fees: "00",
        BenefitOption: "00"
      },
      groups: {
        LoanTerms: [{
          Term: 12,
          Rate: 4.5,
          Fee: 10
        }],
        Benefits: [{
          Benefit: "Death",
          Cover: 100000
        }]
      }
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("x-on-load starts every group hidden", async () => {
      expect(canvas.queryAllByRole("table")).toHaveLength(0);
    });
    await step("A path listener reveals the loan-term group, without its load-hidden fee column", async () => {
      await userEvent.click(canvas.getByRole("radio", {
        name: "Override (01)"
      }));
      await waitFor(() => expect(canvas.getAllByRole("table")).toHaveLength(1));
      expect(columnHeaders(canvas.getByRole("table"))).toEqual(["Term", "Rate"]);
    });
    await step("A cell path reveals the fee column", async () => {
      await userEvent.click(canvas.getByRole("radio", {
        name: "With fees (01)"
      }));
      await waitFor(() => expect(columnHeaders(canvas.getByRole("table"))).toEqual(["Term", "Rate", "Fee"]));
    });
    await step("A second group toggles independently of the first", async () => {
      await userEvent.click(canvas.getByRole("radio", {
        name: "Benefit table (01)"
      }));
      await waitFor(() => expect(canvas.getAllByRole("table")).toHaveLength(2));
      await userEvent.click(canvas.getByRole("radio", {
        name: "Default (02)"
      }));
      await waitFor(() => expect(canvas.getAllByRole("table")).toHaveLength(1));
      expect(columnHeaders(canvas.getByRole("table"))).toEqual(["Benefit", "Cover"]);
    });
  }
}`,...(b=(w=l.parameters)==null?void 0:w.docs)==null?void 0:b.source}}};const be=["ChangeListeners","PathTargetsAndOnLoad"];export{i as ChangeListeners,l as PathTargetsAndOnLoad,be as __namedExportsOrder,we as default};
