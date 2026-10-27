import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./CopyButton-B7YfmEMb.js";var r,i,a,o,s,c,l,u,d;function f(){return(f=e((()=>{t(),{expect:r,fn:i,userEvent:a,within:o}=__STORYBOOK_MODULE_TEST__,s={title:`Components/CopyButton`,component:n,argTypes:{label:{control:`text`},className:{table:{disable:!0}},iconClassName:{table:{disable:!0}}},parameters:{docs:{description:{component:"A borderless copy-to-clipboard icon button. Falls back to a hidden-textarea execCommand copy when the async Clipboard API is unavailable (an http origin, or an embedded WebView), and surfaces a rejected copy as 'Copy failed' rather than silently doing nothing. Pass a thunk as `value` when the payload is expensive to build."}}}},c={args:{value:`SELECT * FROM AsPolicy`,label:`Copy SQL`}},l={args:{label:`Copy report`,value:()=>`generated at ${new Date(0).toISOString()}`}},u={args:{value:`copied payload`,label:`Copy payload`},play:async({canvasElement:e})=>{let t=o(e),n=i();Object.defineProperty(navigator,"clipboard",{value:{writeText:n},configurable:!0}),await a.click(t.getByRole(`button`,{name:`Copy payload`})),await r(n).toHaveBeenCalledWith(`copied payload`),await r(t.getByRole(`button`,{name:`Copied`})).toBeInTheDocument()}},d=[`Default`,`LazyValue`,`Copies`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    value: "SELECT * FROM AsPolicy",
    label: "Copy SQL"
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    label: "Copy report",
    value: () => \`generated at \${new Date(0).toISOString()}\`
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    value: "copied payload",
    label: "Copy payload"
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    // Headless chromium denies writeText without the clipboard-write
    // permission, so stub it and assert the affordance itself.
    const writeText = fn();
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText
      },
      configurable: true
    });
    await userEvent.click(canvas.getByRole("button", {
      name: "Copy payload"
    }));
    await expect(writeText).toHaveBeenCalledWith("copied payload");
    await expect(canvas.getByRole("button", {
      name: "Copied"
    })).toBeInTheDocument();
  }
}`,...u.parameters?.docs?.source}}}})))()}f();export{u as Copies,c as Default,l as LazyValue,d as __namedExportsOrder,s as default};