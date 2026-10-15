import{j as t,r as T,bn as ie}from"./iframe-DNj_zNZU.js";import{c as re}from"./utils-DW-IJACk.js";import{R as u}from"./RuntimeBar-CZrQ7rIJ.js";import{r as se}from"./runtime-spec-fields-Bxz14K5t.js";import{S as ce}from"./runtime-mode-CsMfXeiy.js";import"./preload-helper-LCYGeQwd.js";import"./effort-icons-DrB6agg7.js";import"./duration-BuesBvhN.js";import"./Icon-D173D1Xm.js";import"./DropdownMenu-BZOVBMap.js";import"./floating-ui.react-CUsd8blK.js";import"./index-C78OGtU2.js";import"./index-BaPlC8a_.js";import"./button-l9qmO7rt.js";import"./index-CPURVhFy.js";import"./loading-CmRQFweU.js";import"./DropdownMenuSubmenu-CexcY20v.js";import"./modalStack-qck1gI8h.js";import"./zIndex-BGbNBNA8.js";import"./Combobox-BpxNrIrE.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-BCljltSy.js";import"./InputField-CCxG1Wg3.js";import"./use-hotkey-CH50nEFR.js";import"./collections-CoHfwOze.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-CVPTN7g5.js";import"./agent-action-icons-CKSmu47z.js";import"./permissions-model-CVzQNcrk.js";import"./tool-policy-BSrhi_k5.js";import"./types-DnFuV5L5.js";const{expect:a,userEvent:r,waitFor:S,within:i}=__STORYBOOK_MODULE_TEST__,d=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,contextWindow:2e5},{id:"anthropic/claude-opus-4-1",provider:"anthropic",label:"Claude Opus 4.1",reasoning:!0,configured:!0,contextWindow:2e5},{id:"openai/gpt-5-codex",provider:"openai",label:"GPT-5 Codex",reasoning:!0,configured:!0,contextWindow:4e5},{id:"openai/gpt-5-mini",provider:"openai",label:"GPT-5 mini",reasoning:!0,configured:!1,contextWindow:4e5}];function c({initial:n,families:e,className:o,showTimeout:s=!1,showCost:m=!1}){const[p,ae]=T.useState(n);return t.jsxs("div",{className:"grid max-w-3xl gap-4 p-6",children:[t.jsx(u,{value:p,onChange:ae,models:d,families:e,className:o,showTimeout:s,showCost:m}),t.jsx("pre",{className:"rounded-md border border-border bg-muted/30 p-3 font-mono text-xs text-muted-foreground",children:JSON.stringify(p,null,2)})]})}const Ue={title:"AI/RuntimeBar",component:u,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:"Mode comes first and filters the combined provider/model picker. Supplied settings appear inline when space permits and move them into the three-dot menu on narrower containers. Constrain the parent width or set className (for example, max-w-sm) to cap the bar; resizing either restores settings as space returns. Unset settings are menu-only. Use showTimeout/showCost for run limits and actions.fields with runtimeSpecFields for permission mode, Source and Commit timing. Host fields provide isSet, caption and menu items; actions.menu adds entries such as Advanced. Custom model IDs and limits remain editable in their dropdowns."}}},render:()=>t.jsx(c,{initial:{mode:"agent"}})},y={},g={render:()=>t.jsx(c,{initial:{mode:"cli",model:"openai/gpt-5-codex",effort:"high"}})},w={render:()=>t.jsx(c,{className:"max-w-sm",initial:{mode:"cli",model:"anthropic/claude-sonnet-4-6",effort:"medium",budget:{timeout:"30m",cost:2}},showTimeout:!0,showCost:!0})};function me(){const[n,e]=T.useState({mode:"cli",model:"anthropic/claude-sonnet-4-6",effort:"medium",budget:{timeout:"30m",cost:2}});return t.jsx("div",{className:"w-80 max-w-full p-4",children:t.jsx(u,{value:n,onChange:e,models:d,showTimeout:!0,showCost:!0,ariaLabel:"Narrow runtime"})})}const h={render:()=>t.jsx(me,{}),play:async({canvasElement:n})=>{const e=i(n).getByRole("group",{name:"Narrow runtime"}),o=e.querySelector("[data-runtime-bar-section=identity]"),s=e.querySelector("[data-runtime-bar-section=actions]");await a(s.getBoundingClientRect().top).toBe(o.getBoundingClientRect().top),await a(e.scrollWidth).toBe(e.clientWidth),await r.click(i(e).getByTitle("Runtime options")),await a(i(document.body).getAllByRole("menuitem").map(m=>m.textContent)).toEqual(["Effort","Budget","Timeout"]),await r.keyboard("{Escape}")}};function R({inline:n}){const[e,o]=T.useState({mode:"cli",model:"anthropic/claude-sonnet-4-6",effort:"medium"});return t.jsx("div",{className:re("p-4",n?"max-w-3xl":"w-80 max-w-full"),children:t.jsx(u,{value:e,onChange:o,models:d,ariaLabel:n?"Wide runtime":"Narrow runtime",actions:{fields:[{id:"presets",isSet:!0,label:"Presets",title:"Presets — Guardrails",caption:t.jsx("span",{className:"text-xs",children:"Presets 1"}),items:[{label:"Guardrails",onSelect:()=>{}}]}],menu:[{label:"Advanced",icon:ie,onSelect:()=>{}}]}})})}const B={render:()=>t.jsxs("div",{className:"grid gap-4",children:[t.jsx(R,{inline:!0}),t.jsx(R,{inline:!1})]}),play:async({canvasElement:n})=>{const e=i(n),o=e.getByRole("group",{name:"Wide runtime"}),s=e.getByRole("group",{name:"Narrow runtime"});await a(i(o).getByTitle("Presets — Guardrails")).toBeInTheDocument(),await a(i(s).queryByTitle("Presets — Guardrails")).not.toBeInTheDocument(),await r.click(i(s).getByTitle("Runtime options"));const m=i(document.body).getAllByRole("menu")[0];await a(i(m).getAllByRole("menuitem").map(p=>p.textContent)).toEqual(["Effort","Presets","Advanced"]),await r.keyboard("{Escape}")}},x={render:()=>t.jsx(c,{initial:{mode:"cli",model:"openai/gpt-5-codex",effort:"high",budget:{timeout:"30m",cost:2}},showTimeout:!0,showCost:!0}),play:async({canvasElement:n})=>{const e=i(n),o=i(document.body);await a(e.getByTitle("Runtime mode — CLI")).toBeInTheDocument(),await r.click(e.getByTitle("Model — openai/gpt-5-codex"));const s=await o.findByRole("listbox",{name:"Model"});await a(o.getByLabelText("Search Model")).toBeInTheDocument(),await r.click(i(s).getByRole("option",{name:/^Claude Sonnet/})),await a(e.getByTitle("Runtime mode — CLI")).toBeInTheDocument(),await a(e.getByTitle("Model — anthropic/claude-sonnet-4-6")).toBeInTheDocument(),await r.click(e.getByTitle("Runtime options")),await r.click(o.getByRole("menuitem",{name:"Budget"})),await a(o.getByLabelText("Budget (USD)")).toHaveValue("2"),await r.keyboard("{Escape}"),await S(()=>a(o.queryByRole("menu",{name:"Budget"})).not.toBeInTheDocument()),await a(o.getByRole("menu",{name:"Runtime options"})).toBeInTheDocument(),await r.keyboard("{Escape}"),await S(()=>a(o.queryByRole("menu")).not.toBeInTheDocument())}},l={render:()=>t.jsx(c,{initial:{mode:"api"},families:[{id:"gemini",label:"Gemini",provider:"googleai",modes:[{id:"api",label:"API"}]}]}),play:async({canvasElement:n})=>{const e=i(n),o=i(document.body);await r.click(e.getByTitle("Model — unspecified")),await r.type(await o.findByLabelText("Search Model"),"gemini-3-pro"),await r.click(await o.findByRole("option",{name:"Use custom: gemini-3-pro"})),await a(e.getByTitle("Model — gemini-3-pro")).toBeInTheDocument()}},b={render:()=>t.jsx(c,{initial:{mode:"cli",model:"anthropic/claude-opus-4-1"}}),play:async({canvasElement:n})=>{const e=i(n),o=i(document.body);await r.click(e.getByTitle("Model — anthropic/claude-opus-4-1")),await r.click(await o.findByRole("option",{name:/^GPT-5 Codex/})),await a(e.getByTitle("Runtime mode — CLI")).toHaveTextContent("CLI"),await a(e.getByTitle("Model — openai/gpt-5-codex")).toBeInTheDocument()}},v={render:()=>t.jsx(c,{initial:{mode:"agent"},families:[{id:"claude",label:"Claude",provider:"anthropic",modes:[{id:"agent",label:"Agent",mode:"agent",title:"Claude Agent SDK"},{id:"cli",label:"CLI",mode:"cli",title:"Claude Code CLI"}]}]}),play:async({canvasElement:n})=>{const e=i(n),o=i(document.body);await r.click(e.getByTitle("Runtime mode — Agent")),await a(o.queryByRole("menuitem",{name:/^API/})).not.toBeInTheDocument()}};function le(){const[n,e]=T.useState({mode:"cli",model:"anthropic/claude-sonnet-4-6",effort:"medium",budget:{timeout:"30m",cost:2},permissions:{mode:"plan"},setup:{checkout:{worktree:{mode:"none"}}},workflow:{commits:[{on:"run"}]}});return t.jsxs("div",{className:"grid gap-4 p-6",children:[t.jsx(u,{value:n,onChange:e,models:d,showTimeout:!0,showCost:!0,actions:{fields:se({value:n,onChange:e,models:d,families:ce})}}),t.jsx("pre",{className:"text-xs",children:JSON.stringify(n,null,2)})]})}const f={render:()=>t.jsx(le,{})};var E,C,I;y.parameters={...y.parameters,docs:{...(E=y.parameters)==null?void 0:E.docs,source:{originalSource:"{}",...(I=(C=y.parameters)==null?void 0:C.docs)==null?void 0:I.source}}};var k,A,D;g.parameters={...g.parameters,docs:{...(k=g.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: () => <RuntimeBarStory initial={{
    mode: "cli",
    model: "openai/gpt-5-codex",
    effort: "high"
  }} />
}`,...(D=(A=g.parameters)==null?void 0:A.docs)==null?void 0:D.source}}};var M,N,j;w.parameters={...w.parameters,docs:{...(M=w.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: () => <RuntimeBarStory className="max-w-sm" initial={{
    mode: "cli",
    model: "anthropic/claude-sonnet-4-6",
    effort: "medium",
    budget: {
      timeout: "30m",
      cost: 2
    }
  }} showTimeout showCost />
}`,...(j=(N=w.parameters)==null?void 0:N.docs)==null?void 0:j.source}}};var L,P,W;h.parameters={...h.parameters,docs:{...(L=h.parameters)==null?void 0:L.docs,source:{originalSource:`{
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
}`,...(W=(P=h.parameters)==null?void 0:P.docs)==null?void 0:W.source}}};var q,G,F;B.parameters={...B.parameters,docs:{...(q=B.parameters)==null?void 0:q.docs,source:{originalSource:`{
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
}`,...(F=(G=B.parameters)==null?void 0:G.docs)==null?void 0:F.source}}};var O,U,H;x.parameters={...x.parameters,docs:{...(O=x.parameters)==null?void 0:O.docs,source:{originalSource:`{
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
    await waitFor(() => expect(body.queryByRole("menu", {
      name: "Budget"
    })).not.toBeInTheDocument());
    await expect(body.getByRole("menu", {
      name: "Runtime options"
    })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
  }
}`,...(H=(U=x.parameters)==null?void 0:U.docs)==null?void 0:H.source}}};var _,V,K,J,z;l.parameters={...l.parameters,docs:{...(_=l.parameters)==null?void 0:_.docs,source:{originalSource:`{
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
}`,...(K=(V=l.parameters)==null?void 0:V.docs)==null?void 0:K.source},description:{story:`A hosted-API family the catalog does not describe keeps model entry available
 as free text even when there are no catalog rows.`,...(z=(J=l.parameters)==null?void 0:J.docs)==null?void 0:z.description}}};var Y,Q,X;b.parameters={...b.parameters,docs:{...(Y=b.parameters)==null?void 0:Y.docs,source:{originalSource:`{
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
}`,...(X=(Q=b.parameters)==null?void 0:Q.docs)==null?void 0:X.source}}};var Z,$,ee;v.parameters={...v.parameters,docs:{...(Z=v.parameters)==null?void 0:Z.docs,source:{originalSource:`{
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
}`,...(ee=($=v.parameters)==null?void 0:$.docs)==null?void 0:ee.source}}};var te,ne,oe;f.parameters={...f.parameters,docs:{...(te=f.parameters)==null?void 0:te.docs,source:{originalSource:`{
  render: () => <SpecSettingsStory />
}`,...(oe=(ne=f.parameters)==null?void 0:ne.docs)==null?void 0:oe.source}}};const He=["Default","WithModelAndEffort","MaximumWidth","NarrowContainer","HostActions","WithLimits","NoModelsForFamily","SwitchingFamilyKeepsTheMode","UnavailableModesAreOmitted","WithSpecSettings"];export{y as Default,B as HostActions,w as MaximumWidth,h as NarrowContainer,l as NoModelsForFamily,b as SwitchingFamilyKeepsTheMode,v as UnavailableModesAreOmitted,x as WithLimits,g as WithModelAndEffort,f as WithSpecSettings,He as __namedExportsOrder,Ue as default};
