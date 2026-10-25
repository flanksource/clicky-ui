import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./JsonSchemaForm-DVJtWK8h.js";function a({schema:e,initial:t=y}){let[n,r]=(0,c.useState)(t);return(0,l.jsxs)(`div`,{className:`max-w-2xl space-y-4 p-4`,children:[(0,l.jsx)(i,{schema:e,value:n,onChange:r,expressionEvaluator:g,showPreferencesMenu:!1}),(0,l.jsx)(`pre`,{"data-testid":`form-value`,className:`overflow-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs`,children:JSON.stringify(n,null,2)})]})}function o(e){return JSON.parse(e.getByTestId(`form-value`).textContent??`{}`)}function s(e){return p(e).getAllByRole(`columnheader`).map(e=>e.textContent??``).filter(Boolean)}var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{c=t(),r(),l=n(),{expect:u,userEvent:d,waitFor:f,within:p}=__STORYBOOK_MODULE_TEST__,m={type:`object`,required:[`MemberClassGroupOption`],properties:{MemberClassGroupOption:{type:`string`,title:`Member class group`,enum:[`01`,`02`],"x-enum-labels":{"01":`Add`,"02":`Update`},"x-enum-display":`segmented`,"x-on-change":[{when:{const:`01`},show:[`NewMemberClassGroup`],require:[`NewMemberClassGroup`],hide:[`CurrentMemberClassGroup`,`ChangeReason`],reset:[`CurrentMemberClassGroup`,`ChangeReason`],else:{hide:[`NewMemberClassGroup`],show:[`CurrentMemberClassGroup`,`ChangeReason`],require:[`CurrentMemberClassGroup`],reset:[`NewMemberClassGroup`],set:{ChangeReason:`Amendment`}}}]},NewMemberClassGroup:{type:`string`,title:`New member class group`},CurrentMemberClassGroup:{type:`string`,title:`Current member class group`},ChangeReason:{type:`string`,title:`Change reason`},LoanOverride:{type:`string`,title:`Loan override`,enum:[`00`,`01`],"x-enum-labels":{"00":`No`,"01":`Yes`},"x-enum-display":`segmented`,"x-on-change":[{when:{const:`01`},show:[`LoanAmount`],require:[`LoanAmount`],enable:[`LoanRate`],set:{LoanAmount:1e3},else:{hide:[`LoanAmount`],disable:[`LoanRate`],reset:[`LoanAmount`,`LoanRate`]}}]},LoanAmount:{type:`number`,title:`Loan amount`,"x-on-change":[{when:{expr:`value > 100000`},show:[`ApprovalCode`],require:[`ApprovalCode`],else:{hide:[`ApprovalCode`],reset:[`ApprovalCode`]}}]},LoanRate:{type:`number`,title:`Loan rate`,default:3.5},ApprovalCode:{type:`string`,title:`Approval code`}}},h={"value > 100000":e=>Number(e)>1e5},g=({expr:e,value:t})=>{let n=h[e];if(!n)throw Error(`demo evaluator: unsupported expression "${e}"`);return n(t)},_=(e,t)=>({type:`array`,title:e,"x-layout":`table`,items:{type:`object`,properties:t}}),v={type:`object`,"x-on-load":[{hide:[`groups/LoanTerms`,`groups/LoanTerms/Fee`,`groups/Benefits`]}],properties:{input:{type:`object`,title:`Input`,properties:{LoanTermAction:{type:`string`,title:`Loan terms`,enum:[`01`,`02`],"x-enum-labels":{"01":`Override`,"02":`Default`},"x-enum-display":`segmented`},Fees:{type:`string`,title:`Fees`,enum:[`00`,`01`],"x-enum-labels":{"00":`Without fees`,"01":`With fees`},"x-enum-display":`segmented`},BenefitOption:{type:`string`,title:`Benefits`,enum:[`00`,`01`],"x-enum-labels":{"00":`No benefits`,"01":`Benefit table`},"x-enum-display":`segmented`}},"x-on-change":[{when:{properties:{LoanTermAction:{const:`01`}}},show:[`groups/LoanTerms`]},{when:{properties:{Fees:{const:`01`}}},show:[`groups/LoanTerms/Fee`]},{when:{properties:{BenefitOption:{const:`01`}}},show:[`groups/Benefits`]}]},groups:{type:`object`,title:`Groups`,properties:{LoanTerms:_(`Loan term rates`,{Term:{type:`integer`,title:`Term`},Rate:{type:`number`,title:`Rate`},Fee:{type:`number`,title:`Fee`}}),Benefits:_(`Benefits`,{Benefit:{type:`string`,title:`Benefit`},Cover:{type:`number`,title:`Cover`}})}}}},y={MemberClassGroupOption:`01`,LoanOverride:`00`},b={title:`JsonSchemaForm/Listeners`,component:a,args:{schema:m},parameters:{docs:{description:{component:"`x-on-change: [{ when, ...actions, else }]` on a property acts on its **sibling** fields.\n\n- **`when`** takes the same predicate grammar as an `if` (`const`, `enum`, `not`, nested `properties`),\n  applied to the source field's value, plus an optional **`expr`** evaluated by the\n  `expressionEvaluator` prop (sync: `({ expr, key, value, self, root }) => boolean`). Both must hold.\n  Omitted, the listener always applies.\n- **State actions** (`hide`/`show`, `enable`/`disable`, `require`/`optional`) are *derived*: they are\n  re-evaluated from the current value every render, so a loaded record gets the right shape.\n- **Value actions** (`reset` → schema `default` or removed, `set` → literal) are *transitional*: they fire\n  in the same commit as the edit, and cascade into the listeners of any field they change.\n- A `hide`/`show`/`enable`/`disable` target or `patch` key may be a **path** into a sibling's subtree:\n  `groups/LoanTerms` hides a group, `groups/LoanTerms/Fee` one column of it (arrays are crossed into\n  their `items`). Listeners on different paths under one sibling all stay applied.\n- An object's **`x-on-load`** listeners (same shape, `when` read against the object itself) run before\n  any `x-on-change`, so a change listener can override the load state. They allow state actions and `patch` only.\n- Unknown targets, contradictory actions, an unevaluable `when`, or an `expr` without an evaluator throw."}}}},x={play:async({canvasElement:e,step:t})=>{let n=p(e);await t(`Add shows and requires the new-group field`,async()=>{u(n.getByLabelText(/^New member class group/)).toBeInTheDocument(),u(n.getByText(`New member class group`).closest(`label`)).toHaveTextContent(`*`),u(n.queryByText(`Current member class group`)).not.toBeInTheDocument(),u(n.queryByText(`Change reason`)).not.toBeInTheDocument()}),await t(`Update swaps the fields and sets a change reason`,async()=>{await d.click(n.getByRole(`radio`,{name:`Update (02)`})),await f(()=>u(n.getByText(`Current member class group`)).toBeInTheDocument()),u(n.queryByText(`New member class group`)).not.toBeInTheDocument(),u(n.getByLabelText(/^Change reason/)).toHaveValue(`Amendment`)}),await t(`Loan override enables the rate and sets a starting amount`,async()=>{u(n.getByLabelText(/^Loan rate/)).toBeDisabled(),u(n.queryByText(`Loan amount`)).not.toBeInTheDocument(),await d.click(n.getByRole(`radio`,{name:`Yes (01)`})),await f(()=>u(n.getByLabelText(/^Loan amount/)).toHaveValue(`1000`)),u(n.getByLabelText(/^Loan rate/)).not.toBeDisabled()}),await t(`An expr listener reveals the approval code above the threshold`,async()=>{u(n.queryByText(`Approval code`)).not.toBeInTheDocument();let e=n.getByLabelText(/^Loan amount/);await d.clear(e),await d.type(e,`250000`),await f(()=>u(n.getByText(`Approval code`)).toBeInTheDocument())}),await t(`Turning the override off hides and resets the loan fields`,async()=>{await d.type(n.getByLabelText(/^Loan rate/),`{backspace}9`),await d.click(n.getByRole(`radio`,{name:`No (00)`})),await f(()=>u(n.queryByText(`Loan amount`)).not.toBeInTheDocument()),u(n.queryByText(`Approval code`)).not.toBeInTheDocument(),u(o(n)).toMatchObject({LoanOverride:`00`,LoanRate:3.5}),u(o(n)).not.toHaveProperty(`LoanAmount`)})}},S={args:{schema:v,initial:{input:{LoanTermAction:`02`,Fees:`00`,BenefitOption:`00`},groups:{LoanTerms:[{Term:12,Rate:4.5,Fee:10}],Benefits:[{Benefit:`Death`,Cover:1e5}]}}},play:async({canvasElement:e,step:t})=>{let n=p(e);await t(`x-on-load starts every group hidden`,async()=>{u(n.queryAllByRole(`table`)).toHaveLength(0)}),await t(`A path listener reveals the loan-term group, without its load-hidden fee column`,async()=>{await d.click(n.getByRole(`radio`,{name:`Override (01)`})),await f(()=>u(n.getAllByRole(`table`)).toHaveLength(1)),u(s(n.getByRole(`table`))).toEqual([`Term`,`Rate`])}),await t(`A cell path reveals the fee column`,async()=>{await d.click(n.getByRole(`radio`,{name:`With fees (01)`})),await f(()=>u(s(n.getByRole(`table`))).toEqual([`Term`,`Rate`,`Fee`]))}),await t(`A second group toggles independently of the first`,async()=>{await d.click(n.getByRole(`radio`,{name:`Benefit table (01)`})),await f(()=>u(n.getAllByRole(`table`)).toHaveLength(2)),await d.click(n.getByRole(`radio`,{name:`Default (02)`})),await f(()=>u(n.getAllByRole(`table`)).toHaveLength(1)),u(s(n.getByRole(`table`))).toEqual([`Benefit`,`Cover`])})}},C=[`ChangeListeners`,`PathTargetsAndOnLoad`],x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}}})))()}w();export{x as ChangeListeners,S as PathTargetsAndOnLoad,C as __namedExportsOrder,b as default};