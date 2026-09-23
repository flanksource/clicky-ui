import{j as o,r as B,bb as z}from"./iframe-Cxdv9pi7.js";import{c as Q}from"./utils-DW-IJACk.js";import{b as x}from"./RuntimeBar-jZXyUQiE.js";import{R as X}from"./RuntimeBarActions-wuj_H1ci.js";import"./preload-helper-DU1Q6aPJ.js";import"./effort-icons-BzPwm5YY.js";import"./duration-BuesBvhN.js";import"./runtime-mode-D62tngBZ.js";import"./button-CDUpBuy9.js";import"./index-CPURVhFy.js";import"./loading-BfmDh766.js";import"./InputField-B_j7RwED.js";import"./use-hotkey-CSUXaqCI.js";import"./SegmentedControl-hhBGtqdI.js";import"./Icon-TQmWXc2S.js";import"./DropdownMenu-Cqi-ljGX.js";import"./floating-ui.react-mjp4aH0C.js";import"./index-BRY3IRA4.js";import"./index-CkkiTvvU.js";import"./DropdownMenuSubmenu-P1llKkBa.js";import"./modalStack-C_WhG_d9.js";import"./zIndex-BGbNBNA8.js";import"./Combobox-B0h9NCBj.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-4MdiEeIE.js";const{expect:a,userEvent:l,within:n}=__STORYBOOK_MODULE_TEST__,b=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,contextWindow:2e5},{id:"anthropic/claude-opus-4-1",provider:"anthropic",label:"Claude Opus 4.1",reasoning:!0,configured:!0,contextWindow:2e5},{id:"openai/gpt-5-codex",provider:"openai",label:"GPT-5 Codex",reasoning:!0,configured:!0,contextWindow:4e5},{id:"openai/gpt-5-mini",provider:"openai",label:"GPT-5 mini",reasoning:!0,configured:!1,contextWindow:4e5}];function d({initial:e,variant:t="segmented",families:i,showTimeout:s=!1,showCost:r=!1}){const[c,Y]=B.useState(e);return o.jsxs("div",{className:"grid max-w-3xl gap-4 p-6",children:[o.jsx(x,{value:c,onChange:Y,models:b,families:i,variant:t,showTimeout:s,showCost:r}),o.jsx("pre",{className:"rounded-md border border-border bg-muted/30 p-3 font-mono text-xs text-muted-foreground",children:JSON.stringify(c,null,2)})]})}const Re={title:"AI/RuntimeBar",component:x,tags:["autodocs"],argTypes:{variant:{control:"inline-radio",options:["segmented","combo"]}},args:{variant:"segmented"},parameters:{layout:"fullscreen",docs:{description:{component:"The runtime as one self-describing control. The default segmented variant gives family, mode, model and reasoning effort their own menu triggers. The combo variant condenses the same values into one summary trigger and exposes direct controls in a single dropdown. Switching family keeps the current mode when the new family has it and drops a model the new provider cannot run. Unsupported modes and efforts stay visible but disabled, and the model can always be entered directly when the catalog does not describe it."}}},render:({variant:e})=>o.jsx(d,{initial:{mode:"agent"},variant:e})},u={},p={render:({variant:e})=>o.jsx(d,{variant:e,initial:{mode:"cli",model:"openai/gpt-5-codex",effort:"high"}})};function Z(){const[e,t]=B.useState({mode:"cli",model:"anthropic/claude-sonnet-4-6",effort:"medium",budget:{timeout:"30m",cost:2}});return o.jsx("div",{className:"w-80 max-w-full p-4",children:o.jsx(x,{value:e,onChange:t,models:b,showTimeout:!0,showCost:!0,ariaLabel:"Narrow runtime"})})}const g={args:{variant:"segmented"},render:()=>o.jsx(Z,{}),play:async({canvasElement:e})=>{const t=n(e).getByRole("group",{name:"Narrow runtime"}),i=t.querySelector("[data-runtime-bar-section=identity]"),s=t.querySelector("[data-runtime-bar-section=settings]");await a(s.getBoundingClientRect().top).toBeGreaterThan(i.getBoundingClientRect().top),await a(t.scrollWidth).toBe(t.clientWidth),await a(s.scrollWidth).toBe(s.clientWidth);for(const r of["Medium","30m","$2.00"]){const c=n(s).getByText(r);await a(c.scrollWidth).toBeLessThanOrEqual(c.clientWidth)}}};function f({inline:e}){const[t,i]=B.useState({mode:"cli",model:"anthropic/claude-sonnet-4-6",effort:"medium"});return o.jsx("div",{className:Q("p-4",e?"max-w-3xl":"w-80 max-w-full"),children:o.jsx(x,{value:t,onChange:i,models:b,ariaLabel:e?"Wide runtime":"Narrow runtime",actions:o.jsx(X,{inline:e,fields:[{id:"presets",label:"Presets",title:"Presets — Guardrails",caption:o.jsx("span",{className:"text-xs",children:"Presets 1"}),items:[{label:"Guardrails",onSelect:()=>{}}]}],menu:[{label:"Advanced",icon:z,onSelect:()=>{}}]})})})}const y={args:{variant:"segmented"},render:()=>o.jsxs("div",{className:"grid gap-4",children:[o.jsx(f,{inline:!0}),o.jsx(f,{inline:!1})]}),play:async({canvasElement:e})=>{const t=n(e),i=t.getByRole("group",{name:"Wide runtime"}),s=t.getByRole("group",{name:"Narrow runtime"});await a(n(i).getByTitle("Presets — Guardrails")).toBeInTheDocument(),await a(n(s).queryByTitle("Presets — Guardrails")).not.toBeInTheDocument(),await l.click(n(s).getByTitle("Runtime options"));const r=n(document.body).getAllByRole("menu")[0];await a(n(r).getAllByRole("menuitem").map(c=>c.textContent)).toEqual(["Presets","Advanced"])}},h={args:{variant:"combo"},render:({variant:e})=>o.jsx(d,{variant:e,initial:{mode:"cli",model:"openai/gpt-5-codex",effort:"high",budget:{timeout:"30m",cost:2}},showTimeout:!0,showCost:!0}),play:async({canvasElement:e})=>{const t=n(e),i=n(document.body),s=t.getByRole("button",{name:"Runtime: Codex, CLI, GPT-5 Codex, effort High, timeout 30m, max cost $2.00"});await l.click(s);const r=await i.findByRole("menu");await a(n(r).getByRole("radiogroup",{name:"Family"})).toBeInTheDocument(),await a(n(r).getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument(),await a(n(r).getByRole("slider",{name:"Reasoning effort"})).toHaveAttribute("aria-valuetext","High"),await a(n(r).getByLabelText("Model id")).toBeInTheDocument(),await a(n(r).getByLabelText("Timeout duration")).toHaveValue("30m"),await a(n(r).getByLabelText("Max cost (USD)")).toHaveValue("2");const c=n(r).getByRole("button",{name:"GPT-5 Codex"});await a(c).toHaveAttribute("title","openai/gpt-5-codex"),await a(c).not.toHaveTextContent("openai/gpt-5-codex"),await l.click(n(r).getByRole("radio",{name:"Claude"})),await a(t.getByRole("button",{name:"Runtime: Claude, CLI, Unspecified, effort High, timeout 30m, max cost $2.00"})).toBeInTheDocument(),await a(i.getByRole("menu")).toBeInTheDocument(),await a(n(r).getByRole("radio",{name:"API"})).toBeInTheDocument(),await l.keyboard("{Escape}"),await a(i.queryByRole("menu")).not.toBeInTheDocument()}},m={args:{variant:"segmented"},render:({variant:e})=>o.jsx(d,{initial:{mode:"api"},variant:e}),play:async({canvasElement:e})=>{const t=n(e);await l.click(t.getByTitle("Model — unspecified")),await l.type(await n(document.body).findByLabelText("Model id"),"gemini-3-pro"),await a(t.getByTitle("Model — gemini-3-pro")).toBeInTheDocument()}},w={args:{variant:"segmented"},render:({variant:e})=>o.jsx(d,{variant:e,initial:{mode:"cli",model:"anthropic/claude-opus-4-1"}}),play:async({canvasElement:e})=>{const t=n(e),i=n(document.body);await l.click(t.getByTitle("Family — Claude")),await l.click(await i.findByRole("menuitem",{name:/^Codex/})),await a(t.getByTitle("Codex CLI")).toHaveTextContent("CLI"),await a(t.getByTitle("Model — unspecified")).toBeInTheDocument()}},v={args:{variant:"segmented"},render:({variant:e})=>o.jsx(d,{initial:{mode:"agent"},variant:e,families:[{id:"claude",label:"Claude",provider:"anthropic",modes:[{id:"agent",label:"Agent",mode:"agent",title:"Claude Agent SDK"},{id:"cli",label:"CLI",mode:"cli",title:"Claude Code CLI"}]}]}),play:async({canvasElement:e})=>{const t=n(e),i=n(document.body);await l.click(t.getByTitle("Claude Agent SDK")),await a(i.queryByRole("menuitem",{name:/^API/})).not.toBeInTheDocument()}};var T,C,R;u.parameters={...u.parameters,docs:{...(T=u.parameters)==null?void 0:T.docs,source:{originalSource:"{}",...(R=(C=u.parameters)==null?void 0:C.docs)==null?void 0:R.source}}};var I,S,E;p.parameters={...p.parameters,docs:{...(I=p.parameters)==null?void 0:I.docs,source:{originalSource:`{
  render: ({
    variant
  }) => <RuntimeBarStory variant={variant} initial={{
    mode: "cli",
    model: "openai/gpt-5-codex",
    effort: "high"
  }} />
}`,...(E=(S=p.parameters)==null?void 0:S.docs)==null?void 0:E.source}}};var A,D,L;g.parameters={...g.parameters,docs:{...(A=g.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
    const identity = bar.querySelector("[data-runtime-bar-section=identity]");
    const settings = bar.querySelector("[data-runtime-bar-section=settings]");
    await expect(settings!.getBoundingClientRect().top).toBeGreaterThan(identity!.getBoundingClientRect().top);
    await expect(bar.scrollWidth).toBe(bar.clientWidth);
    await expect(settings!.scrollWidth).toBe(settings!.clientWidth);
    // A narrow bar must keep its limit values legible: the run settings give up
    // the static "Effort" key label rather than ellipsing "30m" or "$2.00".
    for (const caption of ["Medium", "30m", "$2.00"]) {
      const span = within(settings!).getByText(caption);
      await expect(span.scrollWidth).toBeLessThanOrEqual(span.clientWidth);
    }
  }
}`,...(L=(D=g.parameters)==null?void 0:D.docs)==null?void 0:L.source}}};var M,H,P;y.parameters={...y.parameters,docs:{...(M=y.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
    await expect(within(menu).getAllByRole("menuitem").map(item => item.textContent)).toEqual(["Presets", "Advanced"]);
  }
}`,...(P=(H=y.parameters)==null?void 0:H.docs)==null?void 0:P.source}}};var j,W,k;h.parameters={...h.parameters,docs:{...(j=h.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
    const trigger = canvas.getByRole("button", {
      name: "Runtime: Codex, CLI, GPT-5 Codex, effort High, timeout 30m, max cost $2.00"
    });
    await userEvent.click(trigger);
    const menu = await body.findByRole("menu");
    await expect(within(menu).getByRole("radiogroup", {
      name: "Family"
    })).toBeInTheDocument();
    await expect(within(menu).getByRole("radiogroup", {
      name: "Runtime mode"
    })).toBeInTheDocument();
    await expect(within(menu).getByRole("slider", {
      name: "Reasoning effort"
    })).toHaveAttribute("aria-valuetext", "High");
    await expect(within(menu).getByLabelText("Model id")).toBeInTheDocument();
    await expect(within(menu).getByLabelText("Timeout duration")).toHaveValue("30m");
    await expect(within(menu).getByLabelText("Max cost (USD)")).toHaveValue("2");
    const modelChoice = within(menu).getByRole("button", {
      name: "GPT-5 Codex"
    });
    await expect(modelChoice).toHaveAttribute("title", "openai/gpt-5-codex");
    await expect(modelChoice).not.toHaveTextContent("openai/gpt-5-codex");
    await userEvent.click(within(menu).getByRole("radio", {
      name: "Claude"
    }));
    await expect(canvas.getByRole("button", {
      name: "Runtime: Claude, CLI, Unspecified, effort High, timeout 30m, max cost $2.00"
    })).toBeInTheDocument();
    await expect(body.getByRole("menu")).toBeInTheDocument();

    // The canonical Claude family includes its hosted API runtime.
    await expect(within(menu).getByRole("radio", {
      name: "API"
    })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect(body.queryByRole("menu")).not.toBeInTheDocument();
  }
}`,...(k=(W=h.parameters)==null?void 0:W.docs)==null?void 0:k.source}}};var N,q,G,O,F;m.parameters={...m.parameters,docs:{...(N=m.parameters)==null?void 0:N.docs,source:{originalSource:`{
  // Pinned to exercise the standalone Model segment; Combo covers its equivalent
  // free-text field inside the main menu.
  args: {
    variant: "segmented"
  },
  render: ({
    variant
  }) => <RuntimeBarStory initial={{
    mode: "api"
  }} variant={variant} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTitle("Model — unspecified"));
    await userEvent.type(await within(document.body).findByLabelText("Model id"), "gemini-3-pro");
    await expect(canvas.getByTitle("Model — gemini-3-pro")).toBeInTheDocument();
  }
}`,...(G=(q=m.parameters)==null?void 0:q.docs)==null?void 0:G.source},description:{story:`A hosted-API family the catalog does not describe keeps model entry available
 as free text even when there are no catalog rows.`,...(F=(O=m.parameters)==null?void 0:O.docs)==null?void 0:F.description}}};var U,_,K;w.parameters={...w.parameters,docs:{...(U=w.parameters)==null?void 0:U.docs,source:{originalSource:`{
  // Pinned: the segment menus these interactions drive exist only in the
  // segmented variant; the combo variant exposes radios behind one trigger.
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
    await userEvent.click(canvas.getByTitle("Family — Claude"));
    await userEvent.click(await body.findByRole("menuitem", {
      name: /^Codex/
    }));

    // CLI survives the family switch; the Claude-only model does not.
    await expect(canvas.getByTitle("Codex CLI")).toHaveTextContent("CLI");
    await expect(canvas.getByTitle("Model — unspecified")).toBeInTheDocument();
  }
}`,...(K=(_=w.parameters)==null?void 0:_.docs)==null?void 0:K.source}}};var V,$,J;v.parameters={...v.parameters,docs:{...(V=v.parameters)==null?void 0:V.docs,source:{originalSource:`{
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
    await userEvent.click(canvas.getByTitle("Claude Agent SDK"));
    await expect(body.queryByRole("menuitem", {
      name: /^API/
    })).not.toBeInTheDocument();
  }
}`,...(J=($=v.parameters)==null?void 0:$.docs)==null?void 0:J.source}}};const Ie=["Default","WithModelAndEffort","NarrowContainer","HostActions","Combo","NoModelsForFamily","SwitchingFamilyKeepsTheMode","UnavailableModesAreOmitted"];export{h as Combo,u as Default,y as HostActions,g as NarrowContainer,m as NoModelsForFamily,w as SwitchingFamilyKeepsTheMode,v as UnavailableModesAreOmitted,p as WithModelAndEffort,Ie as __namedExportsOrder,Re as default};
