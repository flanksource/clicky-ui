import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{n as r,t as i}from"./MonacoProvider-CuasA_DE.js";import{r as a,t as o}from"./AnnotatedCode-Bh_t1xsL.js";function s(){return new Worker(new URL(`/clicky-ui/storybook/pr-125/assets/editor.worker-BlfIGhym.js`,``+import.meta.url),{type:`module`})}function c({onChange:e,...t}){let[n,r]=(0,l.useState)(h);return(0,u.jsx)(i,{getWorker:s,children:(0,u.jsx)(`div`,{className:`h-[360px]`,children:(0,u.jsx)(o,{path:`docs/guide.md`,source:n,findings:g,...t,...e?{onChange:t=>{r(t),e(t)}}:{}})})})}var l,u,d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{l=t(),r(),a(),u=n(),{expect:d,fn:f,userEvent:p,waitFor:m}=__STORYBOOK_MODULE_TEST__,h=`# Guide

This paragraph is is written as one long line so that the line length rule and the repetition rule both have something to flag.
## Setup

Run the installer.`,g=[{file:`docs/guide.md`,line:3,column:16,endColumn:21,severity:`error`,message:`'is' is repeated`,source:`vale`,rule:`Vale.Repetition`,kind:`lint`},{file:`docs/guide.md`,line:3,severity:`warning`,message:`Line length exceeds 80 characters`,source:`markdownlint`,rule:`MD013`,kind:`lint`},{file:`docs/guide.md`,line:4,severity:`info`,message:`Headings should be surrounded by blank lines`,source:`markdownlint`,rule:`MD022`,kind:`lint`}],_={title:`Git/AnnotatedCode`,component:o,tags:[`browser`],parameters:{layout:`fullscreen`,docs:{description:{component:"A source file in Monaco with its findings as squiggles, gutter dots and read-only threads in a rail. Read-only unless `onChange` is given; `inlineFindings` lists each line's findings under it, as the review source view does. Needs a `MonacoProvider` above it."}}},args:{path:`docs/guide.md`,source:h,findings:g}},v={render:()=>(0,u.jsx)(c,{})},y={args:{onChange:f()},render:e=>(0,u.jsx)(c,{onChange:e.onChange}),play:async({args:e,canvasElement:t})=>{let n=await m(()=>{let e=t.querySelector(`.view-lines`);if(!e)throw Error(`the editor has not rendered its lines yet`);return e});await m(()=>d(t.querySelector(`.squiggly-error`)).not.toBeNull()),await p.click(n);let r=t.querySelector(`textarea.inputarea`);if(!r)throw Error(`the editor has no input area`);r.focus(),await p.keyboard(`x`),await m(()=>d(e.onChange).toHaveBeenCalled()),await d(t.querySelector(`.squiggly-error`)).not.toBeNull()}},b={render:()=>(0,u.jsx)(c,{inlineFindings:!0}),play:async({canvasElement:e})=>{let t=()=>[...e.querySelectorAll(`[data-source-finding]`)];await m(()=>d(t()).toHaveLength(3)),await d(t().map(e=>[e.dataset.sourceFinding,e.textContent])).toEqual([[`3`,`'is' is repeatedvale Vale.Repetition`],[`3`,`Line length exceeds 80 charactersmarkdownlint MD013`],[`4`,`Headings should be surrounded by blank linesmarkdownlint MD022`]]),await m(()=>d(t().map(e=>e.getBoundingClientRect().height)).toEqual([20,20,20]))}},x=[`ReadOnly`,`Editable`,`InlineFindings`],v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
  render: () => <Harness inlineFindings />,
  play: async ({
    canvasElement
  }) => {
    const rows = () => [...canvasElement.querySelectorAll<HTMLElement>("[data-source-finding]")];
    await waitFor(() => expect(rows()).toHaveLength(3));
    await expect(rows().map(row => [row.dataset.sourceFinding, row.textContent])).toEqual([["3", "'is' is repeatedvale Vale.Repetition"], ["3", "Line length exceeds 80 charactersmarkdownlint MD013"], ["4", "Headings should be surrounded by blank linesmarkdownlint MD022"]]);
    // The rows render into view-zone nodes that Monaco attaches to the document on a later frame, and a detached node measures 0.
    await waitFor(() => expect(rows().map(row => row.getBoundingClientRect().height)).toEqual([20, 20, 20]));
  }
}`,...b.parameters?.docs?.source}}}})))()}S();export{y as Editable,b as InlineFindings,v as ReadOnly,x as __namedExportsOrder,_ as default};