import{j as i,r}from"./iframe-CmyXO54k.js";import{M as R}from"./Chat.fixtures-CIS1TBJU.js";import{T as h,t as ee,e as U,w as W}from"./ToolPreferences-Bs_8lLvP.js";import"./preload-helper-CrzHa85r.js";import"./button-FnyWyL3m.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-DtL9kt7i.js";import"./DropdownMenu-DVDI-rKa.js";import"./floating-ui.react-DYdEGXOX.js";import"./index-93oggNQY.js";import"./index-CZqGiS_m.js";import"./Icon-Cn5Qjct9.js";import"./DropdownMenuSubmenu-BL4qtYMJ.js";import"./modalStack-BYsPhtu4.js";import"./zIndex-BGbNBNA8.js";import"./Modal-DYutI5j-.js";import"./effort-icons-DeE0ddnZ.js";import"./ProviderStatusPanel-C6d5EF1C.js";import"./runtime-mode-Cq6q158m.js";import"./RuntimeBar-BLL_JCeH.js";import"./SegmentedControl-D4w90S4E.js";import"./InputField-Dq9OWGRX.js";import"./use-hotkey-BG29T2Il.js";import"./types-B4ZMggem.js";import"./tokens-5o2CVjOb.js";import"./ListMenu-iFdIj5K7.js";import"./SplitPane-B3WIHzh0.js";import"./Tabs-Bo3vkTAO.js";import"./TabButton-C82soJGo.js";import"./CodeBlock-GGT34NA8.js";import"./CodeDiff-FPsEM8TE.js";import"./HighlightedTokens-RUXfQsDG.js";import"./JsonView-CeZOxYv_.js";import"./SchemaViewer-BOORMo65.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Tree-DQA2bLnF.js";import"./TreeNode-Db7H-uYm.js";const{expect:t,userEvent:s,within:c}=__STORYBOOK_MODULE_TEST__,I=[{name:"xero_accounts_list",label:"List Xero accounts",group:"Xero",preferenceKey:"Xero Read",defaultPermission:"deny",description:"List account balances from Xero.",hints:["Read-only accounting lookup.","Use a tenant id when multiple Xero connections are available."],source:"clicky",method:"GET",path:"/api/xero/accounts",strict:!0,annotations:{title:"List Xero accounts",readOnlyHint:!0,idempotentHint:!0,openWorldHint:!0},inputSchema:{type:"object",properties:{tenantId:{type:"string",description:"Connected Xero tenant id."},includeArchived:{type:"boolean",description:"Include archived accounts."}},required:["tenantId"],additionalProperties:!1},outputSchema:{type:"object",properties:{accounts:{type:"array",items:{type:"object",properties:{code:{type:"string"},name:{type:"string"},balance:{type:"number"}}}}}}},{name:"xero_contacts_list",label:"List Xero contacts",group:"Xero",preferenceKey:"Xero Read",defaultPermission:"deny",description:"List customer and supplier contacts from Xero.",source:"clicky",method:"GET",path:"/api/xero/contacts",inputSchema:{type:"object",properties:{tenantId:{type:"string"},query:{type:"string",description:"Optional contact-name search."}},required:["tenantId"]}},{name:"sync_finance",label:"Sync finance",group:"Admin Write",defaultPermission:"ask",description:"Start a financial data sync for the selected organization.",hints:["Write operation; prefer Default or Ask in shared environments."],source:"clicky",method:"POST",path:"/api/sync/finance",inputSchema:{type:"object",properties:{organizationId:{type:"string"},period:{type:"string",enum:["month","quarter","year"]},force:{type:"boolean",description:"Run even if a recent sync exists."}},required:["organizationId","period"]}},{name:"search_docs",label:"Search docs",group:"Knowledge",defaultPermission:"allow",description:"Search the internal documentation index.",hints:["Quote exact phrases for narrower results."],source:"mcp",server:"docs",inputSchema:{type:"object",properties:{query:{type:"string",description:"Search query."},limit:{type:"integer",description:"Maximum result count.",default:5}},required:["query"]}},{name:"filesystem_write",label:"Filesystem write",group:"MCP Servers",preferenceKey:"Filesystem Write",defaultPermission:"ask",description:"Write generated output to the mounted workspace.",hints:["Requires an explicit workspace path."],source:"mcp",server:"filesystem",inputSchema:{type:"object",properties:{path:{type:"string"},content:{type:"string",description:"File contents to write."}},required:["path","content"]}}],te={filesystem_write:"ask",xero_accounts_list:"deny",xero_contacts_list:"deny",search_docs:"allow",sync_finance:"ask"},ae={cost:.25,maxTokens:8e3},oe={usedTokens:14320,maxTokens:2e5,messageCount:8,modelLabel:"Claude Sonnet 4.5",cost:.0382,usage:{inputTokens:12180,outputTokens:1440,reasoningTokens:520,cacheReadTokens:9400,cacheWriteTokens:320,totalTokens:14320},costBreakdown:{model:"anthropic/claude-sonnet-4-5",inputUsd:.01218,outputUsd:.0216,reasoningUsd:.0021,cacheReadUsd:.00188,cacheWriteUsd:44e-5,totalUsd:.0382}};function y({initialValue:o=te}){var A;const[a,e]=r.useState(()=>ee(o)),n=U({tools:I,userRules:a,fallback:"ask"}),x=Z=>e($=>W($,Z)),[T,F]=r.useState((A=R[0])==null?void 0:A.id),[b,J]=r.useState("medium"),[B,z]=r.useState("default"),[f,Q]=r.useState(.4),[v,Y]=r.useState(ae);return i.jsxs("div",{className:"min-h-[34rem] w-[58rem] max-w-[calc(100vw-2rem)] bg-background p-4 text-foreground",children:[i.jsxs("div",{className:"flex items-center justify-between border-b border-border pb-3",children:[i.jsxs("div",{className:"min-w-0",children:[i.jsx("div",{className:"text-sm font-semibold",children:"Assistant"}),i.jsxs("div",{className:"truncate text-xs text-muted-foreground",children:[T??"No model"," / ",b," / ",B]})]}),i.jsx(h,{tools:I,value:n,onRule:x,models:R,model:T,onModelChange:F,reasoningEfforts:["low","medium","high"],reasoningEffort:b,onReasoningEffortChange:J,permissionMode:B,onPermissionModeChange:z,temperature:f,onTemperatureChange:Q,budget:v,onBudgetChange:Y,usage:oe})]}),i.jsxs("div",{className:"grid gap-3 pt-4 sm:grid-cols-2",children:[i.jsxs("div",{className:"rounded border border-border bg-muted/20 p-3",children:[i.jsx("div",{className:"mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground",children:"Tool permissions"}),i.jsx("pre",{className:"overflow-auto text-xs",children:JSON.stringify(n,null,2)})]}),i.jsxs("div",{className:"rounded border border-border bg-muted/20 p-3",children:[i.jsx("div",{className:"mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground",children:"Budget"}),i.jsx("pre",{className:"overflow-auto text-xs",children:JSON.stringify({budget:v,permissionMode:B,temperature:f},null,2)})]})]})]})}async function K(o){const a=c(o),e=c(document.body);await s.click(a.getByTestId("tool-preferences-btn"));const n=await e.findByRole("menu");return{body:e,menu:n}}async function w(o){const{body:a,menu:e}=await K(o);await s.click(c(e).getByRole("button",{name:"Advanced"}));const n=await a.findByRole("dialog",{name:"Advanced Chat Settings"});return{dialog:n,dialogView:c(n)}}const He={title:"AI/ToolPreferences",component:h,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"AI chat tool-preferences control with a compact grouped dropdown and an Advanced dialog for model settings, group permissions, and tool schemas."}}},argTypes:{tools:{control:!1,table:{category:"Data"}},value:{control:!1,table:{category:"State"}},onChange:{control:!1,table:{category:"Events"}},models:{control:!1,table:{category:"Model"}},model:{control:!1,table:{category:"Model"}},onModelChange:{control:!1,table:{category:"Events"}},reasoningEfforts:{control:!1,table:{category:"Model"}},reasoningEffort:{control:!1,table:{category:"Model"}},onReasoningEffortChange:{control:!1,table:{category:"Events"}},temperature:{control:!1,table:{category:"Generation"}},onTemperatureChange:{control:!1,table:{category:"Events"}},budget:{control:!1,table:{category:"Budget"}},onBudgetChange:{control:!1,table:{category:"Events"}},usage:{control:!1,table:{category:"Usage"}},toolsLoading:{control:"boolean",table:{category:"State"}},toolsError:{control:"text",table:{category:"State"}},className:{control:!1,table:{category:"Layout"}}}},l={render:()=>i.jsx(y,{}),play:async({canvasElement:o,step:a})=>{await a("opens the grouped dropdown collapsed by default",async()=>{const{menu:e}=await K(o),n=c(e);await t(n.getByText("Tool Preferences")).toBeInTheDocument(),await t(n.getByText("Admin Write")).toBeInTheDocument(),await t(n.getByText("Xero")).toBeInTheDocument(),await t(n.queryByText("List Xero accounts")).toBeNull(),await s.click(n.getByRole("button",{name:"Expand Xero"})),await t(n.getByText("List Xero accounts")).toBeInTheDocument(),await s.click(n.getByRole("button",{name:"Collapse Xero"})),await t(n.queryByText("List Xero accounts")).toBeNull()})}},d={render:()=>i.jsx(y,{}),play:async({canvasElement:o,step:a})=>{await a("opens the Advanced config tab",async()=>{const{dialogView:e}=await w(o);await t(e.getByText("Runtime")).toBeInTheDocument(),await t(e.getByText("Generation")).toBeInTheDocument(),await t(e.getByText("Budget")).toBeInTheDocument(),await t(e.getByText("Usage (last turn)")).toBeInTheDocument(),await t(e.getByText("Conversation total")).toBeInTheDocument();const n=e.getByRole("combobox",{name:"Permission mode"});await t(c(n).getByRole("option",{name:"Default"})).toBeInTheDocument(),await t(c(n).getByRole("option",{name:"Accept edits"})).toBeInTheDocument(),await t(c(n).getByRole("option",{name:"Bypass"})).toBeInTheDocument()})}},u={render:()=>i.jsx(y,{}),play:async({canvasElement:o,step:a})=>{await a("opens grouped permissions, collapsed by default",async()=>{const{dialogView:e}=await w(o);await s.click(e.getByRole("button",{name:/permissions/i})),await t(e.getByText("Admin Write")).toBeInTheDocument(),await t(e.getByText("Xero")).toBeInTheDocument(),await t(e.queryByText("List Xero accounts")).toBeNull(),await s.click(e.getByRole("button",{name:"Expand Xero"})),await t(e.getByText("List Xero accounts")).toBeInTheDocument(),await t(e.getByText("List Xero contacts")).toBeInTheDocument(),await s.click(e.getByRole("button",{name:"Collapse Xero"})),await t(e.queryByText("List Xero accounts")).toBeNull()})}},D=[{name:"accounts_get",label:"Get",group:"Accounting Read",preferenceKey:"Accounting Read",parent:"Accounts",entity:"accounts",defaultPermission:"allow",method:"GET",path:"/api/v1/accounts/{id}"},{name:"accounts_list",label:"List",group:"Accounting Read",preferenceKey:"Accounting Read",parent:"Accounts",entity:"accounts",defaultPermission:"allow",method:"GET",path:"/api/v1/accounts"},{name:"contacts_get",label:"Get",group:"Accounting Read",preferenceKey:"Accounting Read",parent:"Contacts",entity:"contacts",defaultPermission:"allow",method:"GET",path:"/api/v1/contacts/{id}"},{name:"contacts_list",label:"List",group:"Accounting Read",preferenceKey:"Accounting Read",parent:"Contacts",entity:"contacts",defaultPermission:"allow",method:"GET",path:"/api/v1/contacts"},{name:"companies_patch",label:"Patch",group:"Accounting Metadata Write",preferenceKey:"Accounting Metadata Write",parent:"Companies",entity:"companies",defaultPermission:"ask",method:"PATCH",path:"/api/v1/companies/{id}"}];function ne(){const[o,a]=r.useState([]),e=U({tools:D,userRules:o,fallback:"ask"});return i.jsxs("div",{className:"min-h-[20rem] w-[42rem] max-w-[calc(100vw-2rem)] bg-background p-4 text-foreground",children:[i.jsx("div",{className:"flex items-center justify-end border-b border-border pb-3",children:i.jsx(h,{tools:D,value:e,onRule:n=>a(x=>W(x,n))})}),i.jsx("pre",{"data-testid":"nested-rules",className:"pt-4 text-xs",children:JSON.stringify(o)})]})}function V(o){const a=c(o).getByTestId("nested-rules").textContent;return a?JSON.parse(a):[]}const p=()=>c(document.body).findByRole("dialog",{name:"Advanced Chat Settings"}),g={render:()=>i.jsx(ne,{}),play:async({canvasElement:o,step:a})=>{await a("starts collapsed; expanding reveals entity sub-headers",async()=>{const{dialogView:e}=await w(o);await s.click(e.getByRole("button",{name:/permissions/i})),await t(e.getByText("Accounting Read")).toBeInTheDocument(),await t(e.queryByText("Accounts")).toBeNull(),await s.click(e.getByRole("button",{name:"Expand Accounting Read"})),await t(e.getByText("Accounts")).toBeInTheDocument(),await t(e.getByText("Contacts")).toBeInTheDocument(),await t(e.queryByText("Get")).toBeNull()}),await a("expanding an entity disambiguates its colliding verbs",async()=>{const e=c(await p());await s.click(e.getByRole("button",{name:"Expand Accounts"})),await t(e.getAllByText("Get")).toHaveLength(1),await s.click(e.getByRole("button",{name:"Expand Contacts"})),await t(e.getAllByText("Get")).toHaveLength(2),await t(e.getAllByText("List")).toHaveLength(2)}),await a("differing member modes surface as Mixed",async()=>{const e=c(await p());await s.click(e.getByTitle("accounts_get")),t(V(o)).toEqual([{name:"accounts_get",policy:"auto"}]),await t(e.getAllByText("Mixed")).toHaveLength(2)}),await a("a parent chevron collapses only its own rows",async()=>{const e=c(await p());await s.click(e.getByRole("button",{name:"Collapse Accounts"})),await t(e.queryByTitle("accounts_get")).toBeNull(),await t(e.getByTitle("contacts_get")).toBeInTheDocument()}),await a("group rules preserve existing tool overrides",async()=>{const e=c(await p());await s.click(e.getByRole("button",{name:"Toggle Accounting Read group"})),t(V(o)).toEqual([{group:"Accounting Read",policy:"ask"},{name:"accounts_get",policy:"auto"}]),await t(e.getAllByText("Mixed")).toHaveLength(2)})}},m={render:()=>i.jsx(y,{}),play:async({canvasElement:o,step:a})=>{await a("opens schema browser with input/output schema details",async()=>{const{dialogView:e}=await w(o);await s.click(e.getByRole("button",{name:/browser/i})),await t(e.getByPlaceholderText("Search tools")).toBeInTheDocument(),await t(e.getAllByText("List Xero accounts").length).toBeGreaterThan(0),await t(e.getAllByText("xero_accounts_list").length).toBeGreaterThan(0),await t(e.getByText("Hints")).toBeInTheDocument(),await t(e.getByText("Read-only accounting lookup.")).toBeInTheDocument(),await t(e.getByText("Annotations")).toBeInTheDocument(),await t(e.getByText("readOnlyHint")).toBeInTheDocument(),await t(e.getByText("tenantId")).toBeInTheDocument(),await t(e.getByText("Connected Xero tenant id.")).toBeInTheDocument(),await t(e.getByText("Output")).toBeInTheDocument(),await s.click(e.getByRole("tab",{name:"JSON"})),await t(e.getByText("annotations")).toBeInTheDocument(),await t(e.getByText('"xero_accounts_list"')).toBeInTheDocument()})}};var E,k,S;l.parameters={...l.parameters,docs:{...(E=l.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => <ToolPreferencesStory />,
  play: async ({
    canvasElement,
    step
  }) => {
    await step("opens the grouped dropdown collapsed by default", async () => {
      const {
        menu
      } = await openPreferencesMenu(canvasElement);
      const menuView = within(menu);
      await expect(menuView.getByText("Tool Preferences")).toBeInTheDocument();
      await expect(menuView.getByText("Admin Write")).toBeInTheDocument();
      await expect(menuView.getByText("Xero")).toBeInTheDocument();
      // Groups start collapsed — tool rows are hidden until the group is expanded.
      await expect(menuView.queryByText("List Xero accounts")).toBeNull();
      await userEvent.click(menuView.getByRole("button", {
        name: "Expand Xero"
      }));
      await expect(menuView.getByText("List Xero accounts")).toBeInTheDocument();
      await userEvent.click(menuView.getByRole("button", {
        name: "Collapse Xero"
      }));
      await expect(menuView.queryByText("List Xero accounts")).toBeNull();
    });
  }
}`,...(S=(k=l.parameters)==null?void 0:k.docs)==null?void 0:S.source}}};var _,N,L;d.parameters={...d.parameters,docs:{...(_=d.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => <ToolPreferencesStory />,
  play: async ({
    canvasElement,
    step
  }) => {
    await step("opens the Advanced config tab", async () => {
      const {
        dialogView
      } = await openAdvancedDialog(canvasElement);
      await expect(dialogView.getByText("Runtime")).toBeInTheDocument();
      await expect(dialogView.getByText("Generation")).toBeInTheDocument();
      await expect(dialogView.getByText("Budget")).toBeInTheDocument();
      await expect(dialogView.getByText("Usage (last turn)")).toBeInTheDocument();
      await expect(dialogView.getByText("Conversation total")).toBeInTheDocument();
      const select = dialogView.getByRole("combobox", {
        name: "Permission mode"
      });
      await expect(within(select).getByRole("option", {
        name: "Default"
      })).toBeInTheDocument();
      await expect(within(select).getByRole("option", {
        name: "Accept edits"
      })).toBeInTheDocument();
      await expect(within(select).getByRole("option", {
        name: "Bypass"
      })).toBeInTheDocument();
    });
  }
}`,...(L=(N=d.parameters)==null?void 0:N.docs)==null?void 0:L.source}}};var P,X,C;u.parameters={...u.parameters,docs:{...(P=u.parameters)==null?void 0:P.docs,source:{originalSource:`{
  render: () => <ToolPreferencesStory />,
  play: async ({
    canvasElement,
    step
  }) => {
    await step("opens grouped permissions, collapsed by default", async () => {
      const {
        dialogView
      } = await openAdvancedDialog(canvasElement);
      await userEvent.click(dialogView.getByRole("button", {
        name: /permissions/i
      }));
      await expect(dialogView.getByText("Admin Write")).toBeInTheDocument();
      await expect(dialogView.getByText("Xero")).toBeInTheDocument();
      await expect(dialogView.queryByText("List Xero accounts")).toBeNull();
      await userEvent.click(dialogView.getByRole("button", {
        name: "Expand Xero"
      }));
      await expect(dialogView.getByText("List Xero accounts")).toBeInTheDocument();
      await expect(dialogView.getByText("List Xero contacts")).toBeInTheDocument();
      await userEvent.click(dialogView.getByRole("button", {
        name: "Collapse Xero"
      }));
      await expect(dialogView.queryByText("List Xero accounts")).toBeNull();
    });
  }
}`,...(C=(X=u.parameters)==null?void 0:X.docs)==null?void 0:C.source}}};var j,q,M;g.parameters={...g.parameters,docs:{...(j=g.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: () => <NestedToolsStory />,
  play: async ({
    canvasElement,
    step
  }) => {
    await step("starts collapsed; expanding reveals entity sub-headers", async () => {
      const {
        dialogView
      } = await openAdvancedDialog(canvasElement);
      await userEvent.click(dialogView.getByRole("button", {
        name: /permissions/i
      }));

      // Group headers show, but entity sub-headers and rows stay hidden.
      await expect(dialogView.getByText("Accounting Read")).toBeInTheDocument();
      await expect(dialogView.queryByText("Accounts")).toBeNull();
      await userEvent.click(dialogView.getByRole("button", {
        name: "Expand Accounting Read"
      }));
      // Entity sub-headers appear; their colliding verbs are still collapsed.
      await expect(dialogView.getByText("Accounts")).toBeInTheDocument();
      await expect(dialogView.getByText("Contacts")).toBeInTheDocument();
      await expect(dialogView.queryByText("Get")).toBeNull();
    });
    await step("expanding an entity disambiguates its colliding verbs", async () => {
      const dialogView = within(await dialog());
      await userEvent.click(dialogView.getByRole("button", {
        name: "Expand Accounts"
      }));
      // Only Accounts' verbs so far — Contacts stays collapsed.
      await expect(dialogView.getAllByText("Get")).toHaveLength(1);
      await userEvent.click(dialogView.getByRole("button", {
        name: "Expand Contacts"
      }));
      // The two "Get"/"List" verbs now coexist, each under its own entity.
      await expect(dialogView.getAllByText("Get")).toHaveLength(2);
      await expect(dialogView.getAllByText("List")).toHaveLength(2);
    });
    await step("differing member modes surface as Mixed", async () => {
      const dialogView = within(await dialog());
      // Flip a single Accounts tool so Accounts (and thus the group) disagree.
      await userEvent.click(dialogView.getByTitle("accounts_get"));
      expect(readNestedRules(canvasElement)).toEqual([{
        name: "accounts_get",
        policy: "auto"
      }]);
      // Mixed shows on the Accounts sub-header AND the Accounting Read group.
      await expect(dialogView.getAllByText("Mixed")).toHaveLength(2);
    });
    await step("a parent chevron collapses only its own rows", async () => {
      const dialogView = within(await dialog());
      await userEvent.click(dialogView.getByRole("button", {
        name: "Collapse Accounts"
      }));
      await expect(dialogView.queryByTitle("accounts_get")).toBeNull();
      await expect(dialogView.getByTitle("contacts_get")).toBeInTheDocument();
    });
    await step("group rules preserve existing tool overrides", async () => {
      const dialogView = within(await dialog());
      await userEvent.click(dialogView.getByRole("button", {
        name: "Toggle Accounting Read group"
      }));
      expect(readNestedRules(canvasElement)).toEqual([{
        group: "Accounting Read",
        policy: "ask"
      }, {
        name: "accounts_get",
        policy: "auto"
      }]);
      await expect(dialogView.getAllByText("Mixed")).toHaveLength(2);
    });
  }
}`,...(M=(q=g.parameters)==null?void 0:q.docs)==null?void 0:M.source}}};var G,O,H;m.parameters={...m.parameters,docs:{...(G=m.parameters)==null?void 0:G.docs,source:{originalSource:`{
  render: () => <ToolPreferencesStory />,
  play: async ({
    canvasElement,
    step
  }) => {
    await step("opens schema browser with input/output schema details", async () => {
      const {
        dialogView
      } = await openAdvancedDialog(canvasElement);
      await userEvent.click(dialogView.getByRole("button", {
        name: /browser/i
      }));
      await expect(dialogView.getByPlaceholderText("Search tools")).toBeInTheDocument();
      await expect(dialogView.getAllByText("List Xero accounts").length).toBeGreaterThan(0);
      await expect(dialogView.getAllByText("xero_accounts_list").length).toBeGreaterThan(0);
      await expect(dialogView.getByText("Hints")).toBeInTheDocument();
      await expect(dialogView.getByText("Read-only accounting lookup.")).toBeInTheDocument();
      await expect(dialogView.getByText("Annotations")).toBeInTheDocument();
      await expect(dialogView.getByText("readOnlyHint")).toBeInTheDocument();
      await expect(dialogView.getByText("tenantId")).toBeInTheDocument();
      await expect(dialogView.getByText("Connected Xero tenant id.")).toBeInTheDocument();
      await expect(dialogView.getByText("Output")).toBeInTheDocument();
      await userEvent.click(dialogView.getByRole("tab", {
        name: "JSON"
      }));
      await expect(dialogView.getByText("annotations")).toBeInTheDocument();
      await expect(dialogView.getByText('"xero_accounts_list"')).toBeInTheDocument();
    });
  }
}`,...(H=(O=m.parameters)==null?void 0:O.docs)==null?void 0:H.source}}};const Ue=["Dropdown","AdvancedConfig","AdvancedPermissions","NestedPermissions","AdvancedSchemaBrowser"];export{d as AdvancedConfig,u as AdvancedPermissions,m as AdvancedSchemaBrowser,l as Dropdown,g as NestedPermissions,Ue as __namedExportsOrder,He as default};
