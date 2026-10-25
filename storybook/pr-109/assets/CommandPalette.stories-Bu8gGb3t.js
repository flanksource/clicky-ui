import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{Gr as r,dc as i,hr as a,n as o,pc as s,xc as c}from"./icons-N6BqLuiz.js";import{i as l,n as u,r as d,t as f}from"./CommandPaletteTrigger-Cr-osLx-.js";function p(e){return[{id:`navigate`,heading:`Navigate`,items:[{id:`dashboard`,label:`Dashboard`,icon:i,onSelect:()=>e(`dashboard`)},{id:`widgets`,label:`Widgets`,icon:s,description:`Inventory`,onSelect:()=>e(`widgets`)},{id:`clients`,label:`Clients`,icon:a,onSelect:()=>e(`clients`)}]},{id:`actions`,heading:`Actions`,items:[{id:`new-widget`,label:`New widget`,icon:c,shortcut:`⌘N`,onSelect:()=>e(`new-widget`)},{id:`import`,label:`Import from CSV`,icon:r,keywords:[`upload`,`bulk`],onSelect:()=>e(`import`)},{id:`archive`,label:`Archive selection`,disabled:!0}]}]}function m({startOpen:e=!1}){let[t,n]=(0,h.useState)(e),[r,i]=(0,h.useState)(null);return(0,g.jsxs)(`div`,{className:`flex h-[420px] flex-col gap-density-4 p-density-4`,children:[(0,g.jsx)(`div`,{className:`w-full max-w-md`,children:(0,g.jsx)(f,{onClick:()=>n(!0),open:t})}),(0,g.jsxs)(`p`,{className:`text-sm text-muted-foreground`,children:[`Press `,(0,g.jsx)(`kbd`,{className:`rounded border border-border bg-muted px-1`,children:`⌘K`}),` anywhere, or click the field above.`]}),(0,g.jsxs)(`p`,{className:`text-sm`,"data-testid":`last-command`,children:[`Last command: `,r??`none`]}),(0,g.jsx)(d,{open:t,onOpenChange:n,groups:p(i),footer:`↑↓ navigate · ↵ run · esc close`})]})}var h,g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{h=t(),l(),u(),o(),g=n(),{expect:_,userEvent:v,within:y}=__STORYBOOK_MODULE_TEST__,b={title:`Overlay/CommandPalette`,component:d,parameters:{layout:`fullscreen`,docs:{description:{component:`A ⌘K command palette: a top-anchored overlay with a search field over a grouped, keyboard-navigable command list. Renders its own portal (Modal centres its panel and focuses the dialog rather than an input) but shares Modal's stacking primitives, so a palette opened over a modal sits above it and Escape dismisses one layer at a time. Domain-agnostic — the consumer supplies the groups.`}}}},x={args:{groups:[]},render:()=>(0,g.jsx)(m,{})},S={args:{groups:[]},render:()=>(0,g.jsx)(m,{}),play:async({step:e})=>{let t=y(document.body);await e(`⌘K opens the palette and focuses the input`,async()=>{await v.keyboard(`{Meta>}k{/Meta}`);let e=await t.findByRole(`dialog`,{name:`Command palette`});await _(e).toBeInTheDocument(),await _(t.getByRole(`combobox`)).toHaveFocus()})}},C={args:{groups:[]},render:()=>(0,g.jsx)(m,{startOpen:!0}),play:async({canvasElement:e,step:t})=>{let n=y(document.body),r=y(e),i=await n.findByRole(`combobox`);await t(`typing narrows the list and drops emptied groups`,async()=>{await v.type(i,`import`);let e=await n.findAllByRole(`option`);await _(e).toHaveLength(1),await _(n.queryByText(`Navigate`)).not.toBeInTheDocument()}),await t(`enter runs the top result and closes the palette`,async()=>{await v.keyboard(`{Enter}`),await _(r.getByTestId(`last-command`)).toHaveTextContent(`import`),await _(n.queryByRole(`dialog`,{name:`Command palette`})).not.toBeInTheDocument()})}},w={args:{groups:[]},render:()=>(0,g.jsx)(m,{startOpen:!0}),play:async({step:e})=>{let t=y(document.body),n=await t.findByRole(`combobox`),r=()=>{let e=n.getAttribute(`aria-activedescendant`);return e?document.getElementById(e)?.textContent??``:``};await e(`arrow up from the first row wraps past the disabled one`,async()=>{await _(r()).toContain(`Dashboard`),await v.keyboard(`{ArrowUp}`),await _(r()).toContain(`Import from CSV`)}),await e(`escape closes without running a command`,async()=>{await v.keyboard(`{Escape}`),await _(t.queryByRole(`dialog`,{name:`Command palette`})).not.toBeInTheDocument()})}},T={args:{groups:[]},render:()=>(0,g.jsx)(m,{}),play:async({canvasElement:e,step:t})=>{let n=y(e),r=y(document.body);await t(`clicking the trigger opens the palette`,async()=>{let e=n.getByRole(`button`,{name:/search/i});await _(e).toHaveAttribute(`aria-expanded`,`false`),await v.click(e),await _(await r.findByRole(`dialog`,{name:`Command palette`})).toBeInTheDocument()})}},E={args:{groups:[]},render:()=>(0,g.jsx)(m,{startOpen:!0}),play:async({step:e})=>{let t=y(document.body);await e(`a query matching nothing shows the empty state`,async()=>{await v.type(await t.findByRole(`combobox`),`zzzzz`),await _(t.getByText(`No results`)).toBeInTheDocument(),await _(t.queryAllByRole(`option`)).toHaveLength(0)})}},D=[`Default`,`HotkeyOpens`,`FilterAndRun`,`ArrowsWrapAndSkipDisabled`,`TriggerOpensPalette`,`EmptyState`],x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    groups: []
  },
  render: () => <Demo />
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    groups: []
  },
  render: () => <Demo />,
  play: async ({
    step
  }) => {
    // The palette portals to document.body, so scope queries there rather than
    // to the story canvas.
    const body = within(document.body);
    await step("⌘K opens the palette and focuses the input", async () => {
      await userEvent.keyboard("{Meta>}k{/Meta}");
      const dialog = await body.findByRole("dialog", {
        name: "Command palette"
      });
      await expect(dialog).toBeInTheDocument();
      await expect(body.getByRole("combobox")).toHaveFocus();
    });
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    groups: []
  },
  render: () => <Demo startOpen />,
  play: async ({
    canvasElement,
    step
  }) => {
    const body = within(document.body);
    const canvas = within(canvasElement);
    const input = await body.findByRole("combobox");
    await step("typing narrows the list and drops emptied groups", async () => {
      await userEvent.type(input, "import");
      const options = await body.findAllByRole("option");
      await expect(options).toHaveLength(1);
      await expect(body.queryByText("Navigate")).not.toBeInTheDocument();
    });
    await step("enter runs the top result and closes the palette", async () => {
      await userEvent.keyboard("{Enter}");
      await expect(canvas.getByTestId("last-command")).toHaveTextContent("import");
      await expect(body.queryByRole("dialog", {
        name: "Command palette"
      })).not.toBeInTheDocument();
    });
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    groups: []
  },
  render: () => <Demo startOpen />,
  play: async ({
    step
  }) => {
    const body = within(document.body);
    const input = await body.findByRole("combobox");
    const activeText = () => {
      const id = input.getAttribute("aria-activedescendant");
      return id ? document.getElementById(id)?.textContent ?? "" : "";
    };
    await step("arrow up from the first row wraps past the disabled one", async () => {
      await expect(activeText()).toContain("Dashboard");
      await userEvent.keyboard("{ArrowUp}");
      // "Archive selection" is disabled, so the last selectable row is Import.
      await expect(activeText()).toContain("Import from CSV");
    });
    await step("escape closes without running a command", async () => {
      await userEvent.keyboard("{Escape}");
      await expect(body.queryByRole("dialog", {
        name: "Command palette"
      })).not.toBeInTheDocument();
    });
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    groups: []
  },
  render: () => <Demo />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await step("clicking the trigger opens the palette", async () => {
      const trigger = canvas.getByRole("button", {
        name: /search/i
      });
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await userEvent.click(trigger);
      await expect(await body.findByRole("dialog", {
        name: "Command palette"
      })).toBeInTheDocument();
    });
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    groups: []
  },
  render: () => <Demo startOpen />,
  play: async ({
    step
  }) => {
    const body = within(document.body);
    await step("a query matching nothing shows the empty state", async () => {
      await userEvent.type(await body.findByRole("combobox"), "zzzzz");
      await expect(body.getByText("No results")).toBeInTheDocument();
      await expect(body.queryAllByRole("option")).toHaveLength(0);
    });
  }
}`,...E.parameters?.docs?.source}}}})))()}O();export{w as ArrowsWrapAndSkipDisabled,x as Default,E as EmptyState,C as FilterAndRun,S as HotkeyOpens,T as TriggerOpensPalette,D as __namedExportsOrder,b as default};