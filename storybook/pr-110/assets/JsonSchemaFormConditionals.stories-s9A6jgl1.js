import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./JsonSchemaForm-_t7LUA4N.js";function a({schema:e}){let[t,n]=(0,o.useState)({MemberClassGroupOption:`01`,LoanOverride:`00`});return(0,s.jsxs)(`div`,{className:`max-w-2xl space-y-4 p-4`,children:[(0,s.jsx)(i,{schema:e,value:t,onChange:n,showPreferencesMenu:!1}),(0,s.jsx)(`pre`,{className:`overflow-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs`,children:JSON.stringify(t,null,2)})]})}var o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{o=t(),r(),s=n(),{expect:c,userEvent:l,waitFor:u,within:d}=__STORYBOOK_MODULE_TEST__,f={type:`object`,required:[`MemberClassGroupOption`],properties:{MemberClassGroupOption:{type:`string`,title:`Member class group`,enum:[`01`,`02`],"x-enum-labels":{"01":`Add`,"02":`Update`},"x-enum-display":`segmented`},NewMemberClassGroup:{type:`string`,title:`New member class group`,"x-hidden":!0},CurrentMemberClassGroup:{type:`string`,title:`Current member class group`,"x-hidden":!0},ChangeReason:{type:`string`,title:`Change reason`,"x-hidden":!0},LoanOverride:{type:`string`,title:`Loan override`,enum:[`00`,`01`],"x-enum-labels":{"00":`No`,"01":`Yes`},"x-enum-display":`segmented`},LoanAmount:{type:`number`,title:`Loan amount`,"x-hidden":!0},LoanRate:{type:`number`,title:`Loan rate`,"x-hidden":!0}},allOf:[{if:{properties:{MemberClassGroupOption:{const:`01`}},required:[`MemberClassGroupOption`]},then:{properties:{NewMemberClassGroup:{type:`string`,title:`New member class group`}},required:[`NewMemberClassGroup`]},else:{properties:{CurrentMemberClassGroup:{type:`string`,title:`Current member class group`}},required:[`CurrentMemberClassGroup`]}},{if:{properties:{MemberClassGroupOption:{not:{const:`01`}}},required:[`MemberClassGroupOption`]},then:{properties:{ChangeReason:{type:`string`,title:`Change reason`}}}},{if:{properties:{LoanOverride:{const:`01`}},required:[`LoanOverride`]},then:{properties:{LoanAmount:{type:`number`,title:`Loan amount`},LoanRate:{type:`number`,title:`Loan rate`}}}}]},p={title:`JsonSchemaForm/Conditionals`,component:a,args:{schema:f},parameters:{docs:{description:{component:"`allOf: [{ if, then, else }]` is re-evaluated against the live value on every render,\nso the form reshapes itself as the user answers.\n\n- **Guards**: `const`, `enum` membership, and `not` (how a `!=` condition is written).\n  A predicate the form cannot evaluate — a bare `type`, a `pattern`, a numeric bound —\n  makes the `if` **false**, never true, so an unverifiable branch is never merged.\n- **`else`** contributes when the `if` does not hold, including when it failed closed.\n- **`x-hidden`** renders nothing for a property. A branch replaces a property wholesale,\n  so re-declaring the field without the flag is what reveals it."}}}},m={play:async({canvasElement:e,step:t})=>{let n=d(e);await t(`Adding shows the new-group field and no change reason`,async()=>{c(n.getByText(`New member class group`)).toBeInTheDocument(),c(n.queryByText(`Current member class group`)).not.toBeInTheDocument(),c(n.queryByText(`Change reason`)).not.toBeInTheDocument()}),await t(`Updating swaps to the else branch and adds the not-guarded field`,async()=>{await l.click(n.getByRole(`radio`,{name:`Update (02)`})),await u(()=>c(n.getByText(`Current member class group`)).toBeInTheDocument()),c(n.queryByText(`New member class group`)).not.toBeInTheDocument(),c(n.getByText(`Change reason`)).toBeInTheDocument()}),await t(`Loan override reveals the hidden loan fields`,async()=>{c(n.queryByText(`Loan amount`)).not.toBeInTheDocument(),await l.click(n.getByRole(`radio`,{name:`Yes (01)`})),await u(()=>c(n.getByText(`Loan amount`)).toBeInTheDocument()),c(n.getByText(`Loan rate`)).toBeInTheDocument()})}},h=[`StateMachine`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("Adding shows the new-group field and no change reason", async () => {
      expect(canvas.getByText("New member class group")).toBeInTheDocument();
      expect(canvas.queryByText("Current member class group")).not.toBeInTheDocument();
      expect(canvas.queryByText("Change reason")).not.toBeInTheDocument();
    });
    await step("Updating swaps to the else branch and adds the not-guarded field", async () => {
      await userEvent.click(canvas.getByRole("radio", {
        name: "Update (02)"
      }));
      await waitFor(() => expect(canvas.getByText("Current member class group")).toBeInTheDocument());
      expect(canvas.queryByText("New member class group")).not.toBeInTheDocument();
      expect(canvas.getByText("Change reason")).toBeInTheDocument();
    });
    await step("Loan override reveals the hidden loan fields", async () => {
      expect(canvas.queryByText("Loan amount")).not.toBeInTheDocument();
      await userEvent.click(canvas.getByRole("radio", {
        name: "Yes (01)"
      }));
      await waitFor(() => expect(canvas.getByText("Loan amount")).toBeInTheDocument());
      expect(canvas.getByText("Loan rate")).toBeInTheDocument();
    });
  }
}`,...m.parameters?.docs?.source}}}})))()}g();export{m as StateMachine,h as __namedExportsOrder,p as default};