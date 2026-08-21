import{j as n,r as b,bb as z,aB as U,bc as _,bd as M,b as L}from"./iframe-Bfqmb9is.js";import{a as q,C as P}from"./CommandPaletteTrigger-DhEYov7j.js";import"./preload-helper-B2LPdJL4.js";import"./index-C-v_fhIh.js";import"./index-CJnhqCAt.js";import"./utils-DW-IJACk.js";import"./Icon-CIXlnKq1.js";import"./use-hotkey-fidT0h22.js";import"./modalStack-C5GZLWHZ.js";import"./zIndex-BGbNBNA8.js";const{expect:o,userEvent:i,within:c}=__STORYBOOK_MODULE_TEST__,ee={title:"Overlay/CommandPalette",component:q,parameters:{layout:"fullscreen",docs:{description:{component:"A ⌘K command palette: a top-anchored overlay with a search field over a grouped, keyboard-navigable command list. Renders its own portal (Modal centres its panel and focuses the dialog rather than an input) but shares Modal's stacking primitives, so a palette opened over a modal sits above it and Escape dismisses one layer at a time. Domain-agnostic — the consumer supplies the groups."}}}};function K(e){return[{id:"navigate",heading:"Navigate",items:[{id:"dashboard",label:"Dashboard",icon:z,onSelect:()=>e("dashboard")},{id:"widgets",label:"Widgets",icon:U,description:"Inventory",onSelect:()=>e("widgets")},{id:"clients",label:"Clients",icon:_,onSelect:()=>e("clients")}]},{id:"actions",heading:"Actions",items:[{id:"new-widget",label:"New widget",icon:M,shortcut:"⌘N",onSelect:()=>e("new-widget")},{id:"import",label:"Import from CSV",icon:L,keywords:["upload","bulk"],onSelect:()=>e("import")},{id:"archive",label:"Archive selection",disabled:!0}]}]}function d({startOpen:e=!1}){const[t,a]=b.useState(e),[r,s]=b.useState(null);return n.jsxs("div",{className:"flex h-[420px] flex-col gap-density-4 p-density-4",children:[n.jsx("div",{className:"w-full max-w-md",children:n.jsx(P,{onClick:()=>a(!0),open:t})}),n.jsxs("p",{className:"text-sm text-muted-foreground",children:["Press ",n.jsx("kbd",{className:"rounded border border-border bg-muted px-1",children:"⌘K"})," anywhere, or click the field above."]}),n.jsxs("p",{className:"text-sm","data-testid":"last-command",children:["Last command: ",r??"none"]}),n.jsx(q,{open:t,onOpenChange:a,groups:K(s),footer:"↑↓ navigate · ↵ run · esc close"})]})}const l={args:{groups:[]},render:()=>n.jsx(d,{})},m={args:{groups:[]},render:()=>n.jsx(d,{}),play:async({step:e})=>{const t=c(document.body);await e("⌘K opens the palette and focuses the input",async()=>{await i.keyboard("{Meta>}k{/Meta}");const a=await t.findByRole("dialog",{name:"Command palette"});await o(a).toBeInTheDocument(),await o(t.getByRole("combobox")).toHaveFocus()})}},u={args:{groups:[]},render:()=>n.jsx(d,{startOpen:!0}),play:async({canvasElement:e,step:t})=>{const a=c(document.body),r=c(e),s=await a.findByRole("combobox");await t("typing narrows the list and drops emptied groups",async()=>{await i.type(s,"import");const p=await a.findAllByRole("option");await o(p).toHaveLength(1),await o(a.queryByText("Navigate")).not.toBeInTheDocument()}),await t("enter runs the top result and closes the palette",async()=>{await i.keyboard("{Enter}"),await o(r.getByTestId("last-command")).toHaveTextContent("import"),await o(a.queryByRole("dialog",{name:"Command palette"})).not.toBeInTheDocument()})}},y={args:{groups:[]},render:()=>n.jsx(d,{startOpen:!0}),play:async({step:e})=>{const t=c(document.body),a=await t.findByRole("combobox"),r=()=>{var p;const s=a.getAttribute("aria-activedescendant");return s?((p=document.getElementById(s))==null?void 0:p.textContent)??"":""};await e("arrow up from the first row wraps past the disabled one",async()=>{await o(r()).toContain("Dashboard"),await i.keyboard("{ArrowUp}"),await o(r()).toContain("Import from CSV")}),await e("escape closes without running a command",async()=>{await i.keyboard("{Escape}"),await o(t.queryByRole("dialog",{name:"Command palette"})).not.toBeInTheDocument()})}},g={args:{groups:[]},render:()=>n.jsx(d,{}),play:async({canvasElement:e,step:t})=>{const a=c(e),r=c(document.body);await t("clicking the trigger opens the palette",async()=>{const s=a.getByRole("button",{name:/search/i});await o(s).toHaveAttribute("aria-expanded","false"),await i.click(s),await o(await r.findByRole("dialog",{name:"Command palette"})).toBeInTheDocument()})}},w={args:{groups:[]},render:()=>n.jsx(d,{startOpen:!0}),play:async({step:e})=>{const t=c(document.body);await e("a query matching nothing shows the empty state",async()=>{await i.type(await t.findByRole("combobox"),"zzzzz"),await o(t.getByText("No results")).toBeInTheDocument(),await o(t.queryAllByRole("option")).toHaveLength(0)})}};var h,x,v;l.parameters={...l.parameters,docs:{...(h=l.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    groups: []
  },
  render: () => <Demo />
}`,...(v=(x=l.parameters)==null?void 0:x.docs)==null?void 0:v.source}}};var B,f,T;m.parameters={...m.parameters,docs:{...(B=m.parameters)==null?void 0:B.docs,source:{originalSource:`{
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
}`,...(T=(f=m.parameters)==null?void 0:f.docs)==null?void 0:T.source}}};var D,C,E;u.parameters={...u.parameters,docs:{...(D=u.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(E=(C=u.parameters)==null?void 0:C.docs)==null?void 0:E.source}}};var k,R,S;y.parameters={...y.parameters,docs:{...(k=y.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(S=(R=y.parameters)==null?void 0:R.docs)==null?void 0:S.source}}};var I,A,O;g.parameters={...g.parameters,docs:{...(I=g.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(O=(A=g.parameters)==null?void 0:A.docs)==null?void 0:O.source}}};var j,H,N;w.parameters={...w.parameters,docs:{...(j=w.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...(N=(H=w.parameters)==null?void 0:H.docs)==null?void 0:N.source}}};const te=["Default","HotkeyOpens","FilterAndRun","ArrowsWrapAndSkipDisabled","TriggerOpensPalette","EmptyState"];export{y as ArrowsWrapAndSkipDisabled,l as Default,w as EmptyState,u as FilterAndRun,m as HotkeyOpens,g as TriggerOpensPalette,te as __namedExportsOrder,ee as default};
