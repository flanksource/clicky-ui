import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./MonacoProvider-DfyDAmQC.js";import{r as a,t as o}from"./AnnotatedCode-DiSEvJd6.js";function s(){return new Worker(new URL(`/clicky-ui/storybook/pr-119/assets/editor.worker-BlfIGhym.js`,``+import.meta.url),{type:`module`})}function c({onChange:e,...t}){let[n,r]=(0,l.useState)(h);return(0,u.jsx)(i,{getWorker:s,children:(0,u.jsx)(`div`,{className:`h-[360px]`,children:(0,u.jsx)(o,{path:`docs/guide.md`,source:n,findings:g,...t,...e?{onChange:t=>{r(t),e(t)}}:{}})})})}var l,u,d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{l=t(),r(),a(),u=n(),{expect:d,fn:f,userEvent:p,waitFor:m}=__STORYBOOK_MODULE_TEST__,h=`# Guide

This paragraph is is written as one long line so that the line length rule and the repetition rule both have something to flag.
## Setup

Run the installer.`,g=[{file:`docs/guide.md`,line:3,column:16,endColumn:21,severity:`error`,message:`'is' is repeated`,source:`vale`,rule:`Vale.Repetition`,kind:`lint`},{file:`docs/guide.md`,line:3,severity:`warning`,message:`Line length exceeds 80 characters`,source:`markdownlint`,rule:`MD013`,kind:`lint`},{file:`docs/guide.md`,line:4,severity:`info`,message:`Headings should be surrounded by blank lines`,source:`markdownlint`,rule:`MD022`,kind:`lint`}],_={title:`Git/AnnotatedCode`,component:o,tags:[`browser`],parameters:{layout:`fullscreen`,docs:{description:{component:"A source file in Monaco with its findings as squiggles, gutter dots and read-only threads in a rail. Read-only unless `onChange` is given; `inlineChips` adds each line's worst finding after its text. Needs a `MonacoProvider` above it."}}},args:{path:`docs/guide.md`,source:h,findings:g}},v={render:()=>(0,u.jsx)(c,{})},y={args:{onChange:f()},render:e=>(0,u.jsx)(c,{onChange:e.onChange}),play:async({args:e,canvasElement:t})=>{let n=await m(()=>{let e=t.querySelector(`.view-lines`);if(!e)throw Error(`the editor has not rendered its lines yet`);return e});await m(()=>d(t.querySelector(`.squiggly-error`)).not.toBeNull()),await p.click(n);let r=t.querySelector(`textarea.inputarea`);if(!r)throw Error(`the editor has no input area`);r.focus(),await p.keyboard(`x`),await m(()=>d(e.onChange).toHaveBeenCalled()),await d(t.querySelector(`.squiggly-error`)).not.toBeNull()}},b={render:()=>(0,u.jsx)(c,{inlineChips:!0}),play:async({canvasElement:e})=>{let t=()=>(e.textContent??``).replace(/\u00a0/g,` `);await m(()=>d(t()).toContain(`Vale.Repetition · 'is' is repeated +1`)),await d(t()).toContain(`MD022 · Headings should be surrounded by blank lines`)}},x=[`ReadOnly`,`Editable`,`InlineChips`],v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <Harness />
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    onChange: fn()
  },
  render: args => <Harness onChange={args.onChange} />,
  play: async ({
    args,
    canvasElement
  }) => {
    const lines = await waitFor(() => {
      const element = canvasElement.querySelector<HTMLElement>(".view-lines");
      if (!element) throw new Error("the editor has not rendered its lines yet");
      return element;
    });
    await waitFor(() => expect(canvasElement.querySelector(".squiggly-error")).not.toBeNull());
    await userEvent.click(lines);
    const input = canvasElement.querySelector<HTMLTextAreaElement>("textarea.inputarea");
    if (!input) throw new Error("the editor has no input area");
    input.focus();
    await userEvent.keyboard("x");
    await waitFor(() => expect(args.onChange).toHaveBeenCalled());
    await expect(canvasElement.querySelector(".squiggly-error")).not.toBeNull();
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <Harness inlineChips />,
  play: async ({
    canvasElement
  }) => {
    // Monaco renders spaces in its view lines as no-break spaces.
    const text = () => (canvasElement.textContent ?? "").replace(/\\u00a0/g, " ");
    await waitFor(() => expect(text()).toContain("Vale.Repetition · 'is' is repeated +1"));
    await expect(text()).toContain("MD022 · Headings should be surrounded by blank lines");
  }
}`,...b.parameters?.docs?.source}}}})))()}S();export{y as Editable,b as InlineChips,v as ReadOnly,x as __namedExportsOrder,_ as default};