import{j as e}from"./iframe-C0Aur-Df.js";import{T as B}from"./theme-switcher-DGddNb7n.js";import{B as r}from"./button-Csc3egge.js";import"./preload-helper-B4w--iqy.js";import"./Icon-bcMubS04.js";import"./utils-BLSKlp9E.js";import"./icon-menu-picker-DvJnOcvb.js";import"./floating-ui.react-BfCuA5NM.js";import"./index-ga98dKrt.js";import"./index-BZn3QKoH.js";import"./modalStack-XoAQ75vk.js";import"./zIndex-CigQ76av.js";import"./IconButton-DpCvxGK8.js";import"./UiChevronDown-CebnzLpn.js";import"./UiCheck-DxBSpKg0.js";import"./use-theme-Ck1X3j6Z.js";import"./UiSun-DG1ARzGm.js";import"./index-1evVQkiP.js";import"./loading-DvDd1lzh.js";const{expect:m,userEvent:t,within:f}=__STORYBOOK_MODULE_TEST__,G={title:"Theming/ThemeSwitcher",component:B,tags:["autodocs"],args:{className:"",triggerClassName:"",menuClassName:""},parameters:{docs:{description:{component:"Icon-button picker that toggles between light, dark, and system themes. It writes `data-theme` on `<html>`, persists to localStorage, and expects `ThemeProvider` at the app root."}}}},o={},i={render:()=>e.jsxs("div",{className:"flex flex-col gap-density-4",children:[e.jsx(B,{}),e.jsxs("div",{className:"rounded-lg border border-border bg-card p-density-4 text-card-foreground",children:[e.jsx("h3",{className:"text-lg font-semibold",children:"Preview card"}),e.jsx("p",{className:"mt-density-2 text-sm text-muted-foreground",children:"This card uses `bg-card`, `text-card-foreground`, and `border-border` — swap the theme above to see it respond."}),e.jsxs("div",{className:"mt-density-3 flex flex-wrap gap-density-2",children:[e.jsx(r,{children:"Primary"}),e.jsx(r,{variant:"secondary",children:"Secondary"}),e.jsx(r,{variant:"outline",children:"Outline"}),e.jsx(r,{variant:"destructive",children:"Destructive"})]})]})]})},s={play:async({canvasElement:d,step:n})=>{const a=f(d);await n("open menu and pick dark",async()=>{await t.click(a.getByRole("button",{name:/theme/i})),await t.click(a.getByRole("menuitemradio",{name:/dark/i})),await m(document.documentElement.getAttribute("data-theme")).toBe("dark")}),await n("open menu and pick light",async()=>{await t.click(a.getByRole("button",{name:/theme/i})),await t.click(a.getByRole("menuitemradio",{name:/light/i})),await m(document.documentElement.getAttribute("data-theme")).toBe("light")})}},c={play:async({canvasElement:d,step:n})=>{const S=f(d).getByRole("button",{name:/theme/i});await n("open with Enter, navigate with arrows, select with Enter",async()=>{S.focus(),await t.keyboard("{Enter}"),await t.keyboard("{ArrowDown}"),await t.keyboard("{Enter}");const N=document.documentElement.getAttribute("data-theme");await m(["light","dark"]).toContain(N)})}};var l,u,p;o.parameters={...o.parameters,docs:{...(l=o.parameters)==null?void 0:l.docs,source:{originalSource:"{}",...(p=(u=o.parameters)==null?void 0:u.docs)==null?void 0:p.source}}};var g,h,w;i.parameters={...i.parameters,docs:{...(g=i.parameters)==null?void 0:g.docs,source:{originalSource:`{
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
}`,...(w=(h=i.parameters)==null?void 0:h.docs)==null?void 0:w.source}}};var v,y,b;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
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
}`,...(b=(y=s.parameters)==null?void 0:y.docs)==null?void 0:b.source}}};var x,E,k;c.parameters={...c.parameters,docs:{...(x=c.parameters)==null?void 0:x.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
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
}`,...(k=(E=c.parameters)==null?void 0:E.docs)==null?void 0:k.source}}};const H=["Default","WithPreview","ChangesDataAttribute","KeyboardSelection"];export{s as ChangesDataAttribute,o as Default,c as KeyboardSelection,i as WithPreview,H as __namedExportsOrder,G as default};
