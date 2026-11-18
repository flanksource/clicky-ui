import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./jsx-runtime-DKU1u6-r.js";import{i as n,o as r,r as i,t as a}from"./threads-ccOpv6A7.js";import{n as o,t as s}from"./ThreadDetail-BjQjRqfU.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w;function T(){return(T=e((()=>{i(),o(),c=t(),{expect:l,fn:u,userEvent:d,within:f}=__STORYBOOK_MODULE_TEST__,p=e=>a.find(t=>t.id===e),m=p(22),h=p(21),g={title:`JVM/ThreadDetail`,component:s,decorators:[e=>(0,c.jsx)(`div`,{className:`w-[720px] border border-border`,children:(0,c.jsx)(e,{})})],args:{threadId:22,thread:m,inSnapshot:!0,cpuTimeEnabled:!0,stack:r(22),stackError:null,refreshing:!1,onRefresh:u(),onSelectThread:u(),onDownloadStack:u(),onDownloadDump:u()}},_={play:async({canvasElement:e,args:t})=>{await d.click(f(e).getByRole(`button`,{name:`http-nio-8080-exec-3`})),await l(t.onSelectThread).toHaveBeenCalledWith(23)}},v={args:{threadId:21,thread:h,stack:{thread:h,text:n(h,150),frames:[]}},play:async({canvasElement:e})=>{let t=f(e);await l(t.getByText(/block repeats 150× on this stack/)).toBeInTheDocument(),await d.click(t.getByRole(`button`,{name:/Show all 302 frames/})),await l(t.getByRole(`button`,{name:`Fold repeats`})).toBeInTheDocument()}},y={args:{inSnapshot:!1}},b={args:{stack:void 0}},x={args:{stack:void 0,stackError:Error(`java.lang.IllegalStateException: Thread 22 has ended`)}},S={args:{extra:(0,c.jsx)(`p`,{className:`rounded border border-border bg-muted/30 p-2`,children:`Host analysis: this thread waits on Inventory, held by exec-3.`}),renderStack:e=>(0,c.jsx)(`pre`,{className:`rounded border border-border p-2 font-mono text-[11px]`,children:e.text})}},C={render:({onDownloadStack:e,onDownloadDump:t,...n})=>(0,c.jsx)(s,{...n})},w=[`BlockedOnALock`,`DeepRecursionFolded`,`ThreadHasEnded`,`LoadingStack`,`StackFailed`,`HostStackAndAnalysis`,`NoDownloads`],_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    await userEvent.click(within(canvasElement).getByRole("button", {
      name: "http-nio-8080-exec-3"
    }));
    await expect(args.onSelectThread).toHaveBeenCalledWith(23);
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    threadId: 21,
    thread: worker,
    stack: {
      thread: worker,
      text: recursiveThreadText(worker, 150),
      frames: []
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/block repeats 150× on this stack/)).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", {
      name: /Show all 302 frames/
    }));
    await expect(canvas.getByRole("button", {
      name: "Fold repeats"
    })).toBeInTheDocument();
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    inSnapshot: false
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    stack: undefined
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    stack: undefined,
    stackError: new Error("java.lang.IllegalStateException: Thread 22 has ended")
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    extra: <p className="rounded border border-border bg-muted/30 p-2">Host analysis: this thread waits on Inventory, held by exec-3.</p>,
    renderStack: stack => <pre className="rounded border border-border p-2 font-mono text-[11px]">{stack.text}</pre>
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: ({
    onDownloadStack: _stack,
    onDownloadDump: _dump,
    ...args
  }) => <ThreadDetail {...args} />
}`,...C.parameters?.docs?.source}}}})))()}T();export{_ as BlockedOnALock,v as DeepRecursionFolded,S as HostStackAndAnalysis,b as LoadingStack,C as NoDownloads,x as StackFailed,y as ThreadHasEnded,w as __namedExportsOrder,g as default};