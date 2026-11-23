import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{n as r,t as i}from"./MonacoProvider-CuasA_DE.js";import{c as a,u as o}from"./classes-BFK0cEJ7.js";import{n as s,t as c}from"./DecompiledSourceView-DcLrxg7_.js";function l(){return new Worker(new URL(`/clicky-ui/storybook/pr-133/assets/editor.worker-BlfIGhym.js`,``+import.meta.url),{type:`module`})}function u(e){let[t,n]=(0,d.useState)(e.draft??v.source),[r,a]=(0,d.useState)(-1);return(0,f.jsx)(i,{getWorker:l,children:(0,f.jsx)(`div`,{className:`h-[420px] w-[720px] border border-border`,children:(0,f.jsx)(c,{...e,draft:t,onDraftChange:n,highlightRow:e.mode===`read`&&r>=0?r:e.highlightRow,onSelectRow:a})})})}var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{d=t(),r(),o(),s(),f=n(),{expect:p,userEvent:m,waitFor:h,within:g}=__STORYBOOK_MODULE_TEST__,_=`com.example.orders.OrderService`,v=a(_,`6d06d69c`),y={title:`JVM/DecompiledSourceView`,component:u,args:{qualifiedName:_,source:v.source,sourceLineNumbers:v.sourceLineNumbers,mode:`read`,focusRange:null,highlightRow:-1,markers:[]}},b={play:async({canvasElement:e})=>{let t=e.querySelectorAll(`[data-row]`);await p(t).toHaveLength(v.source.split(`
`).length),await p(e.querySelector(`[data-row="15"] [data-gutter]`)).toHaveTextContent(`18`)}},x={play:async({canvasElement:e})=>{await m.click(e.querySelector(`[data-row="16"]`)),await p(e.querySelector(`[data-row="16"]`)).toHaveAttribute(`data-highlighted`,`true`)}},S={args:{focusRange:{startLine:14,endLine:19}},play:async({canvasElement:e})=>{let t=g(e);await p(e.querySelectorAll(`[data-row]`)).toHaveLength(6),await m.click(t.getByRole(`button`,{name:`Show whole class`})),await p(e.querySelectorAll(`[data-row]`)).toHaveLength(v.source.split(`
`).length)}},C={args:{highlightRow:16}},w={args:{sourceLineNumbers:v.source.split(`
`).map(()=>0)}},T={args:{warning:`CFR could not recover some control flow; the source may not compile as is.`}},E={tags:[`browser`],args:{mode:`edit`,draft:v.source},play:async({canvasElement:e})=>{await h(()=>p(e.querySelector(`.view-lines`)).not.toBeNull(),{timeout:1e4}),await p(g(e).getByText(/redefinition may change method bodies only/i)).toBeInTheDocument()}},D={tags:[`browser`],args:{mode:`edit`,draft:v.source.replace(`return total;`,`return "TODO compile error";`),markers:[{line:18,column:16,message:`incompatible types: java.lang.String cannot be converted to double`,severity:`error`}]},play:async({canvasElement:e})=>{await h(()=>p(e.querySelector(`.squiggly-error`)).not.toBeNull(),{timeout:1e4})}},O=[`Reading`,`ClickingARowHighlightsIt`,`FoldedToMethod`,`HighlightedLine`,`NoLineMarkers`,`DecompilerWarning`,`Editing`,`EditingWithCompilerErrors`],b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const rows = canvasElement.querySelectorAll("[data-row]");
    await expect(rows).toHaveLength(FIXTURE.source.split("\\n").length);
    await expect(canvasElement.querySelector('[data-row="15"] [data-gutter]')).toHaveTextContent("18");
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await userEvent.click(canvasElement.querySelector('[data-row="16"]')!);
    await expect(canvasElement.querySelector('[data-row="16"]')).toHaveAttribute("data-highlighted", "true");
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    focusRange: {
      startLine: 14,
      endLine: 19
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll("[data-row]")).toHaveLength(6);
    await userEvent.click(canvas.getByRole("button", {
      name: "Show whole class"
    }));
    await expect(canvasElement.querySelectorAll("[data-row]")).toHaveLength(FIXTURE.source.split("\\n").length);
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    highlightRow: 16
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    sourceLineNumbers: FIXTURE.source.split("\\n").map(() => 0)
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    warning: "CFR could not recover some control flow; the source may not compile as is."
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  tags: ["browser"],
  args: {
    mode: "edit",
    draft: FIXTURE.source
  },
  play: async ({
    canvasElement
  }) => {
    await waitFor(() => expect(canvasElement.querySelector(".view-lines")).not.toBeNull(), {
      timeout: 10_000
    });
    await expect(within(canvasElement).getByText(/redefinition may change method bodies only/i)).toBeInTheDocument();
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  tags: ["browser"],
  args: {
    mode: "edit",
    draft: FIXTURE.source.replace("return total;", 'return "TODO compile error";'),
    markers: [{
      line: 18,
      column: 16,
      message: "incompatible types: java.lang.String cannot be converted to double",
      severity: "error"
    }]
  },
  play: async ({
    canvasElement
  }) => {
    await waitFor(() => expect(canvasElement.querySelector(".squiggly-error")).not.toBeNull(), {
      timeout: 10_000
    });
  }
}`,...D.parameters?.docs?.source}}}})))()}k();export{x as ClickingARowHighlightsIt,T as DecompilerWarning,E as Editing,D as EditingWithCompilerErrors,S as FoldedToMethod,C as HighlightedLine,w as NoLineMarkers,b as Reading,O as __namedExportsOrder,y as default};