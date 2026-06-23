import{j as e}from"./iframe-tozGD2Qm.js";import{c as d}from"./utils-BLSKlp9E.js";import{I as b}from"./Icon-DV6apHHG.js";import{B as f}from"./Badge-Bd6WN4rF.js";import{U as v}from"./UiGitPr-C04lTHKK.js";import{U as w}from"./UiCheck-C56O4kNi.js";import{U as k}from"./UiComment-DDumnwAR.js";import{U as T}from"./UiWarningTriangle-BKdxK1X_.js";import{U as j}from"./UiClose-DbbVB4Tg.js";import"./preload-helper-DMBmwiZ1.js";import"./index-1evVQkiP.js";const N={success:"bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",danger:"bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",warning:"bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",info:"bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",neutral:"bg-muted text-muted-foreground"};function n({items:t,className:s}){return e.jsx("ol",{className:d("relative",s),children:t.map((a,i)=>{const y=i===t.length-1;return e.jsxs("li",{className:"relative flex gap-density-3 pb-density-4 last:pb-0",children:[!y&&e.jsx("span",{"aria-hidden":!0,className:"absolute bottom-0 left-[10px] top-[22px] w-px bg-border"}),e.jsx("span",{className:d("relative z-[1] flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full",N[a.tone??"neutral"]),children:a.icon&&e.jsx(b,{...typeof a.icon=="string"?{name:a.icon}:{icon:a.icon},className:"h-3 w-3"})}),e.jsxs("div",{className:"min-w-0 flex-1 pt-px",children:[e.jsxs("div",{className:"text-sm",children:[a.actor&&e.jsx("span",{className:"font-semibold text-foreground",children:a.actor}),a.action&&e.jsxs("span",{className:"text-muted-foreground",children:[" ",a.action]}),a.timestamp&&e.jsxs("span",{className:"ml-1.5 text-xs text-muted-foreground",children:["· ",a.timestamp]})]}),a.body!=null&&e.jsxs("div",{className:"mt-1.5 overflow-hidden rounded-md border border-border bg-secondary",children:[a.bodyHeader!=null&&e.jsx("div",{className:"border-b border-border px-density-3 py-1.5 text-xs",children:a.bodyHeader}),e.jsx("div",{className:"px-density-3 py-density-2 text-sm leading-relaxed text-foreground",children:a.body})]})]})]},a.id)})})}try{n.displayName="Timeline",n.__docgenInfo={description:"Vertical activity feed (the Gavel `TimelineCard`): each event has a\ntone-colored icon disc joined by a connector rail, an actor/action/time\nline, and an optional body bubble for threaded detail. Domain-agnostic —\ncallers compose `bodyHeader` (e.g. a file anchor + status `Badge`) and\n`body` themselves.",displayName:"Timeline",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/Timeline.tsx",methods:[],props:{items:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/Timeline.tsx",name:"TypeLiteral"}],description:"Events rendered top to bottom, connected by a rail.",name:"items",required:!0,tags:{},type:{name:"TimelineItem[]"}},className:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/Timeline.tsx",name:"TypeLiteral"}],description:"Classes applied to the list.",name:"className",required:!1,tags:{},type:{name:"string"}}},tags:{}}}catch{}const{expect:l,within:E}=__STORYBOOK_MODULE_TEST__,W={title:"Data/Timeline",component:n,tags:["autodocs"],parameters:{docs:{description:{component:"Vertical activity feed (the Gavel PR `TimelineCard`): tone-colored icon discs joined by a rail, an actor/action/time line, and an optional threaded body bubble."}}}},c=[{id:1,icon:v,tone:"neutral",actor:"adityathebe",action:"opened this pull request",timestamp:"3d ago"},{id:2,icon:w,tone:"success",actor:"moshloop",action:"approved these changes",timestamp:"1d ago"},{id:3,icon:k,tone:"info",actor:"yashmehrotra",action:"commented on internal/sse/reconnect.go:42",timestamp:"1d ago",bodyHeader:e.jsxs("div",{className:"flex items-center justify-between gap-2",children:[e.jsx("span",{className:"font-mono text-primary",children:"internal/sse/reconnect.go:42"}),e.jsx(f,{tone:"warning",size:"xs",children:"Unresolved"})]}),body:"Debounce the SSE reconnect — on flaky networks this hammers the controller."},{id:4,icon:T,tone:"warning",actor:"flankbot",action:"detected merge conflicts with main",timestamp:"5d ago"},{id:5,icon:j,tone:"danger",actor:"flankbot",action:'check "e2e" failed — reconnect timeout',timestamp:"1d ago"}],r={args:{items:c},render:t=>e.jsx("div",{style:{maxWidth:560},children:e.jsx(n,{...t})})},o={args:{items:c},render:t=>e.jsx("div",{style:{maxWidth:560},children:e.jsx(n,{...t})}),play:async({canvasElement:t,step:s})=>{const a=E(t);await s("every event row is rendered",async()=>{const i=t.querySelectorAll("li");await l(i.length).toBe(c.length)}),await s("threaded comment body is shown",async()=>{await l(a.getByText(/Debounce the SSE reconnect/)).toBeInTheDocument()})}};var m,p,x;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    items: ITEMS
  },
  render: args => <div style={{
    maxWidth: 560
  }}>
      <Timeline {...args} />
    </div>
}`,...(x=(p=r.parameters)==null?void 0:p.docs)==null?void 0:x.source}}};var g,h,u;o.parameters={...o.parameters,docs:{...(g=o.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    items: ITEMS
  },
  render: args => <div style={{
    maxWidth: 560
  }}>
      <Timeline {...args} />
    </div>,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("every event row is rendered", async () => {
      const rows = canvasElement.querySelectorAll("li");
      await expect(rows.length).toBe(ITEMS.length);
    });
    await step("threaded comment body is shown", async () => {
      await expect(canvas.getByText(/Debounce the SSE reconnect/)).toBeInTheDocument();
    });
  }
}`,...(u=(h=o.parameters)==null?void 0:h.docs)==null?void 0:u.source}}};const A=["Default","RendersAllEvents"];export{r as Default,o as RendersAllEvents,A as __namedExportsOrder,W as default};
