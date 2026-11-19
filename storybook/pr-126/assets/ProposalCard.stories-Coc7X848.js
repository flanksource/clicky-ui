import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./jsx-runtime-DKU1u6-r.js";import{n,t as r}from"./ProposalCard-A7M3kvWI.js";import{n as i,o as a,s as o,t as s}from"./comment-fixtures-Bcc0YWf1.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w;function T(){return(T=e((()=>{n(),i(),c=t(),{expect:l,fn:u,userEvent:d,within:f}=__STORYBOOK_MODULE_TEST__,p={onApplyProposal:u(async()=>{}),onRejectProposal:u(async()=>{}),onRequestRevision:u(async()=>{}),loadProposalDiff:u(async()=>o)},m={title:`Comments/ProposalCard`,component:r,parameters:{layout:`padded`},tags:[`autodocs`],args:{commentId:`c1r3`,proposal:a,callbacks:p},decorators:[e=>(0,c.jsx)(`div`,{className:`max-w-xl`,children:(0,c.jsx)(e,{})})]},h={},g={play:async({canvasElement:e})=>{let t=f(e);await d.click(t.getByRole(`button`,{name:/show diff/i})),await l(await t.findByText(/Math\.round/)).toBeInTheDocument()}},_={play:async({canvasElement:e})=>{let t=f(e);await d.click(t.getByRole(`button`,{name:`Ask for revisions`})),await l(t.getByRole(`button`,{name:`Send feedback`})).toBeDisabled(),await d.type(t.getByLabelText(`Revision feedback`),`Also cover negative amounts`),await l(t.getByRole(`button`,{name:`Send feedback`})).toBeEnabled()}},v={args:{callbacks:{...p,onApplyProposal:async()=>{throw Error(`working tree has conflicting changes in src/rollup/currency.ts`)}}},play:async({canvasElement:e})=>{let t=f(e);await d.click(t.getByRole(`button`,{name:`Apply`})),await l(await t.findByRole(`alert`)).toBeInTheDocument()}},y={args:{callbacks:{}}},b={args:{proposal:{...a,state:`applied`,decidedBy:s,decidedAt:`2026-06-20T10:00:00.000Z`}}},x={args:{proposal:{...a,state:`rejected`,decidedBy:s,decidedAt:`2026-06-20T10:00:00.000Z`,feedback:`This changes rounding for every currency, not just the rollup.`}}},S={args:{proposal:{...a,state:`revision_requested`,decidedBy:s,decidedAt:`2026-06-20T10:00:00.000Z`,feedback:`Please add a test for negative amounts.`}}},C={args:{proposal:{...a,state:`superseded`}}},w=[`Proposed`,`ExpandedDiff`,`AskForRevisions`,`ApplyFails`,`ReadOnly`,`Applied`,`Rejected`,`RevisionRequested`,`Superseded`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: /show diff/i
    }));
    await expect(await canvas.findByText(/Math\\.round/)).toBeInTheDocument();
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Ask for revisions"
    }));
    await expect(canvas.getByRole("button", {
      name: "Send feedback"
    })).toBeDisabled();
    await userEvent.type(canvas.getByLabelText("Revision feedback"), "Also cover negative amounts");
    await expect(canvas.getByRole("button", {
      name: "Send feedback"
    })).toBeEnabled();
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    callbacks: {
      ...callbacks,
      onApplyProposal: async () => {
        throw new Error("working tree has conflicting changes in src/rollup/currency.ts");
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Apply"
    }));
    await expect(await canvas.findByRole("alert")).toBeInTheDocument();
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    callbacks: {}
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    proposal: {
      ...sampleProposal,
      state: "applied",
      decidedBy: ME,
      decidedAt: "2026-06-20T10:00:00.000Z"
    }
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    proposal: {
      ...sampleProposal,
      state: "rejected",
      decidedBy: ME,
      decidedAt: "2026-06-20T10:00:00.000Z",
      feedback: "This changes rounding for every currency, not just the rollup."
    }
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    proposal: {
      ...sampleProposal,
      state: "revision_requested",
      decidedBy: ME,
      decidedAt: "2026-06-20T10:00:00.000Z",
      feedback: "Please add a test for negative amounts."
    }
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    proposal: {
      ...sampleProposal,
      state: "superseded"
    }
  }
}`,...C.parameters?.docs?.source}}}})))()}T();export{b as Applied,v as ApplyFails,_ as AskForRevisions,g as ExpandedDiff,h as Proposed,y as ReadOnly,x as Rejected,S as RevisionRequested,C as Superseded,w as __namedExportsOrder,m as default};