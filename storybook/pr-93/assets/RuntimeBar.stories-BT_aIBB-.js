import{j as a,r as f,bc as ee}from"./iframe-CBNX-dQr.js";import{c as te}from"./utils-DW-IJACk.js";import{R as u}from"./RuntimeBar-BGwfa0dB.js";import{r as ne}from"./runtime-spec-fields-DXiGKEfH.js";import{S as ae}from"./runtime-mode-B-91Rimv.js";import"./preload-helper-DmsBQNJi.js";import"./effort-icons-CZjDpPCo.js";import"./duration-BuesBvhN.js";import"./Icon-Bl13VMM_.js";import"./DropdownMenu-D2VkYe4-.js";import"./floating-ui.react-DfgK1207.js";import"./index-DwHWx2SL.js";import"./index-DwW3fdnJ.js";import"./button-66Jqw29m.js";import"./index-CPURVhFy.js";import"./loading-I_MdTxAY.js";import"./DropdownMenuSubmenu-vwNEYm-T.js";import"./modalStack-B758Y7Je.js";import"./zIndex-BGbNBNA8.js";import"./Combobox-ivMDoGSw.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-CC2kjuRK.js";import"./InputField-DLd-KN5R.js";import"./use-hotkey-Br5lNyjq.js";import"./collections-CoHfwOze.js";import"./session-tones-BVWRqRHz.js";import"./permission-mode-visuals-CvIKg4vd.js";import"./agent-action-icons-kxjlNMQ8.js";import"./permissions-model-6HlW-NSM.js";import"./tool-policy-D90x3NRy.js";import"./types-B4ZMggem.js";const{expect:i,userEvent:r,within:o}=__STORYBOOK_MODULE_TEST__,m=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,contextWindow:2e5},{id:"anthropic/claude-opus-4-1",provider:"anthropic",label:"Claude Opus 4.1",reasoning:!0,configured:!0,contextWindow:2e5},{id:"openai/gpt-5-codex",provider:"openai",label:"GPT-5 Codex",reasoning:!0,configured:!0,contextWindow:4e5},{id:"openai/gpt-5-mini",provider:"openai",label:"GPT-5 mini",reasoning:!0,configured:!1,contextWindow:4e5}];function c({initial:e,variant:t="segmented",families:n,showTimeout:s=!1,showCost:d=!1}){const[p,$]=f.useState(e);return a.jsxs("div",{className:"grid max-w-3xl gap-4 p-6",children:[a.jsx(u,{value:p,onChange:$,models:m,families:n,variant:t,showTimeout:s,showCost:d}),a.jsx("pre",{className:"rounded-md border border-border bg-muted/30 p-3 font-mono text-xs text-muted-foreground",children:JSON.stringify(p,null,2)})]})}const We={title:"AI/RuntimeBar",component:u,tags:["autodocs"],argTypes:{variant:{control:"inline-radio",options:["segmented","combo"]}},args:{variant:"segmented"},parameters:{layout:"fullscreen",docs:{description:{component:"Mode comes first and filters the combined provider/model picker. Both layouts show supplied settings inline when space permits and move them into the three-dot menu on narrower containers. Unset settings are menu-only. Use showTimeout/showCost for run limits and actions.fields with runtimeSpecFields for permission mode, Source and Commit timing. Host fields provide isSet, caption and menu items; actions.menu adds entries such as Advanced. Custom model IDs and limits remain editable in their dropdowns."}}},render:({variant:e})=>a.jsx(c,{initial:{mode:"agent"},variant:e})},g={},y={render:({variant:e})=>a.jsx(c,{variant:e,initial:{mode:"cli",model:"openai/gpt-5-codex",effort:"high"}})};function oe(){const[e,t]=f.useState({mode:"cli",model:"anthropic/claude-sonnet-4-6",effort:"medium",budget:{timeout:"30m",cost:2}});return a.jsx("div",{className:"w-80 max-w-full p-4",children:a.jsx(u,{value:e,onChange:t,models:m,showTimeout:!0,showCost:!0,ariaLabel:"Narrow runtime"})})}const w={args:{variant:"segmented"},render:()=>a.jsx(oe,{}),play:async({canvasElement:e})=>{const t=o(e).getByRole("group",{name:"Narrow runtime"}),n=t.querySelector("[data-runtime-bar-section=identity]"),s=t.querySelector("[data-runtime-bar-section=actions]");await i(s.getBoundingClientRect().top).toBe(n.getBoundingClientRect().top),await i(t.scrollWidth).toBe(t.clientWidth),await r.click(o(t).getByTitle("Runtime options")),await i(o(document.body).getAllByRole("menuitem").map(d=>d.textContent)).toEqual(["Effort","Budget","Timeout"]),await r.keyboard("{Escape}")}};function T({inline:e}){const[t,n]=f.useState({mode:"cli",model:"anthropic/claude-sonnet-4-6",effort:"medium"});return a.jsx("div",{className:te("p-4",e?"max-w-3xl":"w-80 max-w-full"),children:a.jsx(u,{value:t,onChange:n,models:m,ariaLabel:e?"Wide runtime":"Narrow runtime",actions:{fields:[{id:"presets",isSet:!0,label:"Presets",title:"Presets — Guardrails",caption:a.jsx("span",{className:"text-xs",children:"Presets 1"}),items:[{label:"Guardrails",onSelect:()=>{}}]}],menu:[{label:"Advanced",icon:ee,onSelect:()=>{}}]}})})}const v={args:{variant:"segmented"},render:()=>a.jsxs("div",{className:"grid gap-4",children:[a.jsx(T,{inline:!0}),a.jsx(T,{inline:!1})]}),play:async({canvasElement:e})=>{const t=o(e),n=t.getByRole("group",{name:"Wide runtime"}),s=t.getByRole("group",{name:"Narrow runtime"});await i(o(n).getByTitle("Presets — Guardrails")).toBeInTheDocument(),await i(o(s).queryByTitle("Presets — Guardrails")).not.toBeInTheDocument(),await r.click(o(s).getByTitle("Runtime options"));const d=o(document.body).getAllByRole("menu")[0];await i(o(d).getAllByRole("menuitem").map(p=>p.textContent)).toEqual(["Effort","Presets","Advanced"]),await r.keyboard("{Escape}")}},h={args:{variant:"combo"},render:({variant:e})=>a.jsx(c,{variant:e,initial:{mode:"cli",model:"openai/gpt-5-codex",effort:"high",budget:{timeout:"30m",cost:2}},showTimeout:!0,showCost:!0}),play:async({canvasElement:e})=>{const t=o(e),n=o(document.body);await i(t.getByTitle("Runtime mode — CLI")).toBeInTheDocument(),await r.click(t.getByTitle("Model — openai/gpt-5-codex"));const s=await n.findByRole("listbox",{name:"Model"});await i(n.getByLabelText("Search Model")).toBeInTheDocument(),await r.click(o(s).getByRole("option",{name:/^Claude Sonnet/})),await i(t.getByTitle("Runtime mode — CLI")).toBeInTheDocument(),await i(t.getByTitle("Model — anthropic/claude-sonnet-4-6")).toBeInTheDocument(),await r.click(t.getByTitle("Runtime options")),await r.click(n.getByRole("menuitem",{name:"Budget"})),await i(n.getByLabelText("Budget (USD)")).toHaveValue("2"),await r.keyboard("{Escape}"),await r.keyboard("{Escape}"),await i(n.queryByRole("menu")).not.toBeInTheDocument()}},l={args:{variant:"segmented"},render:({variant:e})=>a.jsx(c,{initial:{mode:"api"},variant:e,families:[{id:"gemini",label:"Gemini",provider:"googleai",modes:[{id:"api",label:"API"}]}]}),play:async({canvasElement:e})=>{const t=o(e),n=o(document.body);await r.click(t.getByTitle("Model — unspecified")),await r.type(await n.findByLabelText("Search Model"),"gemini-3-pro"),await r.click(await n.findByRole("option",{name:"Use custom: gemini-3-pro"})),await i(t.getByTitle("Model — gemini-3-pro")).toBeInTheDocument()}},B={args:{variant:"segmented"},render:({variant:e})=>a.jsx(c,{variant:e,initial:{mode:"cli",model:"anthropic/claude-opus-4-1"}}),play:async({canvasElement:e})=>{const t=o(e),n=o(document.body);await r.click(t.getByTitle("Model — anthropic/claude-opus-4-1")),await r.click(await n.findByRole("option",{name:/^GPT-5 Codex/})),await i(t.getByTitle("Runtime mode — CLI")).toHaveTextContent("CLI"),await i(t.getByTitle("Model — openai/gpt-5-codex")).toBeInTheDocument()}},b={args:{variant:"segmented"},render:({variant:e})=>a.jsx(c,{initial:{mode:"agent"},variant:e,families:[{id:"claude",label:"Claude",provider:"anthropic",modes:[{id:"agent",label:"Agent",mode:"agent",title:"Claude Agent SDK"},{id:"cli",label:"CLI",mode:"cli",title:"Claude Code CLI"}]}]}),play:async({canvasElement:e})=>{const t=o(e),n=o(document.body);await r.click(t.getByTitle("Runtime mode — Agent")),await i(n.queryByRole("menuitem",{name:/^API/})).not.toBeInTheDocument()}};function ie({variant:e}){const[t,n]=f.useState({mode:"cli",model:"anthropic/claude-sonnet-4-6",effort:"medium",budget:{timeout:"30m",cost:2},permissions:{mode:"plan"},setup:{checkout:{worktree:{mode:"none"}}},workflow:{commits:[{on:"run"}]}});return a.jsxs("div",{className:"grid gap-4 p-6",children:[a.jsx(u,{variant:e,value:t,onChange:n,models:m,showTimeout:!0,showCost:!0,actions:{fields:ne({value:t,onChange:n,models:m,families:ae})}}),a.jsx("pre",{className:"text-xs",children:JSON.stringify(t,null,2)})]})}const x={render:({variant:e})=>a.jsx(ie,{variant:e})};var S,R,E;g.parameters={...g.parameters,docs:{...(S=g.parameters)==null?void 0:S.docs,source:{originalSource:"{}",...(E=(R=g.parameters)==null?void 0:R.docs)==null?void 0:E.source}}};var C,I,k;y.parameters={...y.parameters,docs:{...(C=y.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: ({
    variant
  }) => <RuntimeBarStory variant={variant} initial={{
    mode: "cli",
    model: "openai/gpt-5-codex",
    effort: "high"
  }} />
}`,...(k=(I=y.parameters)==null?void 0:I.docs)==null?void 0:k.source}}};var A,M,D;w.parameters={...w.parameters,docs:{...(A=w.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    variant: "segmented"
  },
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
}`,...(D=(M=w.parameters)==null?void 0:M.docs)==null?void 0:D.source}}};var j,N,L;v.parameters={...v.parameters,docs:{...(j=v.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    variant: "segmented"
  },
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
}`,...(L=(N=v.parameters)==null?void 0:N.docs)==null?void 0:L.source}}};var P,W,q;h.parameters={...h.parameters,docs:{...(P=h.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    variant: "combo"
  },
  render: ({
    variant
  }) => <RuntimeBarStory variant={variant} initial={{
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
}`,...(q=(W=h.parameters)==null?void 0:W.docs)==null?void 0:q.source}}};var G,O,U,H,_;l.parameters={...l.parameters,docs:{...(G=l.parameters)==null?void 0:G.docs,source:{originalSource:`{
  args: {
    variant: "segmented"
  },
  render: ({
    variant
  }) => <RuntimeBarStory initial={{
    mode: "api"
  }} variant={variant} families={[{
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
}`,...(U=(O=l.parameters)==null?void 0:O.docs)==null?void 0:U.source},description:{story:`A hosted-API family the catalog does not describe keeps model entry available
 as free text even when there are no catalog rows.`,...(_=(H=l.parameters)==null?void 0:H.docs)==null?void 0:_.description}}};var F,V,K;B.parameters={...B.parameters,docs:{...(F=B.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    variant: "segmented"
  },
  render: ({
    variant
  }) => <RuntimeBarStory variant={variant} initial={{
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
}`,...(K=(V=B.parameters)==null?void 0:V.docs)==null?void 0:K.source}}};var J,Y,z;b.parameters={...b.parameters,docs:{...(J=b.parameters)==null?void 0:J.docs,source:{originalSource:`{
  args: {
    variant: "segmented"
  },
  render: ({
    variant
  }) => <RuntimeBarStory initial={{
    mode: "agent"
  }} variant={variant} families={[{
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
}`,...(z=(Y=b.parameters)==null?void 0:Y.docs)==null?void 0:z.source}}};var Q,X,Z;x.parameters={...x.parameters,docs:{...(Q=x.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  render: ({
    variant
  }) => <SpecSettingsStory variant={variant} />
}`,...(Z=(X=x.parameters)==null?void 0:X.docs)==null?void 0:Z.source}}};const qe=["Default","WithModelAndEffort","NarrowContainer","HostActions","Combo","NoModelsForFamily","SwitchingFamilyKeepsTheMode","UnavailableModesAreOmitted","WithSpecSettings"];export{h as Combo,g as Default,v as HostActions,w as NarrowContainer,l as NoModelsForFamily,B as SwitchingFamilyKeepsTheMode,b as UnavailableModesAreOmitted,y as WithModelAndEffort,x as WithSpecSettings,qe as __namedExportsOrder,We as default};
