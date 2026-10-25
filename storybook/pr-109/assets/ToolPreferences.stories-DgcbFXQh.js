import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{r,s as i}from"./tool-policy-CAN7D1iS.js";import{n as a,t as o}from"./ToolPreferences-DQWmlo8a.js";import{d as s,l as c,u as l}from"./ToolSchemaBrowser-CEAhzNVj.js";import{r as u,t as d}from"./Chat.fixtures-Dz7Ke9Ag.js";function f({initialValue:e=C}){let[t,n]=(0,_.useState)(()=>i(e)),r=c({tools:S,userRules:t,fallback:`ask`}),a=e=>n(t=>s(t,e)),[l,u]=(0,_.useState)(d[0]?.id),[f,p]=(0,_.useState)(`medium`),[m,h]=(0,_.useState)(`default`),[g,y]=(0,_.useState)(T);return(0,v.jsxs)(`div`,{className:`min-h-[34rem] w-[58rem] max-w-[calc(100vw-2rem)] bg-background p-4 text-foreground`,children:[(0,v.jsxs)(`div`,{className:`flex items-center justify-between border-b border-border pb-3`,children:[(0,v.jsxs)(`div`,{className:`min-w-0`,children:[(0,v.jsx)(`div`,{className:`text-sm font-semibold`,children:`Assistant`}),(0,v.jsxs)(`div`,{className:`truncate text-xs text-muted-foreground`,children:[l??`No model`,` / `,f,` / `,m]})]}),(0,v.jsx)(o,{tools:S,value:r,onRule:a,rules:t,onRulesChange:n,models:d,model:l,onModelChange:u,reasoningEfforts:[`low`,`medium`,`high`],reasoningEffort:f,onReasoningEffortChange:p,permissionMode:m,onPermissionModeChange:h,budget:g,onBudgetChange:y})]}),(0,v.jsxs)(`div`,{className:`grid gap-3 pt-4 sm:grid-cols-2`,children:[(0,v.jsxs)(`div`,{className:`rounded border border-border bg-muted/20 p-3`,children:[(0,v.jsx)(`div`,{className:`mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground`,children:`Tool permissions`}),(0,v.jsx)(`pre`,{className:`overflow-auto text-xs`,children:JSON.stringify(r,null,2)})]}),(0,v.jsxs)(`div`,{className:`rounded border border-border bg-muted/20 p-3`,children:[(0,v.jsx)(`div`,{className:`mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground`,children:`Budget`}),(0,v.jsx)(`pre`,{className:`overflow-auto text-xs`,children:JSON.stringify({budget:g,permissionMode:m},null,2)})]})]})]})}async function p(e){let t=x(e),n=x(document.body);return await b.click(t.getByTestId(`tool-preferences-btn`)),{body:n,menu:await n.findByRole(`menu`)}}async function m(e){let{body:t,menu:n}=await p(e);await b.click(x(n).getByRole(`button`,{name:`Advanced`}));let r=await t.findByRole(`dialog`,{name:`Advanced Chat Settings`});return{dialog:r,dialogView:x(r)}}function h(){let[e,t]=(0,_.useState)([]),n=c({tools:A,userRules:e,fallback:`ask`});return(0,v.jsxs)(`div`,{className:`min-h-[20rem] w-[42rem] max-w-[calc(100vw-2rem)] bg-background p-4 text-foreground`,children:[(0,v.jsx)(`div`,{className:`flex items-center justify-end border-b border-border pb-3`,children:(0,v.jsx)(o,{tools:A,value:n,onRule:e=>t(t=>s(t,e))})}),(0,v.jsx)(`pre`,{"data-testid":`nested-rules`,className:`pt-4 text-xs`,children:JSON.stringify(e)})]})}function g(e){let t=x(e).getByTestId(`nested-rules`).textContent;return t?JSON.parse(t):[]}var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P;function F(){return(F=e((()=>{_=t(),u(),a(),r(),l(),v=n(),{expect:y,userEvent:b,within:x}=__STORYBOOK_MODULE_TEST__,S=[{name:`xero_accounts_list`,label:`List Xero accounts`,group:`Xero`,preferenceKey:`Xero Read`,defaultPermission:`deny`,description:`List account balances from Xero.`,hints:[`Read-only accounting lookup.`,`Use a tenant id when multiple Xero connections are available.`],source:`clicky`,method:`GET`,path:`/api/xero/accounts`,strict:!0,annotations:{title:`List Xero accounts`,readOnlyHint:!0,idempotentHint:!0,openWorldHint:!0},inputSchema:{type:`object`,properties:{tenantId:{type:`string`,description:`Connected Xero tenant id.`},includeArchived:{type:`boolean`,description:`Include archived accounts.`}},required:[`tenantId`],additionalProperties:!1},outputSchema:{type:`object`,properties:{accounts:{type:`array`,items:{type:`object`,properties:{code:{type:`string`},name:{type:`string`},balance:{type:`number`}}}}}}},{name:`xero_contacts_list`,label:`List Xero contacts`,group:`Xero`,preferenceKey:`Xero Read`,defaultPermission:`deny`,description:`List customer and supplier contacts from Xero.`,source:`clicky`,method:`GET`,path:`/api/xero/contacts`,inputSchema:{type:`object`,properties:{tenantId:{type:`string`},query:{type:`string`,description:`Optional contact-name search.`}},required:[`tenantId`]}},{name:`sync_finance`,label:`Sync finance`,group:`Admin Write`,defaultPermission:`ask`,description:`Start a financial data sync for the selected organization.`,hints:[`Write operation; prefer Default or Ask in shared environments.`],source:`clicky`,method:`POST`,path:`/api/sync/finance`,inputSchema:{type:`object`,properties:{organizationId:{type:`string`},period:{type:`string`,enum:[`month`,`quarter`,`year`]},force:{type:`boolean`,description:`Run even if a recent sync exists.`}},required:[`organizationId`,`period`]}},{name:`search_docs`,label:`Search docs`,group:`Knowledge`,defaultPermission:`allow`,description:`Search the internal documentation index.`,hints:[`Quote exact phrases for narrower results.`],source:`mcp`,server:`docs`,inputSchema:{type:`object`,properties:{query:{type:`string`,description:`Search query.`},limit:{type:`integer`,description:`Maximum result count.`,default:5}},required:[`query`]}},{name:`filesystem_write`,label:`Filesystem write`,group:`MCP Servers`,preferenceKey:`Filesystem Write`,defaultPermission:`ask`,description:`Write generated output to the mounted workspace.`,hints:[`Requires an explicit workspace path.`],source:`mcp`,server:`filesystem`,inputSchema:{type:`object`,properties:{path:{type:`string`},content:{type:`string`,description:`File contents to write.`}},required:[`path`,`content`]}}],C={filesystem_write:`ask`,xero_accounts_list:`deny`,xero_contacts_list:`deny`,search_docs:`allow`,sync_finance:`ask`},w=i(C).length,T={cost:.25,maxTokens:8e3},E={title:`AI/ToolPreferences`,component:o,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`AI chat tool-preferences control with a click-to-toggle tool tree and an Advanced dialog for runtime settings, costs, and a permissions browser with saved strategies.`}}},argTypes:{tools:{control:!1,table:{category:`Data`}},value:{control:!1,table:{category:`State`}},onChange:{control:!1,table:{category:`Events`}},models:{control:!1,table:{category:`Model`}},model:{control:!1,table:{category:`Model`}},onModelChange:{control:!1,table:{category:`Events`}},reasoningEfforts:{control:!1,table:{category:`Model`}},reasoningEffort:{control:!1,table:{category:`Model`}},onReasoningEffortChange:{control:!1,table:{category:`Events`}},budget:{control:!1,table:{category:`Budget`}},onBudgetChange:{control:!1,table:{category:`Events`}},rules:{control:!1,table:{category:`State`}},toolsLoading:{control:`boolean`,table:{category:`State`}},toolsError:{control:`text`,table:{category:`State`}},className:{control:!1,table:{category:`Layout`}}}},D={render:()=>(0,v.jsx)(f,{}),play:async({canvasElement:e,step:t})=>{await t(`opens the tool tree expanded`,async()=>{let{menu:t}=await p(e),n=x(t);await y(n.getByText(`Tool Preferences`)).toBeInTheDocument(),await y(n.getByText(`Admin Write`)).toBeInTheDocument(),await y(n.getByText(`Xero`)).toBeInTheDocument(),await y(n.getByText(`List Xero accounts`)).toBeInTheDocument(),await b.click(n.getByRole(`button`,{name:`Collapse Xero`})),await y(n.queryByText(`List Xero accounts`)).toBeNull()})}},O={render:()=>(0,v.jsx)(f,{}),play:async({canvasElement:e,step:t})=>{await t(`opens the Advanced config tab`,async()=>{let{dialogView:t}=await m(e);await y(t.getByText(`Runtime`)).toBeInTheDocument(),await y(t.queryByText(`Generation`)).toBeNull(),await y(t.getByRole(`group`,{name:`Advanced runtime`})).toBeInTheDocument(),await y(t.queryByText(`Usage (last turn)`)).toBeNull(),await y(t.queryByRole(`combobox`,{name:`Permission mode`})).toBeNull()})}},k={render:()=>(0,v.jsx)(f,{}),play:async({canvasElement:e,step:t})=>{await t(`shows the tool browser with a collapsed strategy editor`,async()=>{let{dialogView:t}=await m(e);await b.click(t.getByRole(`button`,{name:/permissions/i})),await y(t.getByPlaceholderText(`Search tools`)).toBeInTheDocument(),await y(t.queryByRole(`checkbox`)).toBeNull();let n=t.getByRole(`button`,{name:/Permission strategies/});await y(n).toHaveAttribute(`aria-expanded`,`false`),await y(t.getByLabelText(`${w} saved strategies`)).toBeInTheDocument()}),await t(`a directory toggle saves one new strategy`,async()=>{let e=x(await j());await b.click(e.getByRole(`button`,{name:`Toggle Knowledge group`})),await y(e.getByLabelText(`${w+1} saved strategies`)).toBeInTheDocument()})}},A=[{name:`accounts_get`,label:`Get`,group:`Accounting Read`,preferenceKey:`Accounting Read`,parent:`Accounts`,entity:`accounts`,defaultPermission:`allow`,method:`GET`,path:`/api/v1/accounts/{id}`},{name:`accounts_list`,label:`List`,group:`Accounting Read`,preferenceKey:`Accounting Read`,parent:`Accounts`,entity:`accounts`,defaultPermission:`allow`,method:`GET`,path:`/api/v1/accounts`},{name:`contacts_get`,label:`Get`,group:`Accounting Read`,preferenceKey:`Accounting Read`,parent:`Contacts`,entity:`contacts`,defaultPermission:`allow`,method:`GET`,path:`/api/v1/contacts/{id}`},{name:`contacts_list`,label:`List`,group:`Accounting Read`,preferenceKey:`Accounting Read`,parent:`Contacts`,entity:`contacts`,defaultPermission:`allow`,method:`GET`,path:`/api/v1/contacts`},{name:`companies_patch`,label:`Patch`,group:`Accounting Metadata Write`,preferenceKey:`Accounting Metadata Write`,parent:`Companies`,entity:`companies`,defaultPermission:`ask`,method:`PATCH`,path:`/api/v1/companies/{id}`}],j=()=>x(document.body).findByRole(`dialog`,{name:`Advanced Chat Settings`}),M={render:()=>(0,v.jsx)(h,{}),play:async({canvasElement:e,step:t})=>{await t(`nests colliding verbs under their entity sub-headers`,async()=>{let{dialogView:t}=await m(e);await b.click(t.getByRole(`button`,{name:/permissions/i})),await y(t.getByRole(`button`,{name:`Toggle Accounting Read group`})).toBeInTheDocument(),await y(t.getByRole(`button`,{name:`Toggle Accounts group`})).toBeInTheDocument(),await y(t.getByRole(`button`,{name:`Toggle Contacts group`})).toBeInTheDocument(),await y(t.getAllByRole(`button`,{name:`Get`})).toHaveLength(2),await y(t.getAllByRole(`button`,{name:`List`})).toHaveLength(2)}),await t(`differing member modes surface as Mixed`,async()=>{let t=x(await j());await b.click(x(t.getByTitle(`accounts_get`)).getByRole(`button`,{name:`Toggle Get`})),y(g(e)).toEqual([{name:`accounts_get`,policy:`auto`}]),await y(t.getAllByText(`Mixed`)).toHaveLength(2)}),await t(`a parent chevron collapses only its own rows`,async()=>{let e=x(await j());await b.click(e.getByRole(`button`,{name:`Collapse Accounts`})),await y(e.queryByTitle(`accounts_get`)).toBeNull(),await y(e.getByTitle(`contacts_get`)).toBeInTheDocument()}),await t(`group rules preserve existing tool overrides`,async()=>{let t=x(await j());await b.click(t.getByRole(`button`,{name:`Toggle Accounting Read group`})),y(g(e)).toEqual([{group:`Accounting Read`,policy:`ask`},{name:`accounts_get`,policy:`auto`}]),await y(t.getAllByText(`Mixed`)).toHaveLength(2)})}},N={render:()=>(0,v.jsx)(f,{}),play:async({canvasElement:e,step:t})=>{await t(`opens schema browser with input/output schema details`,async()=>{let{dialogView:t}=await m(e);await b.click(t.getByRole(`button`,{name:/permissions/i})),await y(t.getByPlaceholderText(`Search tools`)).toBeInTheDocument(),await y(t.getAllByText(`List Xero accounts`).length).toBeGreaterThan(0),await y(t.getAllByText(`xero_accounts_list`).length).toBeGreaterThan(0),await y(t.getByText(`Hints`)).toBeInTheDocument(),await y(t.getByText(`Read-only accounting lookup.`)).toBeInTheDocument(),await y(t.getByText(`Annotations`)).toBeInTheDocument(),await y(t.getByText(`readOnlyHint`)).toBeInTheDocument(),await y(t.getByText(`tenantId`)).toBeInTheDocument(),await y(t.getByText(`Connected Xero tenant id.`)).toBeInTheDocument(),await y(t.getByText(`Output`)).toBeInTheDocument(),await b.click(t.getByRole(`tab`,{name:`JSON`})),await y(t.getByText(`annotations`)).toBeInTheDocument(),await y(t.getByText(`"xero_accounts_list"`)).toBeInTheDocument()})}},P=[`Dropdown`,`AdvancedConfig`,`AdvancedPermissions`,`NestedPermissions`,`AdvancedSchemaBrowser`],D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}}})))()}F();export{O as AdvancedConfig,k as AdvancedPermissions,N as AdvancedSchemaBrowser,D as Dropdown,M as NestedPermissions,P as __namedExportsOrder,E as default};