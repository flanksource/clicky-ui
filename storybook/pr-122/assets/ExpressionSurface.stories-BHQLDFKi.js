import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{n as r,r as i}from"./QueryClientProvider-b6YDq6fV.js";import{n as a,t as o}from"./queryClient-lXfmqi15.js";import{n as s,t as c}from"./useMutation-BhSzItgK.js";import{n as ee,t as l}from"./useQuery-B6YeEONc.js";import{n as u,t as d}from"./utils-DLaO06-s.js";import{n as f,t as p}from"./InlineError-Dr8OBTL9.js";import{a as m,i as h,o as g,t as _}from"./expressions-DpToOQ_B.js";import{n as v,t as y}from"./EvaluationResult-BG-mNTzq.js";import{n as b,t as x}from"./ExpressionConsole-21qXq9Q2.js";import{a as S,i as te,n as C,o as w,r as T,s as E,t as D}from"./JvmProvider-DunqWtJP.js";import{i as O,n as k,r as A}from"./mutation-allowed-BK8QBYdq.js";function j(e,t){return`clicky-ui.jvm.expressions.${e}.${t}`}function M(e){try{let t=JSON.parse(localStorage.getItem(e)??`[]`);return Array.isArray(t)&&t.every(e=>typeof e==`string`)?t:[]}catch{return[]}}function N(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function P(e){let[t,n]=(0,F.useState)(()=>e?M(e):[]);return[t,(0,F.useCallback)(t=>{n(t),e&&N(e,t)},[e])]}var F;function I(){return(I=e((()=>{F=t()})))()}function L({state:e,onStateChange:t,canMutate:n=!0,requireConsent:r=!0,presets:i=[],historyKey:a,className:o}){let{client:c,keys:l}=te(),u=S(),[f,h]=(0,R.useState)(!1),[v,b]=(0,R.useState)(``),C=e.language??`ognl`,w=e.expression??``,[T,E]=P(a?j(a,`ognl`):void 0),[D,O]=P(a?j(a,`groovy`):void 0),[M,N]=C===`ognl`?[T,E]:[D,O],F=ee({queryKey:l.classLoaders,queryFn:({signal:e})=>c.classLoaders({signal:e}),staleTime:6e4}),I=s({mutationFn:({language:e,expression:t,loader:n})=>e===`ognl`?c.evaluateOgnl({expression:t,...n?{loader:n}:{}}):c.evaluateGroovy({source:t,...n?{loader:n}:{}}),onSuccess:(e,t)=>N(g(M,t.expression))}),L={runtime:u.data?.allowMutation,permitted:n,consent:f,requireConsent:r},B=e=>I.mutate(e),V=n=>{if(!n.path||I.variables?.language!==`ognl`)return;let r=m(I.variables.expression,n);t({...e,expression:r}),B({language:`ognl`,expression:r,loader:I.variables.loader})},H=(0,R.useMemo)(()=>[..._,...i],[i]);return(0,z.jsxs)(`div`,{className:d(`flex h-full min-h-0 flex-col overflow-hidden rounded border border-border`,o),children:[(0,z.jsx)(`section`,{"aria-label":`Console`,className:`shrink-0 border-b border-border p-3`,children:(0,z.jsx)(x,{language:C,onLanguageChange:e=>{I.reset(),t({language:e})},expression:w,onExpressionChange:n=>t({...e,expression:n}),presets:H,history:M,onHistoryChange:N,canRun:k(L),running:I.isPending,onRun:()=>B({language:C,expression:w,loader:v}),...F.data?{loaders:{options:F.data,value:v,onChange:b}}:{},toolbar:(0,z.jsxs)(`div`,{className:`flex flex-col gap-1`,children:[(0,z.jsx)(A,{...L,label:`Allow running code in this JVM`,onConsentChange:h}),F.error?(0,z.jsx)(p,{title:`Class loaders unavailable`,error:F.error}):null]})})}),(0,z.jsx)(`section`,{"aria-label":`Result`,className:`min-h-0 flex-1 overflow-auto p-3`,children:(0,z.jsx)(y,{pending:I.isPending,error:I.error,...I.data?{evaluation:I.data}:{},...I.variables?.language===`ognl`?{onSelectNode:V}:{}})})]})}var R,z;function B(){return(B=e((()=>{R=t(),c(),l(),u(),f(),h(),v(),b(),I(),O(),T(),z=n();try{L.displayName=`ExpressionSurface`,L.__docgenInfo={description:`Evaluate OGNL expressions and Groovy scripts in the JVM in scope, with presets, history, class loader choice and an object-graph result.`,displayName:`ExpressionSurface`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/jvm/surfaces/ExpressionSurface.tsx`,methods:[],props:{state:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/jvm/surfaces/ExpressionSurface.tsx`,name:`TypeLiteral`}],description:``,name:`state`,required:!0,tags:{},type:{name:`ExpressionSurfaceState`}},onStateChange:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/jvm/surfaces/ExpressionSurface.tsx`,name:`TypeLiteral`}],description:``,name:`onStateChange`,required:!0,tags:{},type:{name:`(next: ExpressionSurfaceState) => void`}},canMutate:{defaultValue:{value:`true`},declarations:[{fileName:`clicky-ui/packages/ui/src/jvm/surfaces/ExpressionSurface.tsx`,name:`TypeLiteral`}],description:`The host lets this operator run code in the JVM. Default true.`,name:`canMutate`,required:!1,tags:{},type:{name:`boolean`}},requireConsent:{defaultValue:{value:`true`},declarations:[{fileName:`clicky-ui/packages/ui/src/jvm/surfaces/ExpressionSurface.tsx`,name:`TypeLiteral`}],description:`Ask the operator to opt in before running code. Default true.`,name:`requireConsent`,required:!1,tags:{},type:{name:`boolean`}},presets:{defaultValue:{value:`[]`},declarations:[{fileName:`clicky-ui/packages/ui/src/jvm/surfaces/ExpressionSurface.tsx`,name:`TypeLiteral`}],description:`Host presets shown after the built-in generic ones.`,name:`presets`,required:!1,tags:{},type:{name:`ExpressionPreset[]`}},historyKey:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/jvm/surfaces/ExpressionSurface.tsx`,name:`TypeLiteral`}],description:`Keeps the expression history in localStorage under this key (e.g. the agent id). Omit to keep it in memory only.`,name:`historyKey`,required:!1,tags:{},type:{name:`string`}},className:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/jvm/surfaces/ExpressionSurface.tsx`,name:`TypeLiteral`}],description:``,name:`className`,required:!1,tags:{},type:{name:`string`}}},tags:{}}}catch{}})))()}function V({status:e,initial:t}){let[n]=(0,H.useState)(()=>w({status:e})),[i]=(0,H.useState)(()=>new o({defaultOptions:{queries:{retry:!1}}})),[a,s]=(0,H.useState)(t);return(0,U.jsx)(r,{client:i,children:(0,U.jsx)(D,{client:n,scope:`story`,children:(0,U.jsx)(`div`,{className:`h-[640px]`,children:(0,U.jsx)(L,{state:a,onStateChange:s,presets:[{label:`Order cache`,expression:`@com.example.orders.Inventory@cache().keySet()`,language:`ognl`}]})})})})}var H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{H=t(),a(),i(),E(),B(),C(),U=n(),{expect:W,userEvent:G,within:K}=__STORYBOOK_MODULE_TEST__,q={title:`JVM/ExpressionSurface`,component:V,parameters:{layout:`fullscreen`},args:{status:{allowMutation:!0},initial:{}}},J={play:async({canvasElement:e})=>{let t=K(e);await G.click(t.getByRole(`button`,{name:/^System properties/})),await G.click(await t.findByRole(`checkbox`,{name:`Allow running code in this JVM`})),await G.click(t.getByRole(`button`,{name:`Run`})),await W(await t.findByText(`java.version`)).toBeInTheDocument()}},Y={args:{initial:{language:`groovy`,expression:`println 'Inspecting order'
order.items.size()`}},play:async({canvasElement:e})=>{let t=K(e);await G.click(await t.findByRole(`checkbox`,{name:`Allow running code in this JVM`})),await G.click(t.getByRole(`button`,{name:`Run`})),await W(await t.findByRole(`region`,{name:`Standard output`})).toHaveTextContent(`Inspecting order ORD-1042`)}},X={args:{initial:{expression:`#root.throw`}},play:async({canvasElement:e})=>{let t=K(e);await G.click(await t.findByRole(`checkbox`,{name:`Allow running code in this JVM`})),await G.click(t.getByRole(`button`,{name:`Run`})),await W(await t.findByText(`Evaluation failed`)).toBeInTheDocument()}},Z={args:{status:{allowMutation:!1},initial:{expression:`@java.lang.System@getProperties()`}},play:async({canvasElement:e})=>{let t=K(e);await W(await t.findByText(/Runtime changes are disabled/)).toBeInTheDocument(),await W(t.getByRole(`button`,{name:`Run`})).toBeDisabled()}},Q=[`OgnlPreset`,`GroovyScript`,`EvaluationError`,`MutationsDisabled`],J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: /^System properties/
    }));
    await userEvent.click(await canvas.findByRole("checkbox", {
      name: "Allow running code in this JVM"
    }));
    await userEvent.click(canvas.getByRole("button", {
      name: "Run"
    }));
    await expect(await canvas.findByText("java.version")).toBeInTheDocument();
  }
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    initial: {
      language: "groovy",
      expression: "println 'Inspecting order'\\norder.items.size()"
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("checkbox", {
      name: "Allow running code in this JVM"
    }));
    await userEvent.click(canvas.getByRole("button", {
      name: "Run"
    }));
    await expect(await canvas.findByRole("region", {
      name: "Standard output"
    })).toHaveTextContent("Inspecting order ORD-1042");
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  args: {
    initial: {
      expression: "#root.throw"
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("checkbox", {
      name: "Allow running code in this JVM"
    }));
    await userEvent.click(canvas.getByRole("button", {
      name: "Run"
    }));
    await expect(await canvas.findByText("Evaluation failed")).toBeInTheDocument();
  }
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  args: {
    status: {
      allowMutation: false
    },
    initial: {
      expression: "@java.lang.System@getProperties()"
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(/Runtime changes are disabled/)).toBeInTheDocument();
    await expect(canvas.getByRole("button", {
      name: "Run"
    })).toBeDisabled();
  }
}`,...Z.parameters?.docs?.source}}}})))()}$();export{X as EvaluationError,Y as GroovyScript,Z as MutationsDisabled,J as OgnlPreset,Q as __namedExportsOrder,q as default};