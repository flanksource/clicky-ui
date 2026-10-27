import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./button-D0DsVdep.js";import{n as i,t as a}from"./theme-switcher-C1H6CYfA.js";var o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{i(),n(),o=t(),{expect:s,userEvent:c,within:l}=__STORYBOOK_MODULE_TEST__,u={title:`Theming/ThemeSwitcher`,component:a,tags:[`autodocs`],args:{className:``,triggerClassName:``,menuClassName:``},parameters:{docs:{description:{component:"Icon-button picker that toggles between light, dark, and system themes. It writes `data-theme` on `<html>`, persists to localStorage, and expects `ThemeProvider` at the app root."}}}},d={},f={render:()=>(0,o.jsxs)(`div`,{className:`flex flex-col gap-density-4`,children:[(0,o.jsx)(a,{}),(0,o.jsxs)(`div`,{className:`rounded-lg border border-border bg-card p-density-4 text-card-foreground`,children:[(0,o.jsx)(`h3`,{className:`text-lg font-semibold`,children:`Preview card`}),(0,o.jsx)(`p`,{className:`mt-density-2 text-sm text-muted-foreground`,children:"This card uses `bg-card`, `text-card-foreground`, and `border-border` — swap the theme above to see it respond."}),(0,o.jsxs)(`div`,{className:`mt-density-3 flex flex-wrap gap-density-2`,children:[(0,o.jsx)(r,{children:`Primary`}),(0,o.jsx)(r,{variant:`secondary`,children:`Secondary`}),(0,o.jsx)(r,{variant:`outline`,children:`Outline`}),(0,o.jsx)(r,{variant:`destructive`,children:`Destructive`})]})]})]})},p={play:async({canvasElement:e,step:t})=>{let n=l(e.ownerDocument.body);await t(`open menu and pick dark`,async()=>{await c.click(n.getByRole(`button`,{name:/theme/i})),await c.click(n.getByRole(`menuitemradio`,{name:/dark/i})),await s(document.documentElement.getAttribute(`data-theme`)).toBe(`dark`)}),await t(`open menu and pick light`,async()=>{await c.click(n.getByRole(`button`,{name:/theme/i})),await c.click(n.getByRole(`menuitemradio`,{name:/light/i})),await s(document.documentElement.getAttribute(`data-theme`)).toBe(`light`)})}},m={play:async({canvasElement:e,step:t})=>{let n=l(e.ownerDocument.body).getByRole(`button`,{name:/theme/i});await t(`open with Enter, navigate with arrows, select with Enter`,async()=>{n.focus(),await c.keyboard(`{Enter}`),await c.keyboard(`{ArrowDown}`),await c.keyboard(`{Enter}`);let e=document.documentElement.getAttribute(`data-theme`);await s([`light`,`dark`]).toContain(e)})}},h=[`Default`,`WithPreview`,`ChangesDataAttribute`,`KeyboardSelection`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}}})))()}g();export{p as ChangesDataAttribute,d as Default,m as KeyboardSelection,f as WithPreview,h as __namedExportsOrder,u as default};