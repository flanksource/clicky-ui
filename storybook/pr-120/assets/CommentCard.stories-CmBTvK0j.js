import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./CommentCard-mAG1j-Vq.js";import{n as r,r as i,t as a}from"./comment-fixtures-BqJs4778.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{t(),a(),{expect:o,fn:s,userEvent:c,within:l}=__STORYBOOK_MODULE_TEST__,u=r[0],d=r[3],f={title:`Comments/CommentCard`,component:n,parameters:{layout:`padded`},tags:[`autodocs`],args:{comment:u,config:i}},p={args:{onUpdateStatus:s()}},m={args:{defaultExpanded:!0}},h={args:{comment:d,defaultExpanded:!0}},g={id:`a-claude`,name:`claude`,kind:`agent`},_={args:{comment:{...u,status:`in_progress`,assignee:g,acknowledgedBy:g,acknowledgedAt:`2026-01-02T00:00:00.000Z`},defaultExpanded:!0},play:async({canvasElement:e})=>{await o(l(e).getByText(`Assigned to claude`)).toBeVisible()}},v={args:{comment:{...u,status:`open`},config:{...i,assignees:i.mentionables??[]},defaultExpanded:!0,onAcknowledge:s(),onAssign:s(),extraAssignItems:()=>[{label:`Run agent…`,onSelect:s()}]},play:async({canvasElement:e,args:t})=>{await c.click(l(e).getByRole(`button`,{name:`Comment actions`}));let n=l(document.body);await c.click(n.getByRole(`menuitem`,{name:`Assign…`})),await c.click(n.getByRole(`menuitem`,{name:`claude`})),await o(t.onAssign).toHaveBeenCalledWith(o.objectContaining({name:`claude`,kind:`agent`}))}},y=[`Collapsed`,`Expanded`,`ResolvedByAgent`,`AssignedToAgent`,`AcknowledgeAndAssign`],p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    onUpdateStatus: fn()
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    defaultExpanded: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    comment: agentReply,
    defaultExpanded: true
  }
}`,...h.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    comment: {
      ...root,
      status: "in_progress",
      assignee: claude,
      acknowledgedBy: claude,
      acknowledgedAt: "2026-01-02T00:00:00.000Z"
    },
    defaultExpanded: true
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("Assigned to claude")).toBeVisible();
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    comment: {
      ...root,
      status: "open"
    },
    config: {
      ...sampleConfig,
      assignees: sampleConfig.mentionables ?? []
    },
    defaultExpanded: true,
    onAcknowledge: fn(),
    onAssign: fn(),
    // The seam a host uses to start an action from an assignment.
    extraAssignItems: () => [{
      label: "Run agent…",
      onSelect: fn()
    }]
  },
  play: async ({
    canvasElement,
    args
  }) => {
    await userEvent.click(within(canvasElement).getByRole("button", {
      name: "Comment actions"
    }));
    const menu = within(document.body);
    await userEvent.click(menu.getByRole("menuitem", {
      name: "Assign…"
    }));
    await userEvent.click(menu.getByRole("menuitem", {
      name: "claude"
    }));
    await expect(args.onAssign).toHaveBeenCalledWith(expect.objectContaining({
      name: "claude",
      kind: "agent"
    }));
  }
}`,...v.parameters?.docs?.source}}}})))()}b();export{v as AcknowledgeAndAssign,_ as AssignedToAgent,p as Collapsed,m as Expanded,h as ResolvedByAgent,y as __namedExportsOrder,f as default};