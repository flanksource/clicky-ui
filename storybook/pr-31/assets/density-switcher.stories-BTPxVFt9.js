import{j as e}from"./iframe-CCq80owj.js";import{D as N}from"./density-switcher-BgVtul70.js";import{B as c}from"./button-CRz4am1-.js";import"./preload-helper-ByUaG9M2.js";import"./icon-menu-picker-DqoC6W9m.js";import"./floating-ui.react-B-mN0D-Z.js";import"./index-nIbAMNhx.js";import"./index-DW2b6Sux.js";import"./utils-BLSKlp9E.js";import"./Icon-Cl3hQAjl.js";import"./modalStack-BctA1mPW.js";import"./zIndex-CigQ76av.js";import"./IconButton-Dn8B_rv9.js";import"./UiChevronDown-_xEbLx9w.js";import"./UiCheck-CzE9SQC0.js";import"./UiRows-BVRSK_8n.js";import"./UiListFlat-DA80u5A5.js";import"./index-1evVQkiP.js";import"./loading-NPQ1cFHI.js";const{expect:m,userEvent:t,within:B}=__STORYBOOK_MODULE_TEST__,G={title:"Theming/DensitySwitcher",component:N,tags:["autodocs"],args:{className:"",triggerClassName:"",menuClassName:""},parameters:{docs:{description:{component:"Icon-button picker that toggles control density between `compact`, `comfortable`, and `spacious`. Writes `data-density` on `<html>` and drives the `--control-height`, `--control-padding-x`, `--spacing-unit` and `--font-size-base` tokens."}}}},s={},o={render:()=>e.jsxs("div",{className:"flex flex-col gap-density-4",children:[e.jsx(N,{}),e.jsxs("div",{className:"flex flex-wrap items-center gap-density-2 rounded-lg border border-border p-density-3",children:[e.jsx(c,{size:"sm",children:"Small"}),e.jsx(c,{size:"default",children:"Default"}),e.jsx(c,{size:"lg",children:"Large"}),e.jsx("span",{className:"text-density-base text-muted-foreground",children:"Body text at density-base font size"})]}),e.jsxs("div",{className:"grid grid-cols-3 gap-density-2 text-xs",children:[e.jsxs("div",{className:"rounded border border-border p-density-2",children:[e.jsx("div",{className:"font-mono text-muted-foreground",children:"--spacing-unit"}),e.jsx("div",{className:"mt-density-1 h-density-4 rounded bg-primary"})]}),e.jsxs("div",{className:"rounded border border-border p-density-2",children:[e.jsx("div",{className:"font-mono text-muted-foreground",children:"--control-height"}),e.jsx("div",{className:"mt-density-1 h-control-h rounded bg-secondary"})]}),e.jsxs("div",{className:"rounded border border-border p-density-2",children:[e.jsx("div",{className:"font-mono text-muted-foreground",children:"--control-padding-x"}),e.jsx("div",{className:"mt-density-1 inline-block rounded bg-accent px-control-px py-density-1",children:"x"})]})]})]})},r={play:async({canvasElement:d,step:a})=>{const n=B(d);await a("open menu and pick compact",async()=>{await t.click(n.getByRole("button",{name:/density/i})),await t.click(n.getByRole("menuitemradio",{name:/compact/i})),await m(document.documentElement.getAttribute("data-density")).toBe("compact")}),await a("open menu and pick spacious",async()=>{await t.click(n.getByRole("button",{name:/density/i})),await t.click(n.getByRole("menuitemradio",{name:/spacious/i})),await m(document.documentElement.getAttribute("data-density")).toBe("spacious")})}},i={play:async({canvasElement:d,step:a})=>{const k=B(d).getByRole("button",{name:/density/i});await a("open with Enter, navigate with arrows, select with Enter",async()=>{k.focus(),await t.keyboard("{Enter}"),await t.keyboard("{ArrowDown}"),await t.keyboard("{Enter}");const j=document.documentElement.getAttribute("data-density");await m(["compact","comfortable","spacious"]).toContain(j)})}};var l,u,p;s.parameters={...s.parameters,docs:{...(l=s.parameters)==null?void 0:l.docs,source:{originalSource:"{}",...(p=(u=s.parameters)==null?void 0:u.docs)==null?void 0:p.source}}};var y,g,b;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-density-4">
      <DensitySwitcher />
      <div className="flex flex-wrap items-center gap-density-2 rounded-lg border border-border p-density-3">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <span className="text-density-base text-muted-foreground">
          Body text at density-base font size
        </span>
      </div>
      <div className="grid grid-cols-3 gap-density-2 text-xs">
        <div className="rounded border border-border p-density-2">
          <div className="font-mono text-muted-foreground">--spacing-unit</div>
          <div className="mt-density-1 h-density-4 rounded bg-primary" />
        </div>
        <div className="rounded border border-border p-density-2">
          <div className="font-mono text-muted-foreground">--control-height</div>
          <div className="mt-density-1 h-control-h rounded bg-secondary" />
        </div>
        <div className="rounded border border-border p-density-2">
          <div className="font-mono text-muted-foreground">--control-padding-x</div>
          <div className="mt-density-1 inline-block rounded bg-accent px-control-px py-density-1">
            x
          </div>
        </div>
      </div>
    </div>
}`,...(b=(g=o.parameters)==null?void 0:g.docs)==null?void 0:b.source}}};var v,x,w;r.parameters={...r.parameters,docs:{...(v=r.parameters)==null?void 0:v.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("open menu and pick compact", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: /density/i
      }));
      await userEvent.click(canvas.getByRole("menuitemradio", {
        name: /compact/i
      }));
      await expect(document.documentElement.getAttribute("data-density")).toBe("compact");
    });
    await step("open menu and pick spacious", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: /density/i
      }));
      await userEvent.click(canvas.getByRole("menuitemradio", {
        name: /spacious/i
      }));
      await expect(document.documentElement.getAttribute("data-density")).toBe("spacious");
    });
  }
}`,...(w=(x=r.parameters)==null?void 0:x.docs)==null?void 0:w.source}}};var h,f,E;i.parameters={...i.parameters,docs:{...(h=i.parameters)==null?void 0:h.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: /density/i
    });
    await step("open with Enter, navigate with arrows, select with Enter", async () => {
      trigger.focus();
      await userEvent.keyboard("{Enter}");
      await userEvent.keyboard("{ArrowDown}");
      await userEvent.keyboard("{Enter}");
      const value = document.documentElement.getAttribute("data-density");
      await expect(["compact", "comfortable", "spacious"]).toContain(value);
    });
  }
}`,...(E=(f=i.parameters)==null?void 0:f.docs)==null?void 0:E.source}}};const H=["Default","WithPreview","ChangesDataAttribute","KeyboardSelection"];export{r as ChangesDataAttribute,s as Default,i as KeyboardSelection,o as WithPreview,H as __namedExportsOrder,G as default};
