import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./button-6-GcSFqM.js";import{n as i,t as a}from"./density-switcher-mz4Gwip_.js";var o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{i(),n(),o=t(),{expect:s,userEvent:c,within:l}=__STORYBOOK_MODULE_TEST__,u={title:`Theming/DensitySwitcher`,component:a,tags:[`autodocs`],args:{className:``,triggerClassName:``,menuClassName:``},parameters:{docs:{description:{component:"Icon-button picker that toggles control density between `compact`, `comfortable`, and `spacious`. Writes `data-density` on `<html>` and drives the `--control-height`, `--control-padding-x`, `--spacing-unit` and `--font-size-base` tokens."}}}},d={},f={render:()=>(0,o.jsxs)(`div`,{className:`flex flex-col gap-density-4`,children:[(0,o.jsx)(a,{}),(0,o.jsxs)(`div`,{className:`flex flex-wrap items-center gap-density-2 rounded-lg border border-border p-density-3`,children:[(0,o.jsx)(r,{size:`sm`,children:`Small`}),(0,o.jsx)(r,{size:`default`,children:`Default`}),(0,o.jsx)(r,{size:`lg`,children:`Large`}),(0,o.jsx)(`span`,{className:`text-density-base text-muted-foreground`,children:`Body text at density-base font size`})]}),(0,o.jsxs)(`div`,{className:`grid grid-cols-3 gap-density-2 text-xs`,children:[(0,o.jsxs)(`div`,{className:`rounded border border-border p-density-2`,children:[(0,o.jsx)(`div`,{className:`font-mono text-muted-foreground`,children:`--spacing-unit`}),(0,o.jsx)(`div`,{className:`mt-density-1 h-density-4 rounded bg-primary`})]}),(0,o.jsxs)(`div`,{className:`rounded border border-border p-density-2`,children:[(0,o.jsx)(`div`,{className:`font-mono text-muted-foreground`,children:`--control-height`}),(0,o.jsx)(`div`,{className:`mt-density-1 h-control-h rounded bg-secondary`})]}),(0,o.jsxs)(`div`,{className:`rounded border border-border p-density-2`,children:[(0,o.jsx)(`div`,{className:`font-mono text-muted-foreground`,children:`--control-padding-x`}),(0,o.jsx)(`div`,{className:`mt-density-1 inline-block rounded bg-accent px-control-px py-density-1`,children:`x`})]})]})]})},p={play:async({canvasElement:e,step:t})=>{let n=l(e.ownerDocument.body);await t(`open menu and pick compact`,async()=>{await c.click(n.getByRole(`button`,{name:/density/i})),await c.click(n.getByRole(`menuitemradio`,{name:/compact/i})),await s(document.documentElement.getAttribute(`data-density`)).toBe(`compact`)}),await t(`open menu and pick spacious`,async()=>{await c.click(n.getByRole(`button`,{name:/density/i})),await c.click(n.getByRole(`menuitemradio`,{name:/spacious/i})),await s(document.documentElement.getAttribute(`data-density`)).toBe(`spacious`)})}},m={play:async({canvasElement:e,step:t})=>{let n=l(e.ownerDocument.body).getByRole(`button`,{name:/density/i});await t(`open with Enter, navigate with arrows, select with Enter`,async()=>{n.focus(),await c.keyboard(`{Enter}`),await c.keyboard(`{ArrowDown}`),await c.keyboard(`{Enter}`);let e=document.documentElement.getAttribute(`data-density`);await s([`compact`,`comfortable`,`spacious`]).toContain(e)})}},h=[`Default`,`WithPreview`,`ChangesDataAttribute`,`KeyboardSelection`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    step
  }) => {
    // Query the whole document, not just the story canvas: the menu renders in a
    // FloatingPortal at document.body, outside canvasElement.
    const canvas = within(canvasElement.ownerDocument.body);
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
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    step
  }) => {
    // Query the whole document, not just the story canvas: the menu renders in a
    // FloatingPortal at document.body, outside canvasElement.
    const canvas = within(canvasElement.ownerDocument.body);
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
}`,...m.parameters?.docs?.source}}}})))()}g();export{p as ChangesDataAttribute,d as Default,m as KeyboardSelection,f as WithPreview,h as __namedExportsOrder,u as default};