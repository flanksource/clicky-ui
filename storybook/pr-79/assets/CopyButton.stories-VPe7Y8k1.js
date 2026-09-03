import{C as g}from"./CopyButton-DfFpnpKA.js";import"./iframe-lrV_tcxP.js";import"./preload-helper-C6Lb07j8.js";import"./utils-DW-IJACk.js";import"./IconButton-C0oFeP8R.js";import"./Icon-CgtLhDD0.js";import"./clipboard-DE8ysAVc.js";const{expect:r,fn:C,userEvent:v,within:h}=__STORYBOOK_MODULE_TEST__,O={title:"Components/CopyButton",component:g,argTypes:{label:{control:"text"},className:{table:{disable:!0}},iconClassName:{table:{disable:!0}}},parameters:{docs:{description:{component:"A borderless copy-to-clipboard icon button. Falls back to a hidden-textarea execCommand copy when the async Clipboard API is unavailable (an http origin, or an embedded WebView), and surfaces a rejected copy as 'Copy failed' rather than silently doing nothing. Pass a thunk as `value` when the payload is expensive to build."}}}},e={args:{value:"SELECT * FROM AsPolicy",label:"Copy SQL"}},a={args:{label:"Copy report",value:()=>`generated at ${new Date(0).toISOString()}`}},t={args:{value:"copied payload",label:"Copy payload"},play:async({canvasElement:b})=>{const o=h(b),n=C();Object.defineProperty(navigator,"clipboard",{value:{writeText:n},configurable:!0}),await v.click(o.getByRole("button",{name:"Copy payload"})),await r(n).toHaveBeenCalledWith("copied payload"),await r(o.getByRole("button",{name:"Copied"})).toBeInTheDocument()}};var s,i,l;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    value: "SELECT * FROM AsPolicy",
    label: "Copy SQL"
  }
}`,...(l=(i=e.parameters)==null?void 0:i.docs)==null?void 0:l.source}}};var c,p,d;a.parameters={...a.parameters,docs:{...(c=a.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    label: "Copy report",
    value: () => \`generated at \${new Date(0).toISOString()}\`
  }
}`,...(d=(p=a.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};var u,m,y;t.parameters={...t.parameters,docs:{...(u=t.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(y=(m=t.parameters)==null?void 0:m.docs)==null?void 0:y.source}}};const _=["Default","LazyValue","Copies"];export{t as Copies,e as Default,a as LazyValue,_ as __namedExportsOrder,O as default};
