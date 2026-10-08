import{j as a,r as c}from"./iframe-49i2VeV0.js";import{M as R}from"./Chat.fixtures-BPCnUBG1.js";import{T as B}from"./ToolPreferences-24pg_pOJ.js";import{t as K}from"./tool-policy-BSrhi_k5.js";import{e as U,w as W}from"./ToolSchemaBrowser-Djuq78Bl.js";import"./preload-helper-CLP1olNy.js";import"./button-BGdRDUEK.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-ivhQ-8Oz.js";import"./DropdownMenu-zKmQ3di2.js";import"./floating-ui.react-D9st_Ili.js";import"./index-BmfiYcQm.js";import"./index-COeekDrS.js";import"./Icon-CQyVAhLN.js";import"./DropdownMenuSubmenu-DjDp9DGD.js";import"./modalStack-DtPrVreh.js";import"./zIndex-BGbNBNA8.js";import"./Modal-C0PiPlai.js";import"./effort-icons-CFY19F4f.js";import"./RuntimeBar-BYimQJ_F.js";import"./duration-BuesBvhN.js";import"./Combobox-BPv-GTrS.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-CJM8CCUD.js";import"./runtime-mode-Bz7vkXBA.js";import"./InputField-BoPdo2um.js";import"./use-hotkey-CM9WEqg-.js";import"./types-DnFuV5L5.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-D066-sqT.js";import"./agent-action-icons-Cm3M82a6.js";import"./tokens-5o2CVjOb.js";import"./SplitPane-utJm4XhI.js";import"./Tabs-DqMFugCo.js";import"./TabButton-XUErfeSn.js";import"./CodeBlock-DanP_04g.js";import"./CodeDiff-BoZLkBEw.js";import"./SegmentedControl-DQyG9Uij.js";import"./HighlightedTokens-BQjA9qCL.js";import"./JsonView-CZgQJ4VW.js";import"./AccordionList-DKmKrDqZ.js";import"./collections-CoHfwOze.js";import"./Badge-DmOWNVI_.js";import"./SchemaViewer-D8dlIg_l.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Tree-BFkscNw0.js";import"./TreeNode-BGl04jkk.js";import"./IconButton-ByEpJOjF.js";import"./ListMenu-BpM9Q3TK.js";import"./HoverCard-Nv6W7Mzd.js";import"./select-488pM7Zz.js";const{expect:t,userEvent:r,within:s}=__STORYBOOK_MODULE_TEST__,A=[{name:"xero_accounts_list",label:"List Xero accounts",group:"Xero",preferenceKey:"Xero Read",defaultPermission:"deny",description:"List account balances from Xero.",hints:["Read-only accounting lookup.","Use a tenant id when multiple Xero connections are available."],source:"clicky",method:"GET",path:"/api/xero/accounts",strict:!0,annotations:{title:"List Xero accounts",readOnlyHint:!0,idempotentHint:!0,openWorldHint:!0},inputSchema:{type:"object",properties:{tenantId:{type:"string",description:"Connected Xero tenant id."},includeArchived:{type:"boolean",description:"Include archived accounts."}},required:["tenantId"],additionalProperties:!1},outputSchema:{type:"object",properties:{accounts:{type:"array",items:{type:"object",properties:{code:{type:"string"},name:{type:"string"},balance:{type:"number"}}}}}}},{name:"xero_contacts_list",label:"List Xero contacts",group:"Xero",preferenceKey:"Xero Read",defaultPermission:"deny",description:"List customer and supplier contacts from Xero.",source:"clicky",method:"GET",path:"/api/xero/contacts",inputSchema:{type:"object",properties:{tenantId:{type:"string"},query:{type:"string",description:"Optional contact-name search."}},required:["tenantId"]}},{name:"sync_finance",label:"Sync finance",group:"Admin Write",defaultPermission:"ask",description:"Start a financial data sync for the selected organization.",hints:["Write operation; prefer Default or Ask in shared environments."],source:"clicky",method:"POST",path:"/api/sync/finance",inputSchema:{type:"object",properties:{organizationId:{type:"string"},period:{type:"string",enum:["month","quarter","year"]},force:{type:"boolean",description:"Run even if a recent sync exists."}},required:["organizationId","period"]}},{name:"search_docs",label:"Search docs",group:"Knowledge",defaultPermission:"allow",description:"Search the internal documentation index.",hints:["Quote exact phrases for narrower results."],source:"mcp",server:"docs",inputSchema:{type:"object",properties:{query:{type:"string",description:"Search query."},limit:{type:"integer",description:"Maximum result count.",default:5}},required:["query"]}},{name:"filesystem_write",label:"Filesystem write",group:"MCP Servers",preferenceKey:"Filesystem Write",defaultPermission:"ask",description:"Write generated output to the mounted workspace.",hints:["Requires an explicit workspace path."],source:"mcp",server:"filesystem",inputSchema:{type:"object",properties:{path:{type:"string"},content:{type:"string",description:"File contents to write."}},required:["path","content"]}}],F={filesystem_write:"ask",xero_accounts_list:"deny",xero_contacts_list:"deny",search_docs:"allow",sync_finance:"ask"},I=K(F).length,te={cost:.25,maxTokens:8e3};function y({initialValue:n=F}){var v;const[o,e]=c.useState(()=>K(n)),i=U({tools:A,userRules:o,fallback:"ask"}),h=Z=>e(ee=>W(ee,Z)),[T,$]=c.useState((v=R[0])==null?void 0:v.id),[b,z]=c.useState("medium"),[x,Q]=c.useState("default"),[f,Y]=c.useState(te);return a.jsxs("div",{className:"min-h-[34rem] w-[58rem] max-w-[calc(100vw-2rem)] bg-background p-4 text-foreground",children:[a.jsxs("div",{className:"flex items-center justify-between border-b border-border pb-3",children:[a.jsxs("div",{className:"min-w-0",children:[a.jsx("div",{className:"text-sm font-semibold",children:"Assistant"}),a.jsxs("div",{className:"truncate text-xs text-muted-foreground",children:[T??"No model"," / ",b," / ",x]})]}),a.jsx(B,{tools:A,value:i,onRule:h,rules:o,onRulesChange:e,models:R,model:T,onModelChange:$,reasoningEfforts:["low","medium","high"],reasoningEffort:b,onReasoningEffortChange:z,permissionMode:x,onPermissionModeChange:Q,budget:f,onBudgetChange:Y})]}),a.jsxs("div",{className:"grid gap-3 pt-4 sm:grid-cols-2",children:[a.jsxs("div",{className:"rounded border border-border bg-muted/20 p-3",children:[a.jsx("div",{className:"mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground",children:"Tool permissions"}),a.jsx("pre",{className:"overflow-auto text-xs",children:JSON.stringify(i,null,2)})]}),a.jsxs("div",{className:"rounded border border-border bg-muted/20 p-3",children:[a.jsx("div",{className:"mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground",children:"Budget"}),a.jsx("pre",{className:"overflow-auto text-xs",children:JSON.stringify({budget:f,permissionMode:x},null,2)})]})]})]})}async function J(n){const o=s(n),e=s(document.body);await r.click(o.getByTestId("tool-preferences-btn"));const i=await e.findByRole("menu");return{body:e,menu:i}}async function w(n){const{body:o,menu:e}=await J(n);await r.click(s(e).getByRole("button",{name:"Advanced"}));const i=await o.findByRole("dialog",{name:"Advanced Chat Settings"});return{dialog:i,dialogView:s(i)}}const tt={title:"AI/ToolPreferences",component:B,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"AI chat tool-preferences control with a click-to-toggle tool tree and an Advanced dialog for runtime settings, costs, and a permissions browser with saved strategies."}}},argTypes:{tools:{control:!1,table:{category:"Data"}},value:{control:!1,table:{category:"State"}},onChange:{control:!1,table:{category:"Events"}},models:{control:!1,table:{category:"Model"}},model:{control:!1,table:{category:"Model"}},onModelChange:{control:!1,table:{category:"Events"}},reasoningEfforts:{control:!1,table:{category:"Model"}},reasoningEffort:{control:!1,table:{category:"Model"}},onReasoningEffortChange:{control:!1,table:{category:"Events"}},budget:{control:!1,table:{category:"Budget"}},onBudgetChange:{control:!1,table:{category:"Events"}},rules:{control:!1,table:{category:"State"}},toolsLoading:{control:"boolean",table:{category:"State"}},toolsError:{control:"text",table:{category:"State"}},className:{control:!1,table:{category:"Layout"}}}},l={render:()=>a.jsx(y,{}),play:async({canvasElement:n,step:o})=>{await o("opens the tool tree expanded",async()=>{const{menu:e}=await J(n),i=s(e);await t(i.getByText("Tool Preferences")).toBeInTheDocument(),await t(i.getByText("Admin Write")).toBeInTheDocument(),await t(i.getByText("Xero")).toBeInTheDocument(),await t(i.getByText("List Xero accounts")).toBeInTheDocument(),await r.click(i.getByRole("button",{name:"Collapse Xero"})),await t(i.queryByText("List Xero accounts")).toBeNull()})}},d={render:()=>a.jsx(y,{}),play:async({canvasElement:n,step:o})=>{await o("opens the Advanced config tab",async()=>{const{dialogView:e}=await w(n);await t(e.getByText("Runtime")).toBeInTheDocument(),await t(e.queryByText("Generation")).toBeNull(),await t(e.getByRole("group",{name:"Advanced runtime"})).toBeInTheDocument(),await t(e.queryByText("Usage (last turn)")).toBeNull(),await t(e.queryByRole("combobox",{name:"Permission mode"})).toBeNull()})}},u={render:()=>a.jsx(y,{}),play:async({canvasElement:n,step:o})=>{await o("shows the tool browser with a collapsed strategy editor",async()=>{const{dialogView:e}=await w(n);await r.click(e.getByRole("button",{name:/permissions/i})),await t(e.getByPlaceholderText("Search tools")).toBeInTheDocument(),await t(e.queryByRole("checkbox")).toBeNull();const i=e.getByRole("button",{name:/Permission strategies/});await t(i).toHaveAttribute("aria-expanded","false"),await t(e.getByLabelText(`${I} saved strategies`)).toBeInTheDocument()}),await o("a directory toggle saves one new strategy",async()=>{const e=s(await m());await r.click(e.getByRole("button",{name:"Toggle Knowledge group"})),await t(e.getByLabelText(`${I+1} saved strategies`)).toBeInTheDocument()})}},V=[{name:"accounts_get",label:"Get",group:"Accounting Read",preferenceKey:"Accounting Read",parent:"Accounts",entity:"accounts",defaultPermission:"allow",method:"GET",path:"/api/v1/accounts/{id}"},{name:"accounts_list",label:"List",group:"Accounting Read",preferenceKey:"Accounting Read",parent:"Accounts",entity:"accounts",defaultPermission:"allow",method:"GET",path:"/api/v1/accounts"},{name:"contacts_get",label:"Get",group:"Accounting Read",preferenceKey:"Accounting Read",parent:"Contacts",entity:"contacts",defaultPermission:"allow",method:"GET",path:"/api/v1/contacts/{id}"},{name:"contacts_list",label:"List",group:"Accounting Read",preferenceKey:"Accounting Read",parent:"Contacts",entity:"contacts",defaultPermission:"allow",method:"GET",path:"/api/v1/contacts"},{name:"companies_patch",label:"Patch",group:"Accounting Metadata Write",preferenceKey:"Accounting Metadata Write",parent:"Companies",entity:"companies",defaultPermission:"ask",method:"PATCH",path:"/api/v1/companies/{id}"}];function oe(){const[n,o]=c.useState([]),e=U({tools:V,userRules:n,fallback:"ask"});return a.jsxs("div",{className:"min-h-[20rem] w-[42rem] max-w-[calc(100vw-2rem)] bg-background p-4 text-foreground",children:[a.jsx("div",{className:"flex items-center justify-end border-b border-border pb-3",children:a.jsx(B,{tools:V,value:e,onRule:i=>o(h=>W(h,i))})}),a.jsx("pre",{"data-testid":"nested-rules",className:"pt-4 text-xs",children:JSON.stringify(n)})]})}function D(n){const o=s(n).getByTestId("nested-rules").textContent;return o?JSON.parse(o):[]}const m=()=>s(document.body).findByRole("dialog",{name:"Advanced Chat Settings"}),g={render:()=>a.jsx(oe,{}),play:async({canvasElement:n,step:o})=>{await o("nests colliding verbs under their entity sub-headers",async()=>{const{dialogView:e}=await w(n);await r.click(e.getByRole("button",{name:/permissions/i})),await t(e.getByRole("button",{name:"Toggle Accounting Read group"})).toBeInTheDocument(),await t(e.getByRole("button",{name:"Toggle Accounts group"})).toBeInTheDocument(),await t(e.getByRole("button",{name:"Toggle Contacts group"})).toBeInTheDocument(),await t(e.getAllByRole("button",{name:"Get"})).toHaveLength(2),await t(e.getAllByRole("button",{name:"List"})).toHaveLength(2)}),await o("differing member modes surface as Mixed",async()=>{const e=s(await m());await r.click(s(e.getByTitle("accounts_get")).getByRole("button",{name:"Toggle Get"})),t(D(n)).toEqual([{name:"accounts_get",policy:"auto"}]),await t(e.getAllByText("Mixed")).toHaveLength(2)}),await o("a parent chevron collapses only its own rows",async()=>{const e=s(await m());await r.click(e.getByRole("button",{name:"Collapse Accounts"})),await t(e.queryByTitle("accounts_get")).toBeNull(),await t(e.getByTitle("contacts_get")).toBeInTheDocument()}),await o("group rules preserve existing tool overrides",async()=>{const e=s(await m());await r.click(e.getByRole("button",{name:"Toggle Accounting Read group"})),t(D(n)).toEqual([{group:"Accounting Read",policy:"ask"},{name:"accounts_get",policy:"auto"}]),await t(e.getAllByText("Mixed")).toHaveLength(2)})}},p={render:()=>a.jsx(y,{}),play:async({canvasElement:n,step:o})=>{await o("opens schema browser with input/output schema details",async()=>{const{dialogView:e}=await w(n);await r.click(e.getByRole("button",{name:/permissions/i})),await t(e.getByPlaceholderText("Search tools")).toBeInTheDocument(),await t(e.getAllByText("List Xero accounts").length).toBeGreaterThan(0),await t(e.getAllByText("xero_accounts_list").length).toBeGreaterThan(0),await t(e.getByText("Hints")).toBeInTheDocument(),await t(e.getByText("Read-only accounting lookup.")).toBeInTheDocument(),await t(e.getByText("Annotations")).toBeInTheDocument(),await t(e.getByText("readOnlyHint")).toBeInTheDocument(),await t(e.getByText("tenantId")).toBeInTheDocument(),await t(e.getByText("Connected Xero tenant id.")).toBeInTheDocument(),await t(e.getByText("Output")).toBeInTheDocument(),await r.click(e.getByRole("tab",{name:"JSON"})),await t(e.getByText("annotations")).toBeInTheDocument(),await t(e.getByText('"xero_accounts_list"')).toBeInTheDocument()})}};var S,E,_;l.parameters={...l.parameters,docs:{...(S=l.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <ToolPreferencesStory />,
  play: async ({
    canvasElement,
    step
  }) => {
    await step("opens the tool tree expanded", async () => {
      const {
        menu
      } = await openPreferencesMenu(canvasElement);
      const menuView = within(menu);
      await expect(menuView.getByText("Tool Preferences")).toBeInTheDocument();
      // The tree nests groups under their parent surface; ungrouped parents
      // collect under General, and every level starts open.
      await expect(menuView.getByText("Admin Write")).toBeInTheDocument();
      await expect(menuView.getByText("Xero")).toBeInTheDocument();
      await expect(menuView.getByText("List Xero accounts")).toBeInTheDocument();
      await userEvent.click(menuView.getByRole("button", {
        name: "Collapse Xero"
      }));
      await expect(menuView.queryByText("List Xero accounts")).toBeNull();
    });
  }
}`,...(_=(E=l.parameters)==null?void 0:E.docs)==null?void 0:_.source}}};var N,k,P;d.parameters={...d.parameters,docs:{...(N=d.parameters)==null?void 0:N.docs,source:{originalSource:`{
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
      // Permission mode and the cost cap live in the integrated runtime bar;
      // the usage/cost panel and the Generation section are gone from Config.
      await expect(dialogView.queryByText("Generation")).toBeNull();
      await expect(dialogView.getByRole("group", {
        name: "Advanced runtime"
      })).toBeInTheDocument();
      await expect(dialogView.queryByText("Usage (last turn)")).toBeNull();
      await expect(dialogView.queryByRole("combobox", {
        name: "Permission mode"
      })).toBeNull();
    });
  }
}`,...(P=(k=d.parameters)==null?void 0:k.docs)==null?void 0:P.source}}};var L,j,C;u.parameters={...u.parameters,docs:{...(L=u.parameters)==null?void 0:L.docs,source:{originalSource:`{
  render: () => <ToolPreferencesStory />,
  play: async ({
    canvasElement,
    step
  }) => {
    await step("shows the tool browser with a collapsed strategy editor", async () => {
      const {
        dialogView
      } = await openAdvancedDialog(canvasElement);
      await userEvent.click(dialogView.getByRole("button", {
        name: /permissions/i
      }));
      await expect(dialogView.getByPlaceholderText("Search tools")).toBeInTheDocument();
      await expect(dialogView.queryByRole("checkbox")).toBeNull();
      const strategies = dialogView.getByRole("button", {
        name: /Permission strategies/
      });
      await expect(strategies).toHaveAttribute("aria-expanded", "false");
      await expect(dialogView.getByLabelText(\`\${INITIAL_RULE_COUNT} saved strategies\`)).toBeInTheDocument();
    });
    await step("a directory toggle saves one new strategy", async () => {
      const dialogView = within(await dialog());
      await userEvent.click(dialogView.getByRole("button", {
        name: "Toggle Knowledge group"
      }));
      await expect(dialogView.getByLabelText(\`\${INITIAL_RULE_COUNT + 1} saved strategies\`)).toBeInTheDocument();
    });
  }
}`,...(C=(j=u.parameters)==null?void 0:j.docs)==null?void 0:C.source}}};var M,q,O;g.parameters={...g.parameters,docs:{...(M=g.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: () => <NestedToolsStory />,
  play: async ({
    canvasElement,
    step
  }) => {
    await step("nests colliding verbs under their entity sub-headers", async () => {
      const {
        dialogView
      } = await openAdvancedDialog(canvasElement);
      await userEvent.click(dialogView.getByRole("button", {
        name: /permissions/i
      }));
      await expect(dialogView.getByRole("button", {
        name: "Toggle Accounting Read group"
      })).toBeInTheDocument();
      await expect(dialogView.getByRole("button", {
        name: "Toggle Accounts group"
      })).toBeInTheDocument();
      await expect(dialogView.getByRole("button", {
        name: "Toggle Contacts group"
      })).toBeInTheDocument();
      // The two "Get"/"List" verbs coexist, each under its own entity.
      await expect(dialogView.getAllByRole("button", {
        name: "Get"
      })).toHaveLength(2);
      await expect(dialogView.getAllByRole("button", {
        name: "List"
      })).toHaveLength(2);
    });
    await step("differing member modes surface as Mixed", async () => {
      const dialogView = within(await dialog());
      // Flip a single Accounts tool so Accounts (and thus the group) disagree.
      await userEvent.click(within(dialogView.getByTitle("accounts_get")).getByRole("button", {
        name: "Toggle Get"
      }));
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
}`,...(O=(q=g.parameters)==null?void 0:q.docs)==null?void 0:O.source}}};var X,G,H;p.parameters={...p.parameters,docs:{...(X=p.parameters)==null?void 0:X.docs,source:{originalSource:`{
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
        name: /permissions/i
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
}`,...(H=(G=p.parameters)==null?void 0:G.docs)==null?void 0:H.source}}};const ot=["Dropdown","AdvancedConfig","AdvancedPermissions","NestedPermissions","AdvancedSchemaBrowser"];export{d as AdvancedConfig,u as AdvancedPermissions,p as AdvancedSchemaBrowser,l as Dropdown,g as NestedPermissions,ot as __namedExportsOrder,tt as default};
