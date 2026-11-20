import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{n as r,xa as i}from"./icons-ClABX2sF.js";import{n as a,r as o}from"./router-4zl6M4X2.js";import{a as s,i as c,n as l,o as u,r as d,t as f}from"./RouterProvider-DLMVfXyP.js";function p({section:e,storageKey:t=h,collapsed:n=!1,className:r}){let i=c(t);return(0,m.jsx)(s,{sections:[e],collapsed:n,groupState:i,...r?{className:r}:{}})}var m,h;function g(){return(g=e((()=>{u(),d(),m=n(),h=`clicky-ui:navigation-tree:groups`;try{p.displayName=`NavigationTree`,p.__docgenInfo={description:``,displayName:`NavigationTree`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/layout/NavigationTree.tsx`,methods:[],props:{section:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/layout/NavigationTree.tsx`,name:`TypeLiteral`}],description:``,name:`section`,required:!0,tags:{},type:{name:`AppShellNavSection`}},storageKey:{defaultValue:{value:`clicky-ui:navigation-tree:groups`},declarations:[{fileName:`clicky-ui/packages/ui/src/layout/NavigationTree.tsx`,name:`TypeLiteral`}],description:`localStorage key persisting per-group collapsed state.`,name:`storageKey`,required:!1,tags:{},type:{name:`string`}},collapsed:{defaultValue:{value:`false`},declarations:[{fileName:`clicky-ui/packages/ui/src/layout/NavigationTree.tsx`,name:`TypeLiteral`}],description:`Icon-only rendering, as in a collapsed AppShell rail.`,name:`collapsed`,required:!1,tags:{},type:{name:`boolean`}},className:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/layout/NavigationTree.tsx`,name:`TypeLiteral`}],description:``,name:`className`,required:!1,tags:{},type:{name:`string`}}},tags:{}}}catch{}})))()}function _(e,t){return{key:e,label:e.split(`/`).at(-1)??e,to:`/${e}`,active:e===t}}function v(e,t,n,r={}){return{key:e,label:e.split(`/`).at(-1)??e,icon:i,defaultCollapsed:!0,items:t.includes(n)?t.map(e=>_(e,n)):[],loadChildren:()=>new Promise(e=>setTimeout(()=>e({items:t.map(e=>_(e,n))}),D)),...r}}function y(e){return{label:`Explorer`,variant:`tree`,reloadOnOpen:!1,groups:[{key:`guides`,label:`guides`,icon:i,defaultCollapsed:!0,items:[_(`guides/install`,e),_(`guides/theming`,e)]},v(`reference`,[`reference/api`,`reference/cli`],e),{key:`repo`,label:`repo`,icon:i,defaultCollapsed:!0,items:[],groups:[v(`repo/docs`,[`repo/docs/architecture`,`repo/docs/runbook`],e)]}],items:[_(`welcome`,e)]}}function b({activeSlug:e}){let t=o(`/${e}`),[n]=(0,x.useState)(()=>`story:navigation-tree:${crypto.randomUUID()}`);return(0,S.jsx)(`div`,{className:`h-[420px] w-72 overflow-y-auto bg-sidebar text-sidebar-foreground`,children:(0,S.jsx)(f,{adapter:t,children:(0,S.jsx)(p,{section:y(e),storageKey:n})})})}var x,S,C,w,T,E,D,O,k,A;function j(){return(j=e((()=>{x=t(),g(),l(),a(),r(),S=n(),{expect:C,userEvent:w,within:T}=__STORYBOOK_MODULE_TEST__,E={title:`Layout/NavigationTree`,component:p,parameters:{layout:`fullscreen`,docs:{description:{component:"The AppShell navigation tree without the shell. Groups with `loadChildren` fetch when first opened, `version` re-fetches a single open group, `reloadOnOpen: false` keeps loaded children across collapse, and the active item's ancestors are revealed without being saved into the user's collapse state."}}}},D=150,O={args:{section:y(`welcome`)},render:()=>(0,S.jsx)(b,{activeSlug:`welcome`}),play:async({canvasElement:e})=>{let t=T(e);C(t.queryByRole(`link`,{name:`api`})).toBeNull(),await w.click(T(t.getByRole(`treeitem`,{name:`reference`})).getByRole(`button`,{name:`Expand`})),C(await t.findByRole(`link`,{name:`api`})).toBeInTheDocument(),C(t.getByRole(`link`,{name:`cli`})).toBeInTheDocument()}},k={args:{section:y(`repo/docs/runbook`)},render:()=>(0,S.jsx)(b,{activeSlug:`repo/docs/runbook`}),play:async({canvasElement:e})=>{let t=await T(e).findByRole(`link`,{name:`runbook`});C(t.closest(`[role=treeitem]`)).toHaveAttribute(`aria-selected`,`true`)}},A=[`LazyNavigationTree`,`ActiveDeepItem`],O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    section: explorerSection("welcome")
  },
  render: () => <ExplorerBody activeSlug="welcome" />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByRole("link", {
      name: "api"
    })).toBeNull();
    await userEvent.click(within(canvas.getByRole("treeitem", {
      name: "reference"
    })).getByRole("button", {
      name: "Expand"
    }));
    expect(await canvas.findByRole("link", {
      name: "api"
    })).toBeInTheDocument();
    expect(canvas.getByRole("link", {
      name: "cli"
    })).toBeInTheDocument();
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    section: explorerSection("repo/docs/runbook")
  },
  render: () => <ExplorerBody activeSlug="repo/docs/runbook" />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const active = await canvas.findByRole("link", {
      name: "runbook"
    });
    expect(active.closest("[role=treeitem]")).toHaveAttribute("aria-selected", "true");
  }
}`,...k.parameters?.docs?.source}}}})))()}j();export{k as ActiveDeepItem,O as LazyNavigationTree,A as __namedExportsOrder,E as default};