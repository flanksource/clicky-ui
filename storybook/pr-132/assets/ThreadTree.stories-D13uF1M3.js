import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{r,t as i}from"./threads-ccOpv6A7.js";import{f as a,l as o,s}from"./LockOwnerButton-nFzWLTWM.js";import{n as c,t as l}from"./ThreadTree-BC7Cod8K.js";function u({initialSelected:e,initialStates:t,...n}){let[r,s]=(0,d.useState)(e),[c,u]=(0,d.useState)(``),[p,m]=(0,d.useState)(`cpu`),[h,g]=(0,d.useState)(()=>o(t));return(0,f.jsx)(`div`,{className:`h-[560px] w-[420px] border border-border`,children:(0,f.jsx)(l,{threads:i,selectedId:r,onSelect:s,query:c,onQueryChange:u,sort:p,onSortChange:m,states:h,onToggleState:e=>{let t=new Set(h);t.delete(e)||t.add(e),g(o(a(t)))},onClear:()=>{u(``),g(new Set)},...n})})}var d,f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{d=t(),r(),s(),c(),f=n(),{expect:p,userEvent:m,within:h}=__STORYBOOK_MODULE_TEST__,g={title:`JVM/ThreadTree`,component:u,args:{cpuTimeEnabled:!0,initialSelected:null,initialStates:``}},_={},v={args:{initialStates:`BLOCKED`,initialSelected:22},play:async({canvasElement:e})=>{let t=h(e);await p(t.getByRole(`button`,{name:/^BLOCKED/})).toHaveAttribute(`aria-pressed`,`true`),await p(t.queryByText(`main`)).toBeNull()}},y={args:{initialSelected:22},play:async({canvasElement:e})=>{let t=h(e),n=e.querySelector(`[data-thread-row="22"]`);if(!n)throw Error(`thread 22 row not rendered`);await m.click(h(n).getByRole(`button`,{name:`http-nio-8080-exec-3`})),await p(t.getByRole(`treeitem`,{selected:!0})).toHaveTextContent(`http-nio-8080-exec-3`)}},b={args:{rowExtra:e=>e.cpuPercent!==null&&e.cpuPercent>10?(0,f.jsxs)(`span`,{children:[`hot: `,e.cpuPercent,`% over the sample`]}):null}},x={args:{cpuTimeEnabled:!1}},S=[`Grouped`,`BlockedOnly`,`SelectingFollowsTheLockOwner`,`HostRowContent`,`CpuNotMeasured`],_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    initialStates: "BLOCKED",
    initialSelected: 22
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", {
      name: /^BLOCKED/
    })).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.queryByText("main")).toBeNull();
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    initialSelected: 22
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const waiter = canvasElement.querySelector<HTMLElement>('[data-thread-row="22"]');
    if (!waiter) throw new Error("thread 22 row not rendered");
    await userEvent.click(within(waiter).getByRole("button", {
      name: "http-nio-8080-exec-3"
    }));
    await expect(canvas.getByRole("treeitem", {
      selected: true
    })).toHaveTextContent("http-nio-8080-exec-3");
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    rowExtra: thread => thread.cpuPercent !== null && thread.cpuPercent > 10 ? <span>hot: {thread.cpuPercent}% over the sample</span> : null
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    cpuTimeEnabled: false
  }
}`,...x.parameters?.docs?.source}}}})))()}C();export{v as BlockedOnly,x as CpuNotMeasured,_ as Grouped,b as HostRowContent,y as SelectingFollowsTheLockOwner,S as __namedExportsOrder,g as default};