import{j as e}from"./iframe-BZbOQtFx.js";import{T as B}from"./theme-switcher-6bnI0OM_.js";import{B as r}from"./button-w4wxkRvZ.js";import"./preload-helper-B2wK-Kjy.js";import"./Icon-rviauDIl.js";import"./utils-BLSKlp9E.js";import"./icon-menu-picker-2zexs36d.js";import"./floating-ui.react-o04l4swZ.js";import"./index-DqaOm_H7.js";import"./index-C9I8SpvD.js";import"./modalStack-DmLqMJfC.js";import"./zIndex-CigQ76av.js";import"./IconButton-BxQat-nP.js";import"./UiChevronDown-H5W8lwGu.js";import"./UiCheck-C1P9WR7d.js";import"./UiSun-CFzuvLZm.js";import"./index-1evVQkiP.js";import"./loading-CHO2ZS0P.js";const{expect:m,userEvent:t,within:f}=__STORYBOOK_MODULE_TEST__,q={title:"Theming/ThemeSwitcher",component:B,tags:["autodocs"],args:{className:"",triggerClassName:"",menuClassName:""},parameters:{docs:{description:{component:"Icon-button picker that toggles between light, dark, and system themes. It writes `data-theme` on `<html>`, persists to localStorage, and expects `ThemeProvider` at the app root."}}}},o={},s={render:()=>e.jsxs("div",{className:"flex flex-col gap-density-4",children:[e.jsx(B,{}),e.jsxs("div",{className:"rounded-lg border border-border bg-card p-density-4 text-card-foreground",children:[e.jsx("h3",{className:"text-lg font-semibold",children:"Preview card"}),e.jsx("p",{className:"mt-density-2 text-sm text-muted-foreground",children:"This card uses `bg-card`, `text-card-foreground`, and `border-border` — swap the theme above to see it respond."}),e.jsxs("div",{className:"mt-density-3 flex flex-wrap gap-density-2",children:[e.jsx(r,{children:"Primary"}),e.jsx(r,{variant:"secondary",children:"Secondary"}),e.jsx(r,{variant:"outline",children:"Outline"}),e.jsx(r,{variant:"destructive",children:"Destructive"})]})]})]})},i={play:async({canvasElement:d,step:n})=>{const a=f(d.ownerDocument.body);await n("open menu and pick dark",async()=>{await t.click(a.getByRole("button",{name:/theme/i})),await t.click(a.getByRole("menuitemradio",{name:/dark/i})),await m(document.documentElement.getAttribute("data-theme")).toBe("dark")}),await n("open menu and pick light",async()=>{await t.click(a.getByRole("button",{name:/theme/i})),await t.click(a.getByRole("menuitemradio",{name:/light/i})),await m(document.documentElement.getAttribute("data-theme")).toBe("light")})}},c={play:async({canvasElement:d,step:n})=>{const j=f(d.ownerDocument.body).getByRole("button",{name:/theme/i});await n("open with Enter, navigate with arrows, select with Enter",async()=>{j.focus(),await t.keyboard("{Enter}"),await t.keyboard("{ArrowDown}"),await t.keyboard("{Enter}");const S=document.documentElement.getAttribute("data-theme");await m(["light","dark"]).toContain(S)})}};var u,l,p;o.parameters={...o.parameters,docs:{...(u=o.parameters)==null?void 0:u.docs,source:{originalSource:"{}",...(p=(l=o.parameters)==null?void 0:l.docs)==null?void 0:p.source}}};var h,g,w;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-density-4">
      <ThemeSwitcher />
      <div className="rounded-lg border border-border bg-card p-density-4 text-card-foreground">
        <h3 className="text-lg font-semibold">Preview card</h3>
        <p className="mt-density-2 text-sm text-muted-foreground">
          This card uses \`bg-card\`, \`text-card-foreground\`, and \`border-border\` — swap the theme
          above to see it respond.
        </p>
        <div className="mt-density-3 flex flex-wrap gap-density-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </div>
    </div>
}`,...(w=(g=s.parameters)==null?void 0:g.docs)==null?void 0:w.source}}};var y,v,b;i.parameters={...i.parameters,docs:{...(y=i.parameters)==null?void 0:y.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    step
  }) => {
    // Query the whole document, not just the story canvas: the menu renders in a
    // FloatingPortal at document.body, outside canvasElement.
    const canvas = within(canvasElement.ownerDocument.body);
    await step("open menu and pick dark", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: /theme/i
      }));
      await userEvent.click(canvas.getByRole("menuitemradio", {
        name: /dark/i
      }));
      await expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });
    await step("open menu and pick light", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: /theme/i
      }));
      await userEvent.click(canvas.getByRole("menuitemradio", {
        name: /light/i
      }));
      await expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });
  }
}`,...(b=(v=i.parameters)==null?void 0:v.docs)==null?void 0:b.source}}};var x,E,k;c.parameters={...c.parameters,docs:{...(x=c.parameters)==null?void 0:x.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    step
  }) => {
    // Query the whole document, not just the story canvas: the menu renders in a
    // FloatingPortal at document.body, outside canvasElement.
    const canvas = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", {
      name: /theme/i
    });
    await step("open with Enter, navigate with arrows, select with Enter", async () => {
      trigger.focus();
      await userEvent.keyboard("{Enter}");
      await userEvent.keyboard("{ArrowDown}");
      await userEvent.keyboard("{Enter}");
      const value = document.documentElement.getAttribute("data-theme");
      await expect(["light", "dark"]).toContain(value);
    });
  }
}`,...(k=(E=c.parameters)==null?void 0:E.docs)==null?void 0:k.source}}};const z=["Default","WithPreview","ChangesDataAttribute","KeyboardSelection"];export{i as ChangesDataAttribute,o as Default,c as KeyboardSelection,s as WithPreview,z as __namedExportsOrder,q as default};
