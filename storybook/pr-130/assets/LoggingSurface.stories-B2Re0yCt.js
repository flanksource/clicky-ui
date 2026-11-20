import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{ii as r,n as i}from"./icons-ClABX2sF.js";import{i as a,n as o,r as s}from"./QueryClientProvider-b6YDq6fV.js";import{n as c,t as l}from"./queryClient-lXfmqi15.js";import{n as u,t as d}from"./useQuery-B6YeEONc.js";import{n as f,t as p}from"./button-CG7WJ0tv.js";import{i as m,t as h}from"./loading-DGvF0cjn.js";import{n as g,t as _}from"./InlineError-BH19KBvj.js";import{n as v,t as y}from"./LoggerLevelDialog-BQL8Ceag.js";import{n as b,t as x}from"./LoggersTable-DM0QYACi.js";import{a as S,i as C,n as w,o as T,r as E,s as D,t as O}from"./JvmProvider-B9l2LAnu.js";import{i as k,n as A,r as j}from"./mutation-allowed-BK8QBYdq.js";function M({state:e,onStateChange:t,canMutate:n=!0,requireConsent:i=!0,className:o}){let{client:s,keys:c}=C(),l=a(),d=S(),[f,m]=(0,N.useState)(!1),[g,v]=(0,N.useState)(),b=u({queryKey:c.loggers,queryFn:({signal:e})=>s.loggers({signal:e}),staleTime:15e3});if(b.isPending)return(0,P.jsx)(h,{});if(b.error)return(0,P.jsx)(_,{title:`Logger inventory unavailable`,error:b.error});let w={runtime:d.data?.allowMutation,permitted:n,consent:f,requireConsent:i};return(0,P.jsxs)(`div`,{className:o??`flex h-full min-h-0 flex-col gap-3 p-3`,children:[(0,P.jsxs)(`div`,{className:`flex flex-wrap items-center gap-3`,children:[(0,P.jsx)(`p`,{className:`text-xs text-muted-foreground`,children:`java.util.logging loggers. Choose (inherit) to use the parent's level.`}),(0,P.jsxs)(`div`,{className:`ml-auto flex items-center gap-2`,children:[(0,P.jsx)(j,{...w,label:`Allow logger changes`,onConsentChange:m}),(0,P.jsxs)(p,{size:`sm`,variant:`outline`,loading:b.isFetching,onClick:()=>void b.refetch(),children:[(0,P.jsx)(r,{}),` Refresh`]})]})]}),(0,P.jsx)(x,{loggers:b.data,filter:e.q??``,onFilterChange:n=>t({...e,q:n}),onEdit:v,canEdit:A(w)}),g?(0,P.jsx)(y,{logger:g,onClose:()=>v(void 0),onSave:async e=>{await s.setLoggerLevel({name:g.name,level:e}),await Promise.all([l.invalidateQueries({queryKey:c.loggers}),l.invalidateQueries({queryKey:c.mbean(`java.util.logging:type=Logging`)})])}},g.name):null]})}var N,P;function F(){return(F=e((()=>{N=t(),d(),s(),f(),m(),i(),g(),v(),b(),k(),E(),P=n();try{M.displayName=`LoggingSurface`,M.__docgenInfo={description:`java.util.logging loggers of the JVM in scope: filter them and change a logger's level.`,displayName:`LoggingSurface`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/jvm/surfaces/LoggingSurface.tsx`,methods:[],props:{state:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/jvm/surfaces/LoggingSurface.tsx`,name:`TypeLiteral`}],description:``,name:`state`,required:!0,tags:{},type:{name:`LoggingSurfaceState`}},onStateChange:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/jvm/surfaces/LoggingSurface.tsx`,name:`TypeLiteral`}],description:``,name:`onStateChange`,required:!0,tags:{},type:{name:`(next: LoggingSurfaceState) => void`}},canMutate:{defaultValue:{value:`true`},declarations:[{fileName:`clicky-ui/packages/ui/src/jvm/surfaces/LoggingSurface.tsx`,name:`TypeLiteral`}],description:`The host lets this operator change the JVM. Default true.`,name:`canMutate`,required:!1,tags:{},type:{name:`boolean`}},requireConsent:{defaultValue:{value:`true`},declarations:[{fileName:`clicky-ui/packages/ui/src/jvm/surfaces/LoggingSurface.tsx`,name:`TypeLiteral`}],description:`Ask the operator to opt in before writes. Default true.`,name:`requireConsent`,required:!1,tags:{},type:{name:`boolean`}},className:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/jvm/surfaces/LoggingSurface.tsx`,name:`TypeLiteral`}],description:``,name:`className`,required:!1,tags:{},type:{name:`string`}}},tags:{}}}catch{}})))()}function I({status:e,initial:t}){let[n]=(0,L.useState)(()=>T({status:e})),[r]=(0,L.useState)(()=>new l({defaultOptions:{queries:{retry:!1}}})),[i,a]=(0,L.useState)(t);return(0,R.jsx)(o,{client:r,children:(0,R.jsx)(O,{client:n,scope:`story`,children:(0,R.jsx)(`div`,{className:`h-[520px]`,children:(0,R.jsx)(M,{state:i,onStateChange:a})})})})}var L,R,z,B,V,H,U,W,G,K,q;function J(){return(J=e((()=>{L=t(),c(),s(),D(),w(),F(),R=n(),{expect:z,userEvent:B,within:V}=__STORYBOOK_MODULE_TEST__,H={title:`JVM/LoggingSurface`,component:I,parameters:{layout:`fullscreen`},args:{status:{allowMutation:!0},initial:{}}},U={play:async({canvasElement:e})=>{await z(await V(e).findByText(`com.example.orders.OrderService`)).toBeInTheDocument()}},W={play:async({canvasElement:e})=>{let t=V(e),n=await t.findByRole(`button`,{name:`Edit level of com.example`});await z(n).toBeDisabled(),await B.click(t.getByRole(`checkbox`,{name:`Allow logger changes`})),await z(n).toBeEnabled()}},G={args:{initial:{q:`catalina`}}},K={args:{status:{allowMutation:!1}},play:async({canvasElement:e})=>{await z(await V(e).findByText(/Runtime changes are disabled/)).toBeInTheDocument()}},q=[`Loggers`,`EditLevel`,`Filtered`,`MutationsDisabled`],U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await expect(await within(canvasElement).findByText("com.example.orders.OrderService")).toBeInTheDocument();
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const edit = await canvas.findByRole("button", {
      name: "Edit level of com.example"
    });
    await expect(edit).toBeDisabled();
    await userEvent.click(canvas.getByRole("checkbox", {
      name: "Allow logger changes"
    }));
    await expect(edit).toBeEnabled();
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    initial: {
      q: "catalina"
    }
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    status: {
      allowMutation: false
    }
  },
  play: async ({
    canvasElement
  }) => {
    await expect(await within(canvasElement).findByText(/Runtime changes are disabled/)).toBeInTheDocument();
  }
}`,...K.parameters?.docs?.source}}}})))()}J();export{W as EditLevel,G as Filtered,U as Loggers,K as MutationsDisabled,q as __namedExportsOrder,H as default};