import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{n as r,r as i,s as a,t as o,u as s}from"./classes-BFK0cEJ7.js";import{n as c,t as l}from"./ClassBrowser-C8dxyCpg.js";function u({initialQuery:e,initialLoader:t,initialPlatform:n,initialSelected:r,...a}){let[o,s]=(0,d.useState)(e),[c,u]=(0,d.useState)(t),[p,m]=(0,d.useState)(n),[h,g]=(0,d.useState)(r);return(0,f.jsx)(`div`,{className:`flex h-[480px] w-80 flex-col border border-border p-2`,children:(0,f.jsx)(l,{className:`min-h-0 flex-1`,loaders:i,loader:c,onLoaderChange:u,query:o,onQueryChange:s,includePlatform:p,onIncludePlatformChange:m,selected:h,onSelectClass:g,...a})})}var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{d=t(),s(),c(),f=n(),{expect:p,fn:m,userEvent:h,within:g}=__STORYBOOK_MODULE_TEST__,_={title:`JVM/ClassBrowser`,component:u,args:{classes:r,total:r.length,initialQuery:``,initialLoader:``,initialPlatform:!1}},v={play:async({canvasElement:e})=>{let t=g(e);await p(t.getByRole(`treeitem`,{name:`com`})).toHaveAttribute(`aria-expanded`,`true`),await p(t.getByRole(`treeitem`,{name:`com.example`})).toHaveAttribute(`aria-expanded`,`false`)}},y={args:{initialQuery:`orders`,classes:r.filter(e=>e.name.includes(`orders`))}},b={args:{initialSelected:{name:`com.example.payments.PaymentClient$Retry`,loader:o}},play:async({canvasElement:e})=>{await p(g(e).getByRole(`treeitem`,{name:`com.example.payments.PaymentClient$Retry`})).toHaveAttribute(`aria-selected`,`true`)}},x={args:{initialPlatform:!0,classes:[...r,...a],total:r.length+a.length}},S={args:{total:2841,onLoadMore:m()},play:async({args:e,canvasElement:t})=>{await h.click(g(t).getByRole(`button`,{name:`Load more`})),await p(e.onLoadMore).toHaveBeenCalled()}},C={args:{initialQuery:`Order`,classes:r.slice(0,2),total:2,renderClassBadge:e=>(0,f.jsx)(`span`,{className:`rounded bg-amber-500/15 px-1 text-[10px] text-amber-700`,children:e.name.endsWith(`Service`)?`service`:`web`})}},w={args:{loading:!0,classes:[],total:0}},T={args:{initialQuery:`Nope`,classes:[],total:0}},E={args:{error:(0,f.jsx)(`p`,{role:`alert`,className:`p-2 text-xs text-destructive`,children:`Class listing failed: agent unreachable`}),classes:[],total:0}},D=[`All`,`Filtered`,`RevealsSelection`,`PlatformClasses`,`MoreAvailable`,`WithClassBadge`,`Loading`,`NoMatches`,`Failed`],v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("treeitem", {
      name: "com"
    })).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("treeitem", {
      name: "com.example"
    })).toHaveAttribute("aria-expanded", "false");
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    initialQuery: "orders",
    classes: CLASSES.filter(ref => ref.name.includes("orders"))
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    initialSelected: {
      name: "com.example.payments.PaymentClient$Retry",
      loader: APP_LOADER
    }
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByRole("treeitem", {
      name: "com.example.payments.PaymentClient$Retry"
    })).toHaveAttribute("aria-selected", "true");
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    initialPlatform: true,
    classes: [...CLASSES, ...PLATFORM_CLASSES],
    total: CLASSES.length + PLATFORM_CLASSES.length
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    total: 2841,
    onLoadMore: fn()
  },
  play: async ({
    args,
    canvasElement
  }) => {
    await userEvent.click(within(canvasElement).getByRole("button", {
      name: "Load more"
    }));
    await expect(args.onLoadMore).toHaveBeenCalled();
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    initialQuery: "Order",
    classes: CLASSES.slice(0, 2),
    total: 2,
    renderClassBadge: ref => <span className="rounded bg-amber-500/15 px-1 text-[10px] text-amber-700">{ref.name.endsWith("Service") ? "service" : "web"}</span>
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true,
    classes: [],
    total: 0
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    initialQuery: "Nope",
    classes: [],
    total: 0
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    error: <p role="alert" className="p-2 text-xs text-destructive">Class listing failed: agent unreachable</p>,
    classes: [],
    total: 0
  }
}`,...E.parameters?.docs?.source}}}})))()}O();export{v as All,E as Failed,y as Filtered,w as Loading,S as MoreAvailable,T as NoMatches,x as PlatformClasses,b as RevealsSelection,C as WithClassBadge,D as __namedExportsOrder,_ as default};