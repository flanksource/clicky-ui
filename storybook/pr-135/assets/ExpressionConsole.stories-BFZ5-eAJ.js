import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{r,u as i}from"./classes-BFK0cEJ7.js";import{i as a,t as o}from"./expressions-DpToOQ_B.js";import{n as s,t as c}from"./ExpressionConsole-Cva_U63A.js";function l(e){let[t,n]=(0,u.useState)(e.language),[r,i]=(0,u.useState)(e.expression),[a,o]=(0,u.useState)(e.history),[s,l]=(0,u.useState)(``);return(0,d.jsx)(`div`,{className:`h-80 p-3`,children:(0,d.jsx)(c,{...e,language:t,onLanguageChange:e=>{n(e),i(``)},expression:r,onExpressionChange:i,history:a,onHistoryChange:o,...e.loaders?{loaders:{...e.loaders,value:s,onChange:l}}:{}})})}var u,d,f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{u=t(),i(),a(),s(),d=n(),{expect:f,fn:p,userEvent:m,within:h}=__STORYBOOK_MODULE_TEST__,g={title:`JVM/ExpressionConsole`,component:l,parameters:{layout:`fullscreen`},args:{language:`ognl`,onLanguageChange:p(),expression:``,onExpressionChange:p(),presets:[...o,{label:`Hello`,expression:`println 'hello from Groovy'`,language:`groovy`}],history:[`#root.size()`,`@java.lang.Runtime@getRuntime().availableProcessors()`],onHistoryChange:p(),canRun:!0,running:!1,onRun:p()}},_={play:async({canvasElement:e,args:t})=>{let n=h(e);await f(n.getByRole(`button`,{name:`Run`})).toBeDisabled(),await m.click(n.getByRole(`button`,{name:/^Runtime/})),await f(n.getByRole(`textbox`,{name:`OGNL expression`})).toHaveValue(`@java.lang.Runtime@getRuntime()`),await m.click(n.getByRole(`button`,{name:`Run`})),await f(t.onRun).toHaveBeenCalledOnce()}},v={args:{language:`groovy`,history:[]},play:async({canvasElement:e})=>{let t=h(e);await f(t.getByRole(`button`,{name:/^Hello/})).toBeInTheDocument(),await f(t.getByRole(`button`,{name:/Load file/})).toBeInTheDocument()}},y={args:{expression:`@java.lang.System@getProperties()`,loaders:{options:r,value:``,onChange:p()}}},b={args:{expression:`@java.lang.System@getProperties()`,canRun:!1,toolbar:(0,d.jsx)(`span`,{className:`text-xs text-muted-foreground`,children:`Runtime changes are disabled for this JVM.`})},play:async({canvasElement:e})=>{await f(h(e).getByRole(`button`,{name:`Run`})).toBeDisabled()}},x={args:{expression:`@java.lang.System@getProperties()`,running:!0}},S=[`Ognl`,`Groovy`,`WithClassLoaders`,`RunningNotPermitted`,`Running`],_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", {
      name: "Run"
    })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", {
      name: /^Runtime/
    }));
    await expect(canvas.getByRole("textbox", {
      name: "OGNL expression"
    })).toHaveValue("@java.lang.Runtime@getRuntime()");
    await userEvent.click(canvas.getByRole("button", {
      name: "Run"
    }));
    await expect(args.onRun).toHaveBeenCalledOnce();
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    language: "groovy",
    history: []
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", {
      name: /^Hello/
    })).toBeInTheDocument();
    await expect(canvas.getByRole("button", {
      name: /Load file/
    })).toBeInTheDocument();
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    expression: "@java.lang.System@getProperties()",
    loaders: {
      options: CLASS_LOADERS,
      value: "",
      onChange: fn()
    }
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    expression: "@java.lang.System@getProperties()",
    canRun: false,
    toolbar: <span className="text-xs text-muted-foreground">Runtime changes are disabled for this JVM.</span>
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByRole("button", {
      name: "Run"
    })).toBeDisabled();
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    expression: "@java.lang.System@getProperties()",
    running: true
  }
}`,...x.parameters?.docs?.source}}}})))()}C();export{v as Groovy,_ as Ognl,x as Running,b as RunningNotPermitted,y as WithClassLoaders,S as __namedExportsOrder,g as default};