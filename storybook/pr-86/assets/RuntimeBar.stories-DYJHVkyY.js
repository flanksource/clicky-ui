import{j as o,r as x,bb as Y}from"./iframe-k78te_Hj.js";import{c as z}from"./utils-DW-IJACk.js";import{a as B}from"./RuntimeBar-BJ3L1PwZ.js";import{R as Q}from"./RuntimeBarActions-D6HWfbIA.js";import"./preload-helper-CcRYDqr-.js";import"./effort-icons-CUFKIHnQ.js";import"./runtime-mode-D3OVTX8Z.js";import"./button-DOHlwBT1.js";import"./index-CPURVhFy.js";import"./loading-J2lUy0bP.js";import"./SegmentedControl-C2zkwnpb.js";import"./Icon-BxFpjwAC.js";import"./DropdownMenu-BAtbfmxv.js";import"./floating-ui.react-CBq0PPGN.js";import"./index-BT2sJ_Ky.js";import"./index-BYV-uwhj.js";import"./DropdownMenuSubmenu-Bs7Mqmth.js";import"./modalStack-gX0DzNXp.js";import"./zIndex-BGbNBNA8.js";import"./InputField-Bv-3RSA1.js";import"./use-hotkey-BEWjsXan.js";const{expect:a,userEvent:c,within:n}=__STORYBOOK_MODULE_TEST__,b=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,contextWindow:2e5},{id:"anthropic/claude-opus-4-1",provider:"anthropic",label:"Claude Opus 4.1",reasoning:!0,configured:!0,contextWindow:2e5},{id:"openai/gpt-5-codex",provider:"openai",label:"GPT-5 Codex",reasoning:!0,configured:!0,contextWindow:4e5},{id:"openai/gpt-5-mini",provider:"openai",label:"GPT-5 mini",reasoning:!0,configured:!1,contextWindow:4e5}];function l({initial:e,variant:t="segmented",families:i}){const[s,r]=x.useState(e);return o.jsxs("div",{className:"grid max-w-3xl gap-4 p-6",children:[o.jsx(B,{value:s,onChange:r,models:b,families:i,variant:t}),o.jsx("pre",{className:"rounded-md border border-border bg-muted/30 p-3 font-mono text-xs text-muted-foreground",children:JSON.stringify(s,null,2)})]})}const xe={title:"AI/RuntimeBar",component:B,tags:["autodocs"],argTypes:{variant:{control:"inline-radio",options:["segmented","combo"]}},args:{variant:"segmented"},parameters:{layout:"fullscreen",docs:{description:{component:"The runtime as one self-describing control. The default segmented variant gives family, mode, model and reasoning effort their own menu triggers. The combo variant condenses the same values into one summary trigger and exposes direct controls in a single dropdown. Switching family keeps the current mode when the new family has it and drops a model the new provider cannot run. Unsupported modes and efforts stay visible but disabled, and the model can always be entered directly when the catalog does not describe it."}}},render:({variant:e})=>o.jsx(l,{initial:{mode:"agent"},variant:e})},u={},p={render:({variant:e})=>o.jsx(l,{variant:e,initial:{mode:"cli",model:"openai/gpt-5-codex",effort:"high"}})};function X(){const[e,t]=x.useState({mode:"cli",model:"anthropic/claude-sonnet-4-6",effort:"medium",budget:{timeout:"30m",cost:2}});return o.jsx("div",{className:"w-80 max-w-full p-4",children:o.jsx(B,{value:e,onChange:t,models:b,showTimeout:!0,showCost:!0,ariaLabel:"Narrow runtime"})})}const g={args:{variant:"segmented"},render:()=>o.jsx(X,{}),play:async({canvasElement:e})=>{const t=n(e).getByRole("group",{name:"Narrow runtime"}),i=t.querySelector("[data-runtime-bar-section=identity]"),s=t.querySelector("[data-runtime-bar-section=settings]");await a(s.getBoundingClientRect().top).toBeGreaterThan(i.getBoundingClientRect().top),await a(t.scrollWidth).toBe(t.clientWidth),await a(s.scrollWidth).toBe(s.clientWidth);for(const r of["Medium","30m","$2.00"]){const d=n(s).getByText(r);await a(d.scrollWidth).toBeLessThanOrEqual(d.clientWidth)}}};function f({inline:e}){const[t,i]=x.useState({mode:"cli",model:"anthropic/claude-sonnet-4-6",effort:"medium"});return o.jsx("div",{className:z("p-4",e?"max-w-3xl":"w-80 max-w-full"),children:o.jsx(B,{value:t,onChange:i,models:b,ariaLabel:e?"Wide runtime":"Narrow runtime",actions:o.jsx(Q,{inline:e,fields:[{id:"presets",label:"Presets",title:"Presets — Guardrails",caption:o.jsx("span",{className:"text-xs",children:"Presets 1"}),items:[{label:"Guardrails",onSelect:()=>{}}]}],menu:[{label:"Advanced",icon:Y,onSelect:()=>{}}]})})})}const y={args:{variant:"segmented"},render:()=>o.jsxs("div",{className:"grid gap-4",children:[o.jsx(f,{inline:!0}),o.jsx(f,{inline:!1})]}),play:async({canvasElement:e})=>{const t=n(e),i=t.getByRole("group",{name:"Wide runtime"}),s=t.getByRole("group",{name:"Narrow runtime"});await a(n(i).getByTitle("Presets — Guardrails")).toBeInTheDocument(),await a(n(s).queryByTitle("Presets — Guardrails")).not.toBeInTheDocument(),await c.click(n(s).getByTitle("Runtime options"));const r=n(document.body).getAllByRole("menu")[0];await a(n(r).getAllByRole("menuitem").map(d=>d.textContent)).toEqual(["Presets","Advanced"])}},h={args:{variant:"combo"},render:({variant:e})=>o.jsx(l,{variant:e,initial:{mode:"cli",model:"openai/gpt-5-codex",effort:"high"}}),play:async({canvasElement:e})=>{const t=n(e),i=n(document.body),s=t.getByRole("button",{name:"Runtime: Codex, CLI, GPT-5 Codex, effort High"});await c.click(s);const r=await i.findByRole("menu");await a(n(r).getByRole("radiogroup",{name:"Family"})).toBeInTheDocument(),await a(n(r).getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument(),await a(n(r).getByRole("slider",{name:"Reasoning effort"})).toHaveAttribute("aria-valuetext","High"),await a(n(r).queryByLabelText("Model id")).not.toBeInTheDocument();const d=n(r).getByRole("button",{name:"GPT-5 Codex"});await a(d).toHaveAttribute("title","openai/gpt-5-codex"),await a(d).not.toHaveTextContent("openai/gpt-5-codex"),await c.click(n(r).getByRole("radio",{name:"Claude"})),await a(t.getByRole("button",{name:"Runtime: Claude, CLI, Unspecified, effort High"})).toBeInTheDocument(),await a(i.getByRole("menu")).toBeInTheDocument(),await a(n(r).getByRole("radio",{name:"API"})).toBeInTheDocument(),await c.keyboard("{Escape}"),await a(i.queryByRole("menu")).not.toBeInTheDocument()}},m={args:{variant:"segmented"},render:({variant:e})=>o.jsx(l,{initial:{mode:"api"},variant:e}),play:async({canvasElement:e})=>{const t=n(e);await c.click(t.getByTitle("Model — unspecified")),await c.type(await n(document.body).findByLabelText("Model id"),"gemini-3-pro"),await a(t.getByTitle("Model — gemini-3-pro")).toBeInTheDocument()}},w={args:{variant:"segmented"},render:({variant:e})=>o.jsx(l,{variant:e,initial:{mode:"cli",model:"anthropic/claude-opus-4-1"}}),play:async({canvasElement:e})=>{const t=n(e),i=n(document.body);await c.click(t.getByTitle("Family — Claude")),await c.click(await i.findByRole("menuitem",{name:/^Codex/})),await a(t.getByTitle("Codex CLI")).toHaveTextContent("CLI"),await a(t.getByTitle("Model — unspecified")).toBeInTheDocument()}},v={args:{variant:"segmented"},render:({variant:e})=>o.jsx(l,{initial:{mode:"agent"},variant:e,families:[{id:"claude",label:"Claude",provider:"anthropic",modes:[{id:"agent",label:"Agent",mode:"agent",title:"Claude Agent SDK"},{id:"cli",label:"CLI",mode:"cli",title:"Claude Code CLI"}]}]}),play:async({canvasElement:e})=>{const t=n(e),i=n(document.body);await c.click(t.getByTitle("Claude Agent SDK")),await a(i.queryByRole("menuitem",{name:/^API/})).not.toBeInTheDocument()}};var T,C,R;u.parameters={...u.parameters,docs:{...(T=u.parameters)==null?void 0:T.docs,source:{originalSource:"{}",...(R=(C=u.parameters)==null?void 0:C.docs)==null?void 0:R.source}}};var I,S,E;p.parameters={...p.parameters,docs:{...(I=p.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(L=(D=g.parameters)==null?void 0:D.docs)==null?void 0:L.source}}};var M,P,j;y.parameters={...y.parameters,docs:{...(M=y.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
}`,...(j=(P=y.parameters)==null?void 0:P.docs)==null?void 0:j.source}}};var W,k,N;h.parameters={...h.parameters,docs:{...(W=h.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    variant: "combo"
  },
  render: ({
    variant
  }) => <RuntimeBarStory variant={variant} initial={{
    mode: "cli",
    model: "openai/gpt-5-codex",
    effort: "high"
  }} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole("button", {
      name: "Runtime: Codex, CLI, GPT-5 Codex, effort High"
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
    await expect(within(menu).queryByLabelText("Model id")).not.toBeInTheDocument();
    const modelChoice = within(menu).getByRole("button", {
      name: "GPT-5 Codex"
    });
    await expect(modelChoice).toHaveAttribute("title", "openai/gpt-5-codex");
    await expect(modelChoice).not.toHaveTextContent("openai/gpt-5-codex");
    await userEvent.click(within(menu).getByRole("radio", {
      name: "Claude"
    }));
    await expect(canvas.getByRole("button", {
      name: "Runtime: Claude, CLI, Unspecified, effort High"
    })).toBeInTheDocument();
    await expect(body.getByRole("menu")).toBeInTheDocument();

    // The canonical Claude family includes its hosted API runtime.
    await expect(within(menu).getByRole("radio", {
      name: "API"
    })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect(body.queryByRole("menu")).not.toBeInTheDocument();
  }
}`,...(N=(k=h.parameters)==null?void 0:k.docs)==null?void 0:N.source}}};var H,q,G,O,F;m.parameters={...m.parameters,docs:{...(H=m.parameters)==null?void 0:H.docs,source:{originalSource:`{
  // Pinned: the free-text model entry these interactions drive belongs to the
  // segmented variant; the combo variant renders no SpecInput.
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
}`,...(G=(q=m.parameters)==null?void 0:q.docs)==null?void 0:G.source},description:{story:`A hosted-API family the catalog does not describe keeps the Model segment;
 its menu offers the free-text entry alone.`,...(F=(O=m.parameters)==null?void 0:O.docs)==null?void 0:F.description}}};var _,K,U;w.parameters={...w.parameters,docs:{...(_=w.parameters)==null?void 0:_.docs,source:{originalSource:`{
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
}`,...(U=(K=w.parameters)==null?void 0:K.docs)==null?void 0:U.source}}};var V,$,J;v.parameters={...v.parameters,docs:{...(V=v.parameters)==null?void 0:V.docs,source:{originalSource:`{
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
}`,...(J=($=v.parameters)==null?void 0:$.docs)==null?void 0:J.source}}};const be=["Default","WithModelAndEffort","NarrowContainer","HostActions","Combo","NoModelsForFamily","SwitchingFamilyKeepsTheMode","UnavailableModesAreOmitted"];export{h as Combo,u as Default,y as HostActions,g as NarrowContainer,m as NoModelsForFamily,w as SwitchingFamilyKeepsTheMode,v as UnavailableModesAreOmitted,p as WithModelAndEffort,be as __namedExportsOrder,xe as default};
