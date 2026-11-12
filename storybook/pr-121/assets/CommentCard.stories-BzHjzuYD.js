import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./CommentCard-D-FR79g6.js";import{n as i,r as a,t as o}from"./comment-fixtures-D31KTpDo.js";var s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w;function T(){return(T=e((()=>{n(),o(),s=t(),{expect:c,fn:l,userEvent:u,within:d}=__STORYBOOK_MODULE_TEST__,f=i[0],p=i[3],m={title:`Comments/CommentCard`,component:r,parameters:{layout:`padded`},tags:[`autodocs`],args:{comment:f,config:a}},h={args:{onUpdateStatus:l()}},g={args:{defaultExpanded:!0}},_={args:{comment:p,defaultExpanded:!0}},v={id:`a-claude`,name:`claude`,kind:`agent`},y={args:{comment:{...f,status:`in_progress`,assignee:v,acknowledgedBy:v,acknowledgedAt:`2026-01-02T00:00:00.000Z`},defaultExpanded:!0},play:async({canvasElement:e})=>{await c(d(e).getByText(`Assigned to claude`)).toBeVisible()}},b={id:`claude:s-1`,name:`claude-opus-5-5`,kind:`agent`},x=[{title:`Queued`,agentRun:{requestedAt:`2026-01-02T00:00:00.000Z`,state:`queued`,target:{label:`Fix header`}}},{title:`Sent`,agentRun:{requestedAt:`2026-01-02T00:00:00.000Z`,state:`sent`,target:{label:`Fix header`}}},{title:`Replied`,agentRun:{requestedAt:`2026-01-02T00:00:00.000Z`,state:`sent`,repliedAt:`2026-01-02T00:03:00.000Z`,target:{label:`Fix header`}}},{title:`Failed`,agentRun:{requestedAt:`2026-01-02T00:00:00.000Z`,state:`error`,error:`agent session s-1 is no longer live`,target:{label:`Fix header`}}}],S={args:{comment:f},render:e=>(0,s.jsx)(`div`,{className:`space-y-3`,children:x.map(({title:t,agentRun:n})=>(0,s.jsx)(r,{...e,comment:{...f,id:`hand-off-${t}`,status:`in_progress`,assignee:b,agentRun:n}},t))}),play:async({canvasElement:e})=>{let t=d(e).getAllByTestId(`agent-delivery`).map(e=>e.getAttribute(`data-delivery`));await c(t).toEqual([`queued`,`sent`,`replied`,`failed`])}},C={args:{comment:{...f,status:`open`},config:{...a,assignees:a.mentionables??[]},defaultExpanded:!0,onAcknowledge:l(),onAssign:l(),extraAssignItems:()=>[{label:`Run agent…`,onSelect:l()}]},play:async({canvasElement:e,args:t})=>{await u.click(d(e).getByRole(`button`,{name:`Comment actions`}));let n=d(document.body);await u.click(n.getByRole(`menuitem`,{name:`Assign…`})),await u.click(n.getByRole(`menuitem`,{name:`claude`})),await c(t.onAssign).toHaveBeenCalledWith(c.objectContaining({name:`claude`,kind:`agent`}))}},w=[`Collapsed`,`Expanded`,`ResolvedByAgent`,`AssignedToAgent`,`AgentHandOff`,`AcknowledgeAndAssign`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    onUpdateStatus: fn()
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    defaultExpanded: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    comment: agentReply,
    defaultExpanded: true
  }
}`,..._.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    comment: root
  },
  render: args => <div className="space-y-3">
      {handOffs.map(({
      title,
      agentRun
    }) => <CommentCard key={title} {...args} comment={{
      ...root,
      id: \`hand-off-\${title}\`,
      status: "in_progress",
      assignee: opus,
      agentRun
    }} />)}
    </div>,
  play: async ({
    canvasElement
  }) => {
    const stages = within(canvasElement).getAllByTestId("agent-delivery").map(chip => chip.getAttribute("data-delivery"));
    await expect(stages).toEqual(["queued", "sent", "replied", "failed"]);
  }
}`,...S.parameters?.docs?.source},description:{story:`A thread handed to an agent: the provider's glyph, where it went, and a chat-style tick.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}}})))()}T();export{C as AcknowledgeAndAssign,S as AgentHandOff,y as AssignedToAgent,h as Collapsed,g as Expanded,_ as ResolvedByAgent,w as __namedExportsOrder,m as default};