import{j as i,r}from"./iframe-BQHWjYXO.js";import{M as v}from"./Chat.fixtures-BmVP6U6L.js";import{T as x}from"./ToolPreferences-fLqhv0Cm.js";import"./preload-helper-NECxGHhd.js";import"./utils-CR52uffu.js";import"./DropdownMenu-BbjZol6M.js";import"./floating-ui.react-68_lqgwR.js";import"./index-DfkcjULU.js";import"./index-DK2AMwkg.js";import"./button-CAHLihQQ.js";import"./index-0zBpNI7D.js";import"./loading-CVssmfQF.js";import"./Icon-DqVmIZAK.js";import"./DropdownMenuSubmenu-CySj_Ja0.js";import"./modalStack-BV2RLcYb.js";import"./zIndex-CigQ76av.js";import"./Modal-D2ePUGYK.js";import"./ModelSelector-BW4o6-PA.js";import"./Combobox-Gm9lQ51G.js";import"./FilterPill-Ba81rHjB.js";import"./json-schema-form-size-DYVq0lph.js";import"./SegmentedControl-DKiFPaCK.js";import"./effort-icons-BKyQYvyc.js";import"./ListMenu-D-_L18hH.js";import"./SplitPane-CyJNTi9Q.js";import"./Tabs-CUHNZggb.js";import"./TabButton-BMz7tjoi.js";import"./CodeBlock-DPyDzznt.js";import"./CodeDiff-CVr8sbI2.js";import"./code-highlight-Btxs0MAv.js";import"./JsonView-BsfgZLD9.js";import"./SchemaViewer-Bp94_m8G.js";import"./json-schema-form-refs-Cqzc3R43.js";import"./Tree-CAK6FhXI.js";import"./TreeNode-B5TpxXc9.js";import"./types-B1SOX9si.js";const{expect:t,userEvent:s,within:c}=__STORYBOOK_MODULE_TEST__,K=[{name:"xero_accounts_list",label:"List Xero accounts",group:"Xero",preferenceKey:"Xero Read",defaultPermission:"off",description:"List account balances from Xero.",hints:["Read-only accounting lookup.","Use a tenant id when multiple Xero connections are available."],source:"clicky",method:"GET",path:"/api/xero/accounts",strict:!0,annotations:{title:"List Xero accounts",readOnlyHint:!0,idempotentHint:!0,openWorldHint:!0},inputSchema:{type:"object",properties:{tenantId:{type:"string",description:"Connected Xero tenant id."},includeArchived:{type:"boolean",description:"Include archived accounts."}},required:["tenantId"],additionalProperties:!1},outputSchema:{type:"object",properties:{accounts:{type:"array",items:{type:"object",properties:{code:{type:"string"},name:{type:"string"},balance:{type:"number"}}}}}}},{name:"xero_contacts_list",label:"List Xero contacts",group:"Xero",preferenceKey:"Xero Read",defaultPermission:"off",description:"List customer and supplier contacts from Xero.",source:"clicky",method:"GET",path:"/api/xero/contacts",inputSchema:{type:"object",properties:{tenantId:{type:"string"},query:{type:"string",description:"Optional contact-name search."}},required:["tenantId"]}},{name:"sync_finance",label:"Sync finance",group:"Admin Write",defaultPermission:"ask",description:"Start a financial data sync for the selected organization.",hints:["Write operation; prefer Default or Ask in shared environments."],source:"clicky",method:"POST",path:"/api/sync/finance",inputSchema:{type:"object",properties:{organizationId:{type:"string"},period:{type:"string",enum:["month","quarter","year"]},force:{type:"boolean",description:"Run even if a recent sync exists."}},required:["organizationId","period"]}},{name:"search_docs",label:"Search docs",group:"Knowledge",defaultPermission:"on",description:"Search the internal documentation index.",hints:["Quote exact phrases for narrower results."],source:"mcp",server:"docs",inputSchema:{type:"object",properties:{query:{type:"string",description:"Search query."},limit:{type:"integer",description:"Maximum result count.",default:5}},required:["query"]}},{name:"filesystem_write",label:"Filesystem write",group:"MCP Servers",preferenceKey:"Filesystem Write",defaultPermission:"ask",description:"Write generated output to the mounted workspace.",hints:["Requires an explicit workspace path."],source:"mcp",server:"filesystem",inputSchema:{type:"object",properties:{path:{type:"string"},content:{type:"string",description:"File contents to write."}},required:["path","content"]}}],J={filesystem_write:"ask",xero_accounts_list:"off",xero_contacts_list:"off",search_docs:"on",sync_finance:"ask"},F={cost:.25,maxTokens:8e3},z={usedTokens:14320,maxTokens:2e5,messageCount:8,modelLabel:"Claude Sonnet 4.5",cost:.0382,usage:{inputTokens:12180,outputTokens:1440,reasoningTokens:520,cacheReadTokens:9400,cacheWriteTokens:320,totalTokens:14320},costBreakdown:{model:"anthropic/claude-sonnet-4-5",inputUsd:.01218,outputUsd:.0216,reasoningUsd:.0021,cacheReadUsd:.00188,cacheWriteUsd:44e-5,totalUsd:.0382}};function y({initialValue:n=J}){var b;const[a,e]=r.useState(n),[o,q]=r.useState((b=v[0])==null?void 0:b.id),[h,O]=r.useState("medium"),[B,U]=r.useState("default"),[T,H]=r.useState(.4),[f,W]=r.useState(F);return i.jsxs("div",{className:"min-h-[34rem] w-[58rem] max-w-[calc(100vw-2rem)] bg-background p-4 text-foreground",children:[i.jsxs("div",{className:"flex items-center justify-between border-b border-border pb-3",children:[i.jsxs("div",{className:"min-w-0",children:[i.jsx("div",{className:"text-sm font-semibold",children:"Assistant"}),i.jsxs("div",{className:"truncate text-xs text-muted-foreground",children:[o??"No model"," / ",h," / ",B]})]}),i.jsx(x,{tools:K,value:a,onChange:e,models:v,model:o,onModelChange:q,reasoningEfforts:["low","medium","high"],reasoningEffort:h,onReasoningEffortChange:O,permissionMode:B,onPermissionModeChange:U,temperature:T,onTemperatureChange:H,budget:f,onBudgetChange:W,usage:z})]}),i.jsxs("div",{className:"grid gap-3 pt-4 sm:grid-cols-2",children:[i.jsxs("div",{className:"rounded border border-border bg-muted/20 p-3",children:[i.jsx("div",{className:"mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground",children:"Tool permissions"}),i.jsx("pre",{className:"overflow-auto text-xs",children:JSON.stringify(a,null,2)})]}),i.jsxs("div",{className:"rounded border border-border bg-muted/20 p-3",children:[i.jsx("div",{className:"mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground",children:"Budget"}),i.jsx("pre",{className:"overflow-auto text-xs",children:JSON.stringify({budget:f,permissionMode:B,temperature:T},null,2)})]})]})]})}async function G(n){const a=c(n),e=c(document.body);await s.click(a.getByTestId("tool-preferences-btn"));const o=await e.findByRole("menu");return{body:e,menu:o}}async function w(n){const{body:a,menu:e}=await G(n);await s.click(c(e).getByRole("button",{name:"Advanced"}));const o=await a.findByRole("dialog",{name:"Advanced Chat Settings"});return{dialog:o,dialogView:c(o)}}const Le={title:"AI/ToolPreferences",component:x,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"AI chat tool-preferences control with a compact grouped dropdown and an Advanced dialog for model settings, group permissions, and tool schemas."}}},argTypes:{tools:{control:!1,table:{category:"Data"}},value:{control:!1,table:{category:"State"}},onChange:{control:!1,table:{category:"Events"}},models:{control:!1,table:{category:"Model"}},model:{control:!1,table:{category:"Model"}},onModelChange:{control:!1,table:{category:"Events"}},reasoningEfforts:{control:!1,table:{category:"Model"}},reasoningEffort:{control:!1,table:{category:"Model"}},onReasoningEffortChange:{control:!1,table:{category:"Events"}},temperature:{control:!1,table:{category:"Generation"}},onTemperatureChange:{control:!1,table:{category:"Events"}},budget:{control:!1,table:{category:"Budget"}},onBudgetChange:{control:!1,table:{category:"Events"}},usage:{control:!1,table:{category:"Usage"}},toolsLoading:{control:"boolean",table:{category:"State"}},toolsError:{control:"text",table:{category:"State"}},className:{control:!1,table:{category:"Layout"}}}},l={render:()=>i.jsx(y,{}),play:async({canvasElement:n,step:a})=>{await a("opens the grouped dropdown collapsed by default",async()=>{const{menu:e}=await G(n),o=c(e);await t(o.getByText("Tool Preferences")).toBeInTheDocument(),await t(o.getByText("Admin Write")).toBeInTheDocument(),await t(o.getByText("Xero")).toBeInTheDocument(),await t(o.queryByText("List Xero accounts")).toBeNull(),await s.click(o.getByRole("button",{name:"Expand Xero"})),await t(o.getByText("List Xero accounts")).toBeInTheDocument(),await s.click(o.getByRole("button",{name:"Collapse Xero"})),await t(o.queryByText("List Xero accounts")).toBeNull()})}},d={render:()=>i.jsx(y,{}),play:async({canvasElement:n,step:a})=>{await a("opens the Advanced config tab",async()=>{const{dialogView:e}=await w(n);await t(e.getByText("Model")).toBeInTheDocument(),await t(e.getByText("Generation")).toBeInTheDocument(),await t(e.getByText("Budget")).toBeInTheDocument(),await t(e.getByText("Usage")).toBeInTheDocument(),await t(e.getByText("Thread total")).toBeInTheDocument();const o=e.getByRole("combobox",{name:"Permission mode"});await t(c(o).getByRole("option",{name:"Default"})).toBeInTheDocument(),await t(c(o).getByRole("option",{name:"Accept edits"})).toBeInTheDocument(),await t(c(o).getByRole("option",{name:"Bypass"})).toBeInTheDocument()})}},u={render:()=>i.jsx(y,{}),play:async({canvasElement:n,step:a})=>{await a("opens grouped permissions, collapsed by default",async()=>{const{dialogView:e}=await w(n);await s.click(e.getByRole("button",{name:/permissions/i})),await t(e.getByText("Admin Write")).toBeInTheDocument(),await t(e.getByText("Xero")).toBeInTheDocument(),await t(e.queryByText("List Xero accounts")).toBeNull(),await s.click(e.getByRole("button",{name:"Expand Xero"})),await t(e.getByText("List Xero accounts")).toBeInTheDocument(),await t(e.getByText("List Xero contacts")).toBeInTheDocument(),await s.click(e.getByRole("button",{name:"Collapse Xero"})),await t(e.queryByText("List Xero accounts")).toBeNull()})}},Q=[{name:"accounts_get",label:"Get",group:"Accounting Read",preferenceKey:"Accounting Read",parent:"Accounts",entity:"accounts",defaultPermission:"on",method:"GET",path:"/api/v1/accounts/{id}"},{name:"accounts_list",label:"List",group:"Accounting Read",preferenceKey:"Accounting Read",parent:"Accounts",entity:"accounts",defaultPermission:"on",method:"GET",path:"/api/v1/accounts"},{name:"contacts_get",label:"Get",group:"Accounting Read",preferenceKey:"Accounting Read",parent:"Contacts",entity:"contacts",defaultPermission:"on",method:"GET",path:"/api/v1/contacts/{id}"},{name:"contacts_list",label:"List",group:"Accounting Read",preferenceKey:"Accounting Read",parent:"Contacts",entity:"contacts",defaultPermission:"on",method:"GET",path:"/api/v1/contacts"},{name:"companies_patch",label:"Patch",group:"Accounting Metadata Write",preferenceKey:"Accounting Metadata Write",parent:"Companies",entity:"companies",defaultPermission:"ask",method:"PATCH",path:"/api/v1/companies/{id}"}];function Y(){const[n,a]=r.useState({});return i.jsxs("div",{className:"min-h-[20rem] w-[42rem] max-w-[calc(100vw-2rem)] bg-background p-4 text-foreground",children:[i.jsx("div",{className:"flex items-center justify-end border-b border-border pb-3",children:i.jsx(x,{tools:Q,value:n,onChange:a})}),i.jsx("pre",{"data-testid":"nested-prefs",className:"pt-4 text-xs",children:JSON.stringify(n)})]})}function A(n){const a=c(n).getByTestId("nested-prefs").textContent;return a?JSON.parse(a):{}}const p=()=>c(document.body).findByRole("dialog",{name:"Advanced Chat Settings"}),g={render:()=>i.jsx(Y,{}),play:async({canvasElement:n,step:a})=>{await a("starts collapsed; expanding reveals entity sub-headers",async()=>{const{dialogView:e}=await w(n);await s.click(e.getByRole("button",{name:/permissions/i})),await t(e.getByText("Accounting Read")).toBeInTheDocument(),await t(e.queryByText("Accounts")).toBeNull(),await s.click(e.getByRole("button",{name:"Expand Accounting Read"})),await t(e.getByText("Accounts")).toBeInTheDocument(),await t(e.getByText("Contacts")).toBeInTheDocument(),await t(e.queryByText("Get")).toBeNull()}),await a("expanding an entity disambiguates its colliding verbs",async()=>{const e=c(await p());await s.click(e.getByRole("button",{name:"Expand Accounts"})),await t(e.getAllByText("Get")).toHaveLength(1),await s.click(e.getByRole("button",{name:"Expand Contacts"})),await t(e.getAllByText("Get")).toHaveLength(2),await t(e.getAllByText("List")).toHaveLength(2)}),await a("differing member modes surface as Mixed",async()=>{const e=c(await p());await s.click(e.getByTitle("accounts_get"));const o=A(n);t(o.accounts_get).toBe("auto"),t(o.accounts_list).toBeUndefined(),t(o.contacts_get).toBeUndefined(),await t(e.getAllByText("Mixed")).toHaveLength(2)}),await a("a parent chevron collapses only its own rows",async()=>{const e=c(await p());await s.click(e.getByRole("button",{name:"Collapse Accounts"})),await t(e.queryByTitle("accounts_get")).toBeNull(),await t(e.getByTitle("contacts_get")).toBeInTheDocument()}),await a("group header cycles every tool in the tier",async()=>{const e=c(await p());await s.click(e.getByRole("button",{name:"Toggle Accounting Read group"}));const o=A(n);t(o.accounts_get).toBe("ask"),t(o.accounts_list).toBe("ask"),t(o.contacts_get).toBe("ask"),t(o.contacts_list).toBe("ask")})}},m={render:()=>i.jsx(y,{}),play:async({canvasElement:n,step:a})=>{await a("opens schema browser with input/output schema details",async()=>{const{dialogView:e}=await w(n);await s.click(e.getByRole("button",{name:/browser/i})),await t(e.getByPlaceholderText("Search tools")).toBeInTheDocument(),await t(e.getAllByText("List Xero accounts").length).toBeGreaterThan(0),await t(e.getAllByText("xero_accounts_list").length).toBeGreaterThan(0),await t(e.getByText("Hints")).toBeInTheDocument(),await t(e.getByText("Read-only accounting lookup.")).toBeInTheDocument(),await t(e.getByText("Annotations")).toBeInTheDocument(),await t(e.getByText("readOnlyHint")).toBeInTheDocument(),await t(e.getByText("tenantId")).toBeInTheDocument(),await t(e.getByText("Connected Xero tenant id.")).toBeInTheDocument(),await t(e.getByText("Output")).toBeInTheDocument(),await s.click(e.getByRole("tab",{name:"JSON"})),await t(e.getByText("annotations")).toBeInTheDocument(),await t(e.getByText('"xero_accounts_list"')).toBeInTheDocument()})}};var I,D,V;l.parameters={...l.parameters,docs:{...(I=l.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(V=(D=l.parameters)==null?void 0:D.docs)==null?void 0:V.source}}};var E,R,k;d.parameters={...d.parameters,docs:{...(E=d.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => <ToolPreferencesStory />,
  play: async ({
    canvasElement,
    step
  }) => {
    await step("opens the Advanced config tab", async () => {
      const {
        dialogView
      } = await openAdvancedDialog(canvasElement);
      await expect(dialogView.getByText("Model")).toBeInTheDocument();
      await expect(dialogView.getByText("Generation")).toBeInTheDocument();
      await expect(dialogView.getByText("Budget")).toBeInTheDocument();
      await expect(dialogView.getByText("Usage")).toBeInTheDocument();
      await expect(dialogView.getByText("Thread total")).toBeInTheDocument();
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
}`,...(k=(R=d.parameters)==null?void 0:R.docs)==null?void 0:k.source}}};var _,S,N;u.parameters={...u.parameters,docs:{...(_=u.parameters)==null?void 0:_.docs,source:{originalSource:`{
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
}`,...(N=(S=u.parameters)==null?void 0:S.docs)==null?void 0:N.source}}};var L,P,X;g.parameters={...g.parameters,docs:{...(L=g.parameters)==null?void 0:L.docs,source:{originalSource:`{
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
      const prefs = readNestedPrefs(canvasElement);
      expect(prefs.accounts_get).toBe("auto");
      expect(prefs.accounts_list).toBeUndefined();
      expect(prefs.contacts_get).toBeUndefined();
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
    await step("group header cycles every tool in the tier", async () => {
      const dialogView = within(await dialog());
      await userEvent.click(dialogView.getByRole("button", {
        name: "Toggle Accounting Read group"
      }));
      const prefs = readNestedPrefs(canvasElement);
      // Most-restrictive member ("auto") advances to "ask" for all four tools.
      expect(prefs.accounts_get).toBe("ask");
      expect(prefs.accounts_list).toBe("ask");
      expect(prefs.contacts_get).toBe("ask");
      expect(prefs.contacts_list).toBe("ask");
    });
  }
}`,...(X=(P=g.parameters)==null?void 0:P.docs)==null?void 0:X.source}}};var C,j,M;m.parameters={...m.parameters,docs:{...(C=m.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(M=(j=m.parameters)==null?void 0:j.docs)==null?void 0:M.source}}};const Pe=["Dropdown","AdvancedConfig","AdvancedPermissions","NestedPermissions","AdvancedSchemaBrowser"];export{d as AdvancedConfig,u as AdvancedPermissions,m as AdvancedSchemaBrowser,l as Dropdown,g as NestedPermissions,Pe as __namedExportsOrder,Le as default};
