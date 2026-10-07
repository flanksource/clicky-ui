import{j as t,r as T,bi as ae}from"./iframe-DrKsS3M_.js";import{c as ie}from"./utils-DW-IJACk.js";import{R as u}from"./RuntimeBar-CV90AZVj.js";import{r as re}from"./runtime-spec-fields-N5nJEcB_.js";import{S as se}from"./runtime-mode-C1_P-ZLR.js";import"./preload-helper-CLP1olNy.js";import"./effort-icons-BgUAE0qu.js";import"./duration-BuesBvhN.js";import"./Icon-5YnqmjaE.js";import"./DropdownMenu-BPEvBj-S.js";import"./floating-ui.react-BaraekBC.js";import"./index-B7F1fGYx.js";import"./index-kSQoS_dD.js";import"./button-C3u2SMij.js";import"./index-CPURVhFy.js";import"./loading-Zh7pc3Pa.js";import"./DropdownMenuSubmenu-BmCuQSFk.js";import"./modalStack-BXNp3ooX.js";import"./zIndex-BGbNBNA8.js";import"./Combobox-BOBKHCDA.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-ffMsgFpu.js";import"./InputField-B-13abB5.js";import"./use-hotkey-CrSSlMlI.js";import"./collections-CoHfwOze.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-CpLOQt-a.js";import"./agent-action-icons-DdGIPGmF.js";import"./permissions-model-kCB23riw.js";import"./tool-policy-BSrhi_k5.js";import"./types-DnFuV5L5.js";const{expect:i,userEvent:r,within:a}=__STORYBOOK_MODULE_TEST__,d=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,contextWindow:2e5},{id:"anthropic/claude-opus-4-1",provider:"anthropic",label:"Claude Opus 4.1",reasoning:!0,configured:!0,contextWindow:2e5},{id:"openai/gpt-5-codex",provider:"openai",label:"GPT-5 Codex",reasoning:!0,configured:!0,contextWindow:4e5},{id:"openai/gpt-5-mini",provider:"openai",label:"GPT-5 mini",reasoning:!0,configured:!1,contextWindow:4e5}];function c({initial:n,families:e,className:o,showTimeout:s=!1,showCost:l=!1}){const[p,oe]=T.useState(n);return t.jsxs("div",{className:"grid max-w-3xl gap-4 p-6",children:[t.jsx(u,{value:p,onChange:oe,models:d,families:e,className:o,showTimeout:s,showCost:l}),t.jsx("pre",{className:"rounded-md border border-border bg-muted/30 p-3 font-mono text-xs text-muted-foreground",children:JSON.stringify(p,null,2)})]})}const Ue={title:"AI/RuntimeBar",component:u,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:"Mode comes first and filters the combined provider/model picker. Supplied settings appear inline when space permits and move them into the three-dot menu on narrower containers. Constrain the parent width or set className (for example, max-w-sm) to cap the bar; resizing either restores settings as space returns. Unset settings are menu-only. Use showTimeout/showCost for run limits and actions.fields with runtimeSpecFields for permission mode, Source and Commit timing. Host fields provide isSet, caption and menu items; actions.menu adds entries such as Advanced. Custom model IDs and limits remain editable in their dropdowns."}}},render:()=>t.jsx(c,{initial:{mode:"agent"}})},y={},g={render:()=>t.jsx(c,{initial:{mode:"cli",model:"openai/gpt-5-codex",effort:"high"}})},w={render:()=>t.jsx(c,{className:"max-w-sm",initial:{mode:"cli",model:"anthropic/claude-sonnet-4-6",effort:"medium",budget:{timeout:"30m",cost:2}},showTimeout:!0,showCost:!0})};function ce(){const[n,e]=T.useState({mode:"cli",model:"anthropic/claude-sonnet-4-6",effort:"medium",budget:{timeout:"30m",cost:2}});return t.jsx("div",{className:"w-80 max-w-full p-4",children:t.jsx(u,{value:n,onChange:e,models:d,showTimeout:!0,showCost:!0,ariaLabel:"Narrow runtime"})})}const h={render:()=>t.jsx(ce,{}),play:async({canvasElement:n})=>{const e=a(n).getByRole("group",{name:"Narrow runtime"}),o=e.querySelector("[data-runtime-bar-section=identity]"),s=e.querySelector("[data-runtime-bar-section=actions]");await i(s.getBoundingClientRect().top).toBe(o.getBoundingClientRect().top),await i(e.scrollWidth).toBe(e.clientWidth),await r.click(a(e).getByTitle("Runtime options")),await i(a(document.body).getAllByRole("menuitem").map(l=>l.textContent)).toEqual(["Effort","Budget","Timeout"]),await r.keyboard("{Escape}")}};function S({inline:n}){const[e,o]=T.useState({mode:"cli",model:"anthropic/claude-sonnet-4-6",effort:"medium"});return t.jsx("div",{className:ie("p-4",n?"max-w-3xl":"w-80 max-w-full"),children:t.jsx(u,{value:e,onChange:o,models:d,ariaLabel:n?"Wide runtime":"Narrow runtime",actions:{fields:[{id:"presets",isSet:!0,label:"Presets",title:"Presets — Guardrails",caption:t.jsx("span",{className:"text-xs",children:"Presets 1"}),items:[{label:"Guardrails",onSelect:()=>{}}]}],menu:[{label:"Advanced",icon:ae,onSelect:()=>{}}]}})})}const B={render:()=>t.jsxs("div",{className:"grid gap-4",children:[t.jsx(S,{inline:!0}),t.jsx(S,{inline:!1})]}),play:async({canvasElement:n})=>{const e=a(n),o=e.getByRole("group",{name:"Wide runtime"}),s=e.getByRole("group",{name:"Narrow runtime"});await i(a(o).getByTitle("Presets — Guardrails")).toBeInTheDocument(),await i(a(s).queryByTitle("Presets — Guardrails")).not.toBeInTheDocument(),await r.click(a(s).getByTitle("Runtime options"));const l=a(document.body).getAllByRole("menu")[0];await i(a(l).getAllByRole("menuitem").map(p=>p.textContent)).toEqual(["Effort","Presets","Advanced"]),await r.keyboard("{Escape}")}},x={render:()=>t.jsx(c,{initial:{mode:"cli",model:"openai/gpt-5-codex",effort:"high",budget:{timeout:"30m",cost:2}},showTimeout:!0,showCost:!0}),play:async({canvasElement:n})=>{const e=a(n),o=a(document.body);await i(e.getByTitle("Runtime mode — CLI")).toBeInTheDocument(),await r.click(e.getByTitle("Model — openai/gpt-5-codex"));const s=await o.findByRole("listbox",{name:"Model"});await i(o.getByLabelText("Search Model")).toBeInTheDocument(),await r.click(a(s).getByRole("option",{name:/^Claude Sonnet/})),await i(e.getByTitle("Runtime mode — CLI")).toBeInTheDocument(),await i(e.getByTitle("Model — anthropic/claude-sonnet-4-6")).toBeInTheDocument(),await r.click(e.getByTitle("Runtime options")),await r.click(o.getByRole("menuitem",{name:"Budget"})),await i(o.getByLabelText("Budget (USD)")).toHaveValue("2"),await r.keyboard("{Escape}"),await r.keyboard("{Escape}"),await i(o.queryByRole("menu")).not.toBeInTheDocument()}},m={render:()=>t.jsx(c,{initial:{mode:"api"},families:[{id:"gemini",label:"Gemini",provider:"googleai",modes:[{id:"api",label:"API"}]}]}),play:async({canvasElement:n})=>{const e=a(n),o=a(document.body);await r.click(e.getByTitle("Model — unspecified")),await r.type(await o.findByLabelText("Search Model"),"gemini-3-pro"),await r.click(await o.findByRole("option",{name:"Use custom: gemini-3-pro"})),await i(e.getByTitle("Model — gemini-3-pro")).toBeInTheDocument()}},b={render:()=>t.jsx(c,{initial:{mode:"cli",model:"anthropic/claude-opus-4-1"}}),play:async({canvasElement:n})=>{const e=a(n),o=a(document.body);await r.click(e.getByTitle("Model — anthropic/claude-opus-4-1")),await r.click(await o.findByRole("option",{name:/^GPT-5 Codex/})),await i(e.getByTitle("Runtime mode — CLI")).toHaveTextContent("CLI"),await i(e.getByTitle("Model — openai/gpt-5-codex")).toBeInTheDocument()}},v={render:()=>t.jsx(c,{initial:{mode:"agent"},families:[{id:"claude",label:"Claude",provider:"anthropic",modes:[{id:"agent",label:"Agent",mode:"agent",title:"Claude Agent SDK"},{id:"cli",label:"CLI",mode:"cli",title:"Claude Code CLI"}]}]}),play:async({canvasElement:n})=>{const e=a(n),o=a(document.body);await r.click(e.getByTitle("Runtime mode — Agent")),await i(o.queryByRole("menuitem",{name:/^API/})).not.toBeInTheDocument()}};function le(){const[n,e]=T.useState({mode:"cli",model:"anthropic/claude-sonnet-4-6",effort:"medium",budget:{timeout:"30m",cost:2},permissions:{mode:"plan"},setup:{checkout:{worktree:{mode:"none"}}},workflow:{commits:[{on:"run"}]}});return t.jsxs("div",{className:"grid gap-4 p-6",children:[t.jsx(u,{value:n,onChange:e,models:d,showTimeout:!0,showCost:!0,actions:{fields:re({value:n,onChange:e,models:d,families:se})}}),t.jsx("pre",{className:"text-xs",children:JSON.stringify(n,null,2)})]})}const f={render:()=>t.jsx(le,{})};var R,E,C;y.parameters={...y.parameters,docs:{...(R=y.parameters)==null?void 0:R.docs,source:{originalSource:"{}",...(C=(E=y.parameters)==null?void 0:E.docs)==null?void 0:C.source}}};var I,k,A;g.parameters={...g.parameters,docs:{...(I=g.parameters)==null?void 0:I.docs,source:{originalSource:`{
  render: () => <RuntimeBarStory initial={{
    mode: "cli",
    model: "openai/gpt-5-codex",
    effort: "high"
  }} />
}`,...(A=(k=g.parameters)==null?void 0:k.docs)==null?void 0:A.source}}};var M,D,N;w.parameters={...w.parameters,docs:{...(M=w.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: () => <RuntimeBarStory className="max-w-sm" initial={{
    mode: "cli",
    model: "anthropic/claude-sonnet-4-6",
    effort: "medium",
    budget: {
      timeout: "30m",
      cost: 2
    }
  }} showTimeout showCost />
}`,...(N=(D=w.parameters)==null?void 0:D.docs)==null?void 0:N.source}}};var j,L,P;h.parameters={...h.parameters,docs:{...(j=h.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: () => <NarrowRuntimeBarStory />,
  play: async ({
    canvasElement
  }) => {
    const bar = within(canvasElement).getByRole("group", {
      name: "Narrow runtime"
    });
    const identity = bar.querySelector("[data-runtime-bar-section=identity]")!;
    const actions = bar.querySelector("[data-runtime-bar-section=actions]")!;
    await expect(actions.getBoundingClientRect().top).toBe(identity.getBoundingClientRect().top);
    await expect(bar.scrollWidth).toBe(bar.clientWidth);
    await userEvent.click(within(bar).getByTitle("Runtime options"));
    await expect(within(document.body).getAllByRole("menuitem").map(item => item.textContent)).toEqual(["Effort", "Budget", "Timeout"]);
    await userEvent.keyboard("{Escape}");
  }
}`,...(P=(L=h.parameters)==null?void 0:L.docs)==null?void 0:P.source}}};var W,q,G;B.parameters={...B.parameters,docs:{...(W=B.parameters)==null?void 0:W.docs,source:{originalSource:`{
  render: () => <div className="grid gap-4">
      <HostActionsStory inline />
      <HostActionsStory inline={false} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const wide = canvas.getByRole("group", {
      name: "Wide runtime"
    });
    const narrow = canvas.getByRole("group", {
      name: "Narrow runtime"
    });
    await expect(within(wide).getByTitle("Presets — Guardrails")).toBeInTheDocument();
    await expect(within(narrow).queryByTitle("Presets — Guardrails")).not.toBeInTheDocument();
    await userEvent.click(within(narrow).getByTitle("Runtime options"));
    const menu = within(document.body).getAllByRole("menu")[0]!;
    await expect(within(menu).getAllByRole("menuitem").map(item => item.textContent)).toEqual(["Effort", "Presets", "Advanced"]);
    await userEvent.keyboard("{Escape}");
  }
}`,...(G=(q=B.parameters)==null?void 0:q.docs)==null?void 0:G.source}}};var O,U,H;x.parameters={...x.parameters,docs:{...(O=x.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: () => <RuntimeBarStory initial={{
    mode: "cli",
    model: "openai/gpt-5-codex",
    effort: "high",
    budget: {
      timeout: "30m",
      cost: 2
    }
  }} showTimeout showCost />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await expect(canvas.getByTitle("Runtime mode — CLI")).toBeInTheDocument();
    await userEvent.click(canvas.getByTitle("Model — openai/gpt-5-codex"));
    const listbox = await body.findByRole("listbox", {
      name: "Model"
    });
    await expect(body.getByLabelText("Search Model")).toBeInTheDocument();
    await userEvent.click(within(listbox).getByRole("option", {
      name: /^Claude Sonnet/
    }));
    await expect(canvas.getByTitle("Runtime mode — CLI")).toBeInTheDocument();
    await expect(canvas.getByTitle("Model — anthropic/claude-sonnet-4-6")).toBeInTheDocument();
    await userEvent.click(canvas.getByTitle("Runtime options"));
    await userEvent.click(body.getByRole("menuitem", {
      name: "Budget"
    }));
    await expect(body.getByLabelText("Budget (USD)")).toHaveValue("2");
    await userEvent.keyboard("{Escape}");
    await userEvent.keyboard("{Escape}");
    await expect(body.queryByRole("menu")).not.toBeInTheDocument();
  }
}`,...(H=(U=x.parameters)==null?void 0:U.docs)==null?void 0:H.source}}};var _,F,V,K,J;m.parameters={...m.parameters,docs:{...(_=m.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => <RuntimeBarStory initial={{
    mode: "api"
  }} families={[{
    id: "gemini",
    label: "Gemini",
    provider: "googleai",
    modes: [{
      id: "api",
      label: "API"
    }]
  }]} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByTitle("Model — unspecified"));
    await userEvent.type(await body.findByLabelText("Search Model"), "gemini-3-pro");
    await userEvent.click(await body.findByRole("option", {
      name: "Use custom: gemini-3-pro"
    }));
    await expect(canvas.getByTitle("Model — gemini-3-pro")).toBeInTheDocument();
  }
}`,...(V=(F=m.parameters)==null?void 0:F.docs)==null?void 0:V.source},description:{story:`A hosted-API family the catalog does not describe keeps model entry available
 as free text even when there are no catalog rows.`,...(J=(K=m.parameters)==null?void 0:K.docs)==null?void 0:J.description}}};var z,Y,Q;b.parameters={...b.parameters,docs:{...(z=b.parameters)==null?void 0:z.docs,source:{originalSource:`{
  render: () => <RuntimeBarStory initial={{
    mode: "cli",
    model: "anthropic/claude-opus-4-1"
  }} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByTitle("Model — anthropic/claude-opus-4-1"));
    await userEvent.click(await body.findByRole("option", {
      name: /^GPT-5 Codex/
    }));
    await expect(canvas.getByTitle("Runtime mode — CLI")).toHaveTextContent("CLI");
    await expect(canvas.getByTitle("Model — openai/gpt-5-codex")).toBeInTheDocument();
  }
}`,...(Q=(Y=b.parameters)==null?void 0:Y.docs)==null?void 0:Q.source}}};var X,Z,$;v.parameters={...v.parameters,docs:{...(X=v.parameters)==null?void 0:X.docs,source:{originalSource:`{
  render: () => <RuntimeBarStory initial={{
    mode: "agent"
  }} families={[{
    id: "claude",
    label: "Claude",
    provider: "anthropic",
    modes: [{
      id: "agent",
      label: "Agent",
      mode: "agent",
      title: "Claude Agent SDK"
    }, {
      id: "cli",
      label: "CLI",
      mode: "cli",
      title: "Claude Code CLI"
    }]
  }]} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByTitle("Runtime mode — Agent"));
    await expect(body.queryByRole("menuitem", {
      name: /^API/
    })).not.toBeInTheDocument();
  }
}`,...($=(Z=v.parameters)==null?void 0:Z.docs)==null?void 0:$.source}}};var ee,te,ne;f.parameters={...f.parameters,docs:{...(ee=f.parameters)==null?void 0:ee.docs,source:{originalSource:`{
  render: () => <SpecSettingsStory />
}`,...(ne=(te=f.parameters)==null?void 0:te.docs)==null?void 0:ne.source}}};const He=["Default","WithModelAndEffort","MaximumWidth","NarrowContainer","HostActions","WithLimits","NoModelsForFamily","SwitchingFamilyKeepsTheMode","UnavailableModesAreOmitted","WithSpecSettings"];export{y as Default,B as HostActions,w as MaximumWidth,h as NarrowContainer,m as NoModelsForFamily,b as SwitchingFamilyKeepsTheMode,v as UnavailableModesAreOmitted,x as WithLimits,g as WithModelAndEffort,f as WithSpecSettings,He as __namedExportsOrder,Ue as default};
