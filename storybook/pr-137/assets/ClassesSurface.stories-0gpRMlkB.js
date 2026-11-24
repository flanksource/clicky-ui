import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{Ca as r,n as i,xa as a}from"./icons-ClABX2sF.js";import{n as o,t as s}from"./button-CyHks9uL.js";import{i as c,t as l}from"./loading-DGvF0cjn.js";import{n as u,t as ee}from"./Workspace-4TL4QzST.js";import{i as d,n as f,r as p}from"./QueryClientProvider-b6YDq6fV.js";import{n as m,t as h}from"./queryClient-lXfmqi15.js";import{n as g,t as _}from"./useInfiniteQuery-B3rQOAr_.js";import{n as te,t as v}from"./useMutation-BhSzItgK.js";import{n as y,t as b}from"./useQuery-B6YeEONc.js";import{n as ne,t as x}from"./MonacoProvider-CuasA_DE.js";import{t as S,u as C}from"./classes-BFK0cEJ7.js";import{n as re,t as ie}from"./ClassBrowser-BuiU30-l.js";import{n as ae,t as w}from"./InlineError-DzSwN3xx.js";import{n as T,t as oe}from"./ClassDownloads-6zAsJUV7.js";import{n as E,t as se}from"./CompileDiagnosticsList-v74JW0hj.js";import{i as ce}from"./source-lines-QR9I9I97.js";import{n as le,t as ue}from"./DecompiledSourceView-kHZUi6KC.js";import{a as de,i as fe,n as D,o as pe,r as me,t as he}from"./MethodPicker-C8eKkDcc.js";import{i as ge,n as O,r as k,t as _e}from"./PatchActions-DRncC8sg.js";import{n as A,t as ve}from"./PatchedClassList-D7FQ8-Xm.js";import{a as ye,i as be,n as xe,o as Se,r as Ce,s as we,t as Te}from"./JvmProvider-B9l2LAnu.js";import{i as Ee,n as De,r as Oe}from"./mutation-allowed-BK8QBYdq.js";function j(e,t){let n={};for(let[r,i]of Object.entries({...e,...t}))i&&(n[r]=i);return n}function ke(e){return e.platform===`true`}function Ae(e){return e.filter(e=>e.line>0).map(e=>({line:e.line,column:e.column,message:e.message,severity:e.kind===`ERROR`?`error`:`warning`}))}function je(e){let t=Number(e);return Number.isInteger(t)&&t>0?t:0}function M({qualifiedName:e,state:t,onStateChange:n,canMutate:r,requireConsent:i,onTraceMethod:a,sourceActions:o}){let{client:c,keys:u}=be(),ee=d(),f=ye(),p=y({queryKey:u.classLoaders,queryFn:({signal:e})=>c.classLoaders({signal:e}),staleTime:6e4}),m=y({queryKey:u.patches,queryFn:({signal:e})=>c.patches({signal:e})}),h=t.loader??``,g=y({queryKey:u.classSource(e,h||void 0),queryFn:({signal:t})=>c.classSource({class:e,...h?{loader:h}:{}},{signal:t})}),[_,v]=(0,P.useState)(!1),[b,ne]=(0,P.useState)(``),[x,S]=(0,P.useState)(null),[C,re]=(0,P.useState)(900),[ie,ae]=(0,P.useState)(!1),[T,E]=(0,P.useState)(null),[le,fe]=(0,P.useState)(void 0),D=g.data,O=D?.loader??h,k={class:e,...O?{loader:O}:{}},A=(m.data??[]).some(t=>t.class===e&&t.loader===O&&t.patched),ve={runtime:f.data?.allowMutation,permitted:r??!0,consent:ie,requireConsent:i??!0},xe=De(ve),Se=()=>{v(!1),S(null),E(null)},Ce=()=>Promise.all([ee.invalidateQueries({queryKey:u.classSources}),ee.invalidateQueries({queryKey:u.patches})]),we=te({mutationFn:e=>c.compileClass({...k,source:e}),onMutate:()=>E(null),onSuccess:(e,t)=>S({source:t,result:e}),onError:e=>E({title:`Compile failed`,error:e})}),Te=te({mutationFn:async e=>{let t=await c.patchClass({...k,source:e,leaseSeconds:C});if(t.success&&t.applied===!1)throw Error(`The agent compiled the class but did not apply it.`);return t},onMutate:()=>E(null),onSuccess:async(e,t)=>{e.success?(S({source:t,result:{...e,applied:!0}}),v(!1),await Ce()):S({source:t,result:e})},onError:e=>E({title:`Patch failed`,error:e})}),Ee=te({mutationFn:()=>c.restoreClass(k),onMutate:()=>E(null),onSuccess:async()=>{Se(),await Ce()},onError:e=>E({title:`Restore failed`,error:e})}),ke=we.isPending?`compile`:Te.isPending?`patch`:Ee.isPending?`restore`:null,M=D?.source??``,N=(0,P.useMemo)(()=>M.split(`
`).length,[M]),I=(0,P.useMemo)(()=>me({className:e,method:t.method??``,line:je(t.line),methods:D?.methods??[],sourceLineCount:N,sourceLineNumbers:D?.sourceLineNumbers??[]}),[e,t.method,t.line,D,N]),L=pe(D?.methods??[],t.method??``),R=x&&x.source===b?x.result:null,Me=R?.success===!0,z=(0,P.useMemo)(()=>Ae(R?.diagnostics??[]),[R]),B=(p.data??[]).some(e=>e.virtual&&(e.hash===h||e.hash===D?.loader))?`This is a group of loaders; pick the loader that defines the class.`:f.data?.instrumentation===!1?`This JVM has no instrumentation attached, so classes cannot be replaced.`:void 0,V;return g.isPending?V=(0,F.jsx)(l,{}):g.error?V=(0,F.jsx)(w,{title:`Decompiling failed`,error:g.error}):D&&(V=(0,F.jsx)(ue,{qualifiedName:e,source:D.source,sourceLineNumbers:D.sourceLineNumbers,mode:_?`edit`:`read`,draft:b,onDraftChange:ne,focusRange:I.range,highlightRow:I.highlightRow,markers:z,reveal:le,onSelectRow:e=>{let r=ce(D.sourceLineNumbers,e);n(j(t,{line:r>0?String(r):``}),{replace:!0})}})),(0,F.jsxs)(`div`,{className:`flex h-full min-w-0 flex-col gap-2 p-3`,children:[(0,F.jsxs)(`div`,{className:`flex flex-wrap items-end gap-2`,children:[(0,F.jsxs)(`label`,{className:`flex min-w-[12rem] max-w-xs flex-1 flex-col gap-1 text-xs`,children:[`Jump to method`,(0,F.jsx)(he,{forClass:e,methods:D?.methods??[],value:t.method??``,disabled:_,onChange:e=>n(j(t,{method:e,line:``}),{replace:!0})})]}),a?(0,F.jsx)(s,{size:`sm`,variant:`outline`,disabled:!L,title:L?void 0:`Pick a method first.`,onClick:()=>D&&L&&a({class:e,loader:D.loader,method:de(L)}),children:`Trace method`}):null,(0,F.jsxs)(`span`,{className:`min-w-0 flex-1 truncate pb-1 text-right font-mono text-xs text-muted-foreground`,title:e,children:[e,A?` · patched`:``,D?` · ${D.decompiler}`:``]}),(0,F.jsx)(oe,{qualifiedName:e,source:_?b:D?.source,loadBytecode:()=>c.classBytecode(k)}),D?o?.(D):null,(0,F.jsx)(_e,{editing:_,dirty:_&&b!==M,compiledCurrent:Me,patched:A,busy:ke,leaseSeconds:C,onLeaseSecondsChange:re,canEdit:D!==void 0&&B===void 0,editDisabledReason:B,mutationAllowed:xe,onEdit:()=>{ne(M),S(null),E(null),v(!0)},onCancel:Se,onCompile:()=>we.mutate(b),onApply:()=>Te.mutate(b),onRestore:()=>Ee.mutate()})]}),_||A?(0,F.jsx)(Oe,{...ve,label:`Allow replacing class bytecode`,onConsentChange:ae}):null,I.note&&!_?(0,F.jsx)(`p`,{className:`text-xs text-muted-foreground`,children:I.note}):null,(0,F.jsxs)(`div`,{className:`flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border bg-muted/10`,children:[(0,F.jsx)(`div`,{className:`min-h-0 flex-1`,children:V}),(0,F.jsx)(se,{compilation:R,appliedMessage:`Patch applied. The original bytecode is restored in ${ge(C)}.`,onSelectDiagnostic:e=>fe({row:e.line-1})}),T?(0,F.jsx)(w,{title:T.title,error:T.error}):null]})]})}function N({extraPanes:e=[],storageKey:t,className:n,renderClassBadge:i,...o}){let{client:s,keys:c}=be(),{state:l,onStateChange:u}=o,d=y({queryKey:c.classLoaders,queryFn:({signal:e})=>s.classLoaders({signal:e}),staleTime:6e4}),f=y({queryKey:c.patches,queryFn:({signal:e})=>s.patches({signal:e})}),p=l.loader??``,m={query:l.q??``,...p?{loader:p}:{},includePlatform:ke(l),limit:I},h=g({queryKey:[...c.classes(m),`pages`],initialPageParam:0,queryFn:({pageParam:e,signal:t})=>s.classes({...m,offset:e},{signal:t}),getNextPageParam:e=>{let t=e.offset+e.classes.length;return e.classes.length>0&&t<e.total?t:void 0}}),_=(0,P.useMemo)(()=>h.data?.pages.flatMap(e=>e.classes)??[],[h.data]),te=h.data?.pages[h.data.pages.length-1]?.total??0,v=l.class?{name:l.class,loader:l.loader??_.find(e=>e.name===l.class)?.loader??``}:void 0,b=[{id:`classes`,label:`Classes`,icon:(0,F.jsx)(a,{className:`size-4`}),location:`left`,width:340,minWidth:260,maxWidth:640,contentClassName:`overflow-hidden`,content:(0,F.jsxs)(`div`,{className:`flex h-full min-h-0 flex-col gap-2 p-3`,children:[(0,F.jsx)(ie,{className:`min-h-0 flex-1`,loaders:d.data??[],loader:p,onLoaderChange:e=>u(j(l,{loader:e})),query:l.q??``,onQueryChange:e=>u(j(l,{q:e}),{replace:!0}),includePlatform:m.includePlatform??!1,onIncludePlatformChange:e=>u(j(l,{platform:e?`true`:``}),{replace:!0}),classes:_,total:te,loading:h.isPending||d.isPending,error:h.error?(0,F.jsx)(w,{title:`Class listing failed`,error:h.error}):d.error?(0,F.jsx)(w,{title:`Class loaders unavailable`,error:d.error}):void 0,onLoadMore:h.hasNextPage?()=>void h.fetchNextPage():void 0,loadingMore:h.isFetchingNextPage,selected:v,onSelectClass:e=>u(j(l,{class:e.name,loader:e.loader,method:``,line:``})),renderClassBadge:i}),(0,F.jsx)(ve,{patches:f.data??[],selected:v,onSelect:e=>u(j(l,{class:e.name,loader:e.loader,method:``,line:``}))})]})},{id:`source`,label:l.class||`Source`,icon:(0,F.jsx)(r,{className:`size-4`}),location:`center`,collapsible:!1,contentClassName:`overflow-hidden`,content:l.class?(0,F.jsx)(M,{qualifiedName:l.class,...o},`${l.class}:${p}`):(0,F.jsx)(`p`,{className:`p-3 text-sm text-muted-foreground`,children:`Browse or filter the tree and pick a class to read its decompiled source, then edit and patch it.`})},...e];return(0,F.jsx)(ee,{panes:b,...t?{storageKey:t}:{},className:n??`h-full rounded border border-border`})}var P,F,I;function L(){return(L=e((()=>{P=t(),_(),v(),b(),p(),o(),c(),u(),ae(),i(),re(),T(),E(),le(),D(),O(),A(),k(),fe(),Ee(),Ce(),F=n(),I=200;try{N.displayName=`ClassesSurface`,N.__docgenInfo={description:`Browse the loaded classes of the JVM in scope, read a class decompiled, and
(when allowed) edit it, compile a preview, replace it under a restore lease
and restore it. Replacing bytecode goes through the mutation gate.`,displayName:`ClassesSurface`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/jvm/surfaces/ClassesSurface.tsx`,methods:[],props:{state:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/jvm/surfaces/ClassesSurface.tsx`,name:`TypeLiteral`}],description:``,name:`state`,required:!0,tags:{},type:{name:`ClassesSurfaceState`}},onStateChange:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/jvm/surfaces/ClassesSurface.tsx`,name:`TypeLiteral`}],description:"`replace` marks a refinement of the same view (a filter, a method, a clicked line) rather than a navigation.",name:`onStateChange`,required:!0,tags:{},type:{name:`(next: ClassesSurfaceState, options?: { replace: boolean; } | undefined) => void`}},canMutate:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/jvm/surfaces/ClassesSurface.tsx`,name:`TypeLiteral`}],description:`The host lets this operator replace class bytecode. Default true.`,name:`canMutate`,required:!1,tags:{},type:{name:`boolean`}},requireConsent:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/jvm/surfaces/ClassesSurface.tsx`,name:`TypeLiteral`}],description:`Ask the operator to opt in before replacing or restoring bytecode. Default true.`,name:`requireConsent`,required:!1,tags:{},type:{name:`boolean`}},renderClassBadge:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/jvm/surfaces/ClassesSurface.tsx`,name:`TypeLiteral`}],description:`Host decoration after a class's name in the tree, e.g. a "generated" badge.`,name:`renderClassBadge`,required:!1,tags:{},type:{name:`(ref: JvmClassRef) => ReactNode`}},onTraceMethod:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/jvm/surfaces/ClassesSurface.tsx`,name:`TypeLiteral`}],description:`Adds a "Trace method" action; receives the class, its loader and the picked method's name and descriptor.`,name:`onTraceMethod`,required:!1,tags:{},type:{name:`(target: Required<JvmClassTarget>) => void`}},sourceActions:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/jvm/surfaces/ClassesSurface.tsx`,name:`TypeLiteral`}],description:`Host actions in the source toolbar, e.g. links to related views.`,name:`sourceActions`,required:!1,tags:{},type:{name:`(source: JvmClassSource) => ReactNode`}},extraPanes:{defaultValue:{value:`[]`},declarations:[{fileName:`clicky-ui/packages/ui/src/jvm/surfaces/ClassesSurface.tsx`,name:`TypeLiteral`}],description:`Host panes added beside the browser and the source.`,name:`extraPanes`,required:!1,tags:{},type:{name:`WorkspacePaneSpec[]`}},storageKey:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/jvm/surfaces/ClassesSurface.tsx`,name:`TypeLiteral`}],description:``,name:`storageKey`,required:!1,tags:{},type:{name:`string`}},className:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/jvm/surfaces/ClassesSurface.tsx`,name:`TypeLiteral`}],description:``,name:`className`,required:!1,tags:{},type:{name:`string`}}},tags:{}}}catch{}try{ClassesSurfaceState.displayName=`ClassesSurfaceState`,ClassesSurfaceState.__docgenInfo={description:`URL-shaped selection the host persists (search params, router state, …).`,displayName:`ClassesSurfaceState`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/jvm/surfaces/ClassesSurface.tsx`,methods:[],props:{},tags:{}}}catch{}})))()}function R(){return new Worker(new URL(`/clicky-ui/storybook/pr-137/assets/editor.worker-BlfIGhym.js`,``+import.meta.url),{type:`module`})}function Me({status:e,initial:t,patched:n,...r}){let[i]=(0,z.useState)(()=>Se({status:e,patched:n})),[a]=(0,z.useState)(()=>new h({defaultOptions:{queries:{retry:!1}}})),[o,s]=(0,z.useState)(t);return(0,B.jsx)(f,{client:a,children:(0,B.jsx)(Te,{client:i,scope:`story`,children:(0,B.jsx)(x,{getWorker:R,children:(0,B.jsx)(`div`,{className:`h-[680px]`,children:(0,B.jsx)(N,{state:o,onStateChange:s,...r})})})})})}var z,B,V,Ne,H,U,W,G,Pe,K,q,J,Y,X,Z,Q,$,Fe;function Ie(){return(Ie=e((()=>{z=t(),m(),p(),ne(),C(),we(),L(),xe(),B=n(),{expect:V,fn:Ne,userEvent:H,waitFor:U,within:W}=__STORYBOOK_MODULE_TEST__,G=`com.example.orders.OrderService`,Pe={title:`JVM/ClassesSurface`,component:Me,parameters:{layout:`fullscreen`},args:{status:{allowMutation:!0},initial:{},patched:!0}},K={args:{initial:{q:`OrderService`}},play:async({canvasElement:e})=>{let t=W(e);await H.click(W(await t.findByRole(`treeitem`,{name:G})).getByText(`OrderService`)),await V(await t.findByText(/CFR 0\.152/)).toBeInTheDocument()}},q={args:{initial:{class:G,loader:S,method:`checkout(Ljava/lang/String;)D`}},play:async({canvasElement:e})=>{await V(await W(e).findByRole(`button`,{name:`Show 13 hidden lines above`})).toBeInTheDocument()}},J={args:{initial:{class:G,loader:S,line:`19`}},play:async({canvasElement:e})=>{await W(e).findByText(/CFR 0\.152/),await V(e.querySelector(`[data-row="16"]`)).toHaveAttribute(`data-highlighted`,`true`)}},Y={args:{initial:{class:G,loader:S,method:`checkout(Ljava/lang/String;)D`},onTraceMethod:Ne(),renderClassBadge:e=>(0,B.jsx)(`span`,{className:`rounded bg-sky-500/15 px-1 text-[10px] text-sky-700`,children:e.loader.slice(0,4)})},play:async({args:e,canvasElement:t})=>{let n=await W(t).findByRole(`button`,{name:`Trace method`});await U(()=>V(n).toBeEnabled()),await H.click(n),await V(e.onTraceMethod).toHaveBeenCalledWith({class:G,loader:S,method:`checkout(Ljava/lang/String;)D`})}},X={args:{initial:{class:G,loader:S}},play:async({canvasElement:e})=>{let t=W(e),n=await t.findByRole(`button`,{name:`Restore original`});await V(n).toBeDisabled(),await H.click(await t.findByRole(`checkbox`,{name:`Allow replacing class bytecode`})),await H.click(n),await U(()=>V(t.queryByRole(`button`,{name:`Restore original`})).toBeNull())}},Z={args:{status:{allowMutation:!1},initial:{class:G,loader:S}},play:async({canvasElement:e})=>{await V(await W(e).findByText(/Runtime changes are disabled/)).toBeInTheDocument()}},Q={args:{initial:{class:`com.example.Missing`,loader:S}},play:async({canvasElement:e})=>{await V(await W(e).findByText(`Decompiling failed`)).toBeInTheDocument()}},$={tags:[`browser`],args:{initial:{class:G,loader:S},patched:!1},play:async({canvasElement:e})=>{let t=W(e),n=await t.findByRole(`button`,{name:`Edit`});await U(()=>V(n).toBeEnabled()),await H.click(n),await U(()=>{if(!e.querySelector(`.view-lines`))throw Error(`the editor has not rendered its lines yet`);let t=e.querySelector(`textarea.inputarea`);if(!t)throw Error(`the editor has no input area`);t.focus(),V(document.activeElement).toBe(t)},{timeout:1e4}),await H.keyboard(`// patched{Enter}`);let r=t.getByRole(`button`,{name:`Compile preview`});await U(()=>V(r).toBeEnabled()),await H.click(r),await V(await t.findByText(/Compiles with 1 warning|Compiles cleanly/)).toBeInTheDocument(),await H.click(await t.findByRole(`checkbox`,{name:`Allow replacing class bytecode`})),await H.click(t.getByRole(`button`,{name:`Apply patch`})),await V(await t.findByText(/Patch applied/)).toBeInTheDocument()}},Fe=[`Browsing`,`FoldedToMethod`,`DeepLinkedLine`,`WithHostSlots`,`RestoringAPatch`,`MutationsDisabled`,`ClassNotLoaded`,`EditCompileAndApply`],K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    initial: {
      q: "OrderService"
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(within(await canvas.findByRole("treeitem", {
      name: CLASS
    })).getByText("OrderService"));
    await expect(await canvas.findByText(/CFR 0\\.152/)).toBeInTheDocument();
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    initial: {
      class: CLASS,
      loader: APP_LOADER,
      method: "checkout(Ljava/lang/String;)D"
    }
  },
  play: async ({
    canvasElement
  }) => {
    await expect(await within(canvasElement).findByRole("button", {
      name: "Show 13 hidden lines above"
    })).toBeInTheDocument();
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    initial: {
      class: CLASS,
      loader: APP_LOADER,
      line: "19"
    }
  },
  play: async ({
    canvasElement
  }) => {
    await within(canvasElement).findByText(/CFR 0\\.152/);
    await expect(canvasElement.querySelector('[data-row="16"]')).toHaveAttribute("data-highlighted", "true");
  }
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    initial: {
      class: CLASS,
      loader: APP_LOADER,
      method: "checkout(Ljava/lang/String;)D"
    },
    onTraceMethod: fn(),
    renderClassBadge: ref => <span className="rounded bg-sky-500/15 px-1 text-[10px] text-sky-700">{ref.loader.slice(0, 4)}</span>
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const trace = await within(canvasElement).findByRole("button", {
      name: "Trace method"
    });
    await waitFor(() => expect(trace).toBeEnabled());
    await userEvent.click(trace);
    await expect(args.onTraceMethod).toHaveBeenCalledWith({
      class: CLASS,
      loader: APP_LOADER,
      method: "checkout(Ljava/lang/String;)D"
    });
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  args: {
    initial: {
      class: CLASS,
      loader: APP_LOADER
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const restore = await canvas.findByRole("button", {
      name: "Restore original"
    });
    await expect(restore).toBeDisabled();
    await userEvent.click(await canvas.findByRole("checkbox", {
      name: "Allow replacing class bytecode"
    }));
    await userEvent.click(restore);
    await waitFor(() => expect(canvas.queryByRole("button", {
      name: "Restore original"
    })).toBeNull());
  }
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  args: {
    status: {
      allowMutation: false
    },
    initial: {
      class: CLASS,
      loader: APP_LOADER
    }
  },
  play: async ({
    canvasElement
  }) => {
    await expect(await within(canvasElement).findByText(/Runtime changes are disabled/)).toBeInTheDocument();
  }
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  args: {
    initial: {
      class: "com.example.Missing",
      loader: APP_LOADER
    }
  },
  play: async ({
    canvasElement
  }) => {
    await expect(await within(canvasElement).findByText("Decompiling failed")).toBeInTheDocument();
  }
}`,...Q.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  tags: ["browser"],
  args: {
    initial: {
      class: CLASS,
      loader: APP_LOADER
    },
    patched: false
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const edit = await canvas.findByRole("button", {
      name: "Edit"
    });
    await waitFor(() => expect(edit).toBeEnabled());
    await userEvent.click(edit);
    // Focus the editor's input only once its lines have rendered: a textarea that appears earlier belongs to an editor still mounting, and the typing is lost.
    await waitFor(() => {
      if (!canvasElement.querySelector(".view-lines")) throw new Error("the editor has not rendered its lines yet");
      const input = canvasElement.querySelector<HTMLTextAreaElement>("textarea.inputarea");
      if (!input) throw new Error("the editor has no input area");
      input.focus();
      expect(document.activeElement).toBe(input);
    }, {
      timeout: 10_000
    });
    await userEvent.keyboard("// patched{Enter}");
    // Compile stays disabled until the draft differs from the decompiled source.
    const compile = canvas.getByRole("button", {
      name: "Compile preview"
    });
    await waitFor(() => expect(compile).toBeEnabled());
    await userEvent.click(compile);
    await expect(await canvas.findByText(/Compiles with 1 warning|Compiles cleanly/)).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole("checkbox", {
      name: "Allow replacing class bytecode"
    }));
    await userEvent.click(canvas.getByRole("button", {
      name: "Apply patch"
    }));
    await expect(await canvas.findByText(/Patch applied/)).toBeInTheDocument();
  }
}`,...$.parameters?.docs?.source}}}})))()}Ie();export{K as Browsing,Q as ClassNotLoaded,J as DeepLinkedLine,$ as EditCompileAndApply,q as FoldedToMethod,Z as MutationsDisabled,X as RestoringAPatch,Y as WithHostSlots,Fe as __namedExportsOrder,Pe as default};