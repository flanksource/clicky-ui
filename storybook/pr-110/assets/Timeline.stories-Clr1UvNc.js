import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{Sa as n,Si as r,Tu as i,Ws as a,n as o,xs as s}from"./icons-N6BqLuiz.js";import{n as c,t as l}from"./utils-CEDXhWC6.js";import{r as u,t as d}from"./Icon-Drf4m9fW.js";import{n as f,t as p}from"./Badge-lfCmNIWB.js";function m({items:e,className:t}){return(0,h.jsx)(`ol`,{className:l(`relative`,t),children:e.map((t,n)=>{let r=n===e.length-1;return(0,h.jsxs)(`li`,{className:`relative flex gap-density-3 pb-density-4 last:pb-0`,children:[!r&&(0,h.jsx)(`span`,{"aria-hidden":!0,className:`absolute bottom-0 left-[10px] top-[22px] w-px bg-border`}),(0,h.jsx)(`span`,{className:l(`relative z-[1] flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full`,g[t.tone??`neutral`]),children:t.icon&&(0,h.jsx)(d,{...typeof t.icon==`string`?{name:t.icon}:{icon:t.icon},className:`h-3 w-3`})}),(0,h.jsxs)(`div`,{className:`min-w-0 flex-1 pt-px`,children:[(0,h.jsxs)(`div`,{className:`text-sm`,children:[t.actor&&(0,h.jsx)(`span`,{className:`font-semibold text-foreground`,children:t.actor}),t.action&&(0,h.jsxs)(`span`,{className:`text-muted-foreground`,children:[` `,t.action]}),t.timestamp&&(0,h.jsxs)(`span`,{className:`ml-1.5 text-xs text-muted-foreground`,children:[`· `,t.timestamp]})]}),t.body!=null&&(0,h.jsxs)(`div`,{className:`mt-1.5 overflow-hidden rounded-md border border-border bg-secondary`,children:[t.bodyHeader!=null&&(0,h.jsx)(`div`,{className:`border-b border-border px-density-3 py-1.5 text-xs`,children:t.bodyHeader}),(0,h.jsx)(`div`,{className:`px-density-3 py-density-2 text-sm leading-relaxed text-foreground`,children:t.body})]})]})]},t.id)})})}var h,g;function _(){return(_=e((()=>{c(),u(),h=t(),g={success:`bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300`,danger:`bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300`,warning:`bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300`,info:`bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300`,neutral:`bg-muted text-muted-foreground`};try{m.displayName=`Timeline`,m.__docgenInfo={description:"Vertical activity feed (the Gavel `TimelineCard`): each event has a\ntone-colored icon disc joined by a connector rail, an actor/action/time\nline, and an optional body bubble for threaded detail. Domain-agnostic —\ncallers compose `bodyHeader` (e.g. a file anchor + status `Badge`) and\n`body` themselves.",displayName:`Timeline`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/Timeline.tsx`,methods:[],props:{items:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/Timeline.tsx`,name:`TypeLiteral`}],description:`Events rendered top to bottom, connected by a rail.`,name:`items`,required:!0,tags:{},type:{name:`TimelineItem[]`}},className:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/Timeline.tsx`,name:`TypeLiteral`}],description:`Classes applied to the list.`,name:`className`,required:!1,tags:{},type:{name:`string`}}},tags:{}}}catch{}})))()}var v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{_(),f(),o(),v=t(),{expect:y,within:b}=__STORYBOOK_MODULE_TEST__,x={title:`Data/Timeline`,component:m,tags:[`autodocs`],parameters:{docs:{description:{component:"Vertical activity feed (the Gavel PR `TimelineCard`): tone-colored icon discs joined by a rail, an actor/action/time line, and an optional threaded body bubble."}}}},S=[{id:1,icon:r,tone:`neutral`,actor:`adityathebe`,action:`opened this pull request`,timestamp:`3d ago`},{id:2,icon:s,tone:`success`,actor:`moshloop`,action:`approved these changes`,timestamp:`1d ago`},{id:3,icon:n,tone:`info`,actor:`yashmehrotra`,action:`commented on internal/sse/reconnect.go:42`,timestamp:`1d ago`,bodyHeader:(0,v.jsxs)(`div`,{className:`flex items-center justify-between gap-2`,children:[(0,v.jsx)(`span`,{className:`font-mono text-primary`,children:`internal/sse/reconnect.go:42`}),(0,v.jsx)(p,{tone:`warning`,size:`xs`,children:`Unresolved`})]}),body:`Debounce the SSE reconnect — on flaky networks this hammers the controller.`},{id:4,icon:a,tone:`warning`,actor:`flankbot`,action:`detected merge conflicts with main`,timestamp:`5d ago`},{id:5,icon:i,tone:`danger`,actor:`flankbot`,action:`check "e2e" failed — reconnect timeout`,timestamp:`1d ago`}],C={args:{items:S},render:e=>(0,v.jsx)(`div`,{style:{maxWidth:560},children:(0,v.jsx)(m,{...e})})},w={args:{items:S},render:e=>(0,v.jsx)(`div`,{style:{maxWidth:560},children:(0,v.jsx)(m,{...e})}),play:async({canvasElement:e,step:t})=>{let n=b(e);await t(`every event row is rendered`,async()=>{let t=e.querySelectorAll(`li`);await y(t.length).toBe(S.length)}),await t(`threaded comment body is shown`,async()=>{await y(n.getByText(/Debounce the SSE reconnect/)).toBeInTheDocument()})}},T=[`Default`,`RendersAllEvents`],C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    items: ITEMS
  },
  render: args => <div style={{
    maxWidth: 560
  }}>
      <Timeline {...args} />
    </div>
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}}})))()}E();export{C as Default,w as RendersAllEvents,T as __namedExportsOrder,x as default};