import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./Message-_djF4wLE.js";function a(){let[e,t]=(0,o.useState)(),[n,r]=(0,o.useState)(0);return(0,s.jsxs)(`div`,{className:`max-w-2xl space-y-4`,children:[(0,s.jsx)(i,{message:d,onApprove:(e,i)=>{if(r(e=>e+1),n===0)throw Error(`Decision service unavailable; retry the decision.`);t(`${e}: ${i?`approved`:`denied`}`)}}),e&&(0,s.jsx)(`p`,{role:`status`,children:e})]})}var o,s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{o=t(),r(),s=n(),{expect:c,userEvent:l,within:u}=__STORYBOOK_MODULE_TEST__,d={id:`nested-agents`,role:`assistant`,parts:[{type:`dynamic-tool`,toolCallId:`coordinator`,toolName:`Agent`,state:`output-available`,input:{task:`Update the record`},output:`Delegated`},{type:`dynamic-tool`,toolCallId:`worker`,toolName:`Agent`,state:`output-available`,input:{task:`Write the update`},output:`Awaiting decision`,toolMetadata:{parentToolCallId:`coordinator`}},{type:`dynamic-tool`,toolCallId:`update`,toolName:`updateRecord`,state:`approval-requested`,input:{id:`record-1`,status:`reviewed`},approval:{id:`decision-update`},toolMetadata:{parentToolCallId:`worker`}}]},f={title:`Chat/Nested Tool Calls`,component:a},p={play:async({canvasElement:e})=>{let t=u(e);await c(t.getAllByText(`Agent`)).toHaveLength(2),await c(t.getByText(`updateRecord`)).toBeVisible(),await c(t.getByText(`record-1`)).toBeVisible(),await l.click(t.getByRole(`button`,{name:`Approve`})),await c(t.getByRole(`alert`)).toHaveTextContent(`Decision service unavailable`),await c(t.getByRole(`button`,{name:`Deny`})).toBeEnabled(),await l.click(t.getByRole(`button`,{name:`Approve`})),await c(t.getByRole(`status`)).toHaveTextContent(`decision-update: approved`),await c(t.queryByRole(`alert`)).not.toBeInTheDocument()}},m=[`ApprovalRetry`],p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText("Agent")).toHaveLength(2);
    await expect(canvas.getByText("updateRecord")).toBeVisible();
    await expect(canvas.getByText("record-1")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", {
      name: "Approve"
    }));
    await expect(canvas.getByRole("alert")).toHaveTextContent("Decision service unavailable");
    await expect(canvas.getByRole("button", {
      name: "Deny"
    })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", {
      name: "Approve"
    }));
    await expect(canvas.getByRole("status")).toHaveTextContent("decision-update: approved");
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  }
}`,...p.parameters?.docs?.source}}}})))()}h();export{p as ApprovalRetry,m as __namedExportsOrder,f as default};