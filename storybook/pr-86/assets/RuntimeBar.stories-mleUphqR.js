import{j as o,r as G}from"./iframe-v660Eh3J.js";import{R as v}from"./RuntimeBar-DoUV52Eq.js";import"./preload-helper-CcRYDqr-.js";import"./effort-icons-C-n8b4oA.js";import"./runtime-mode-Dg41tnhY.js";import"./button-DaO-3A-f.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CqVpLPQc.js";import"./SegmentedControl-DvkOonxf.js";import"./Icon-pN7oW891.js";import"./DropdownMenu-Dz35ZXNZ.js";import"./floating-ui.react-BcxH6J4B.js";import"./index-BTij907j.js";import"./index-De58Dh1Z.js";import"./DropdownMenuSubmenu-BteaieKF.js";import"./modalStack-SZlRUvIz.js";import"./zIndex-BGbNBNA8.js";import"./InputField-CLMejZn6.js";import"./use-hotkey-BzoS-M3B.js";const{expect:n,userEvent:s,within:a}=__STORYBOOK_MODULE_TEST__,_=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,contextWindow:2e5},{id:"anthropic/claude-opus-4-1",provider:"anthropic",label:"Claude Opus 4.1",reasoning:!0,configured:!0,contextWindow:2e5},{id:"openai/gpt-5-codex",provider:"openai",label:"GPT-5 Codex",reasoning:!0,configured:!0,contextWindow:4e5},{id:"openai/gpt-5-mini",provider:"openai",label:"GPT-5 mini",reasoning:!0,configured:!1,contextWindow:4e5}];function c({initial:e,variant:t="segmented",families:i}){const[d,r]=G.useState(e);return o.jsxs("div",{className:"grid max-w-3xl gap-4 p-6",children:[o.jsx(v,{value:d,onChange:r,models:_,families:i,variant:t}),o.jsx("pre",{className:"rounded-md border border-border bg-muted/30 p-3 font-mono text-xs text-muted-foreground",children:JSON.stringify(d,null,2)})]})}const le={title:"AI/RuntimeBar",component:v,tags:["autodocs"],argTypes:{variant:{control:"inline-radio",options:["segmented","combo"]}},args:{variant:"segmented"},parameters:{layout:"fullscreen",docs:{description:{component:"The runtime as one self-describing control. The default segmented variant gives family, mode, model and reasoning effort their own menu triggers. The combo variant condenses the same values into one summary trigger and exposes direct controls in a single dropdown. Switching family keeps the current mode when the new family has it and drops a model the new provider cannot run. Unsupported modes and efforts stay visible but disabled, and the model can always be entered directly when the catalog does not describe it."}}},render:({variant:e})=>o.jsx(c,{initial:{mode:"agent"},variant:e})},l={},u={render:({variant:e})=>o.jsx(c,{variant:e,initial:{mode:"cli",model:"openai/gpt-5-codex",effort:"high"}})};function K(){const[e,t]=G.useState({mode:"cli",model:"anthropic/claude-sonnet-4-6",effort:"medium",budget:{timeout:"30m",cost:2}});return o.jsx("div",{className:"w-80 max-w-full p-4",children:o.jsx(v,{value:e,onChange:t,models:_,showTimeout:!0,showCost:!0,ariaLabel:"Narrow runtime"})})}const p={args:{variant:"segmented"},render:()=>o.jsx(K,{}),play:async({canvasElement:e})=>{const t=a(e).getByRole("group",{name:"Narrow runtime"}),i=t.querySelector("[data-runtime-bar-section=identity]"),d=t.querySelector("[data-runtime-bar-section=settings]");await n(d.getBoundingClientRect().top).toBeGreaterThan(i.getBoundingClientRect().top),await n(t.scrollWidth).toBe(t.clientWidth)}},g={args:{variant:"combo"},render:({variant:e})=>o.jsx(c,{variant:e,initial:{mode:"cli",model:"openai/gpt-5-codex",effort:"high"}}),play:async({canvasElement:e})=>{const t=a(e),i=a(document.body),d=t.getByRole("button",{name:"Runtime: Codex, CLI, GPT-5 Codex, effort High"});await s.click(d);const r=await i.findByRole("menu");await n(a(r).getByRole("radiogroup",{name:"Family"})).toBeInTheDocument(),await n(a(r).getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument(),await n(a(r).getByRole("slider",{name:"Reasoning effort"})).toHaveAttribute("aria-valuetext","High"),await n(a(r).queryByLabelText("Model id")).not.toBeInTheDocument();const w=a(r).getByRole("button",{name:"GPT-5 Codex"});await n(w).toHaveAttribute("title","openai/gpt-5-codex"),await n(w).not.toHaveTextContent("openai/gpt-5-codex"),await s.click(a(r).getByRole("radio",{name:"Claude"})),await n(t.getByRole("button",{name:"Runtime: Claude, CLI, Prompt default, effort High"})).toBeInTheDocument(),await n(i.getByRole("menu")).toBeInTheDocument(),await n(a(r).getByRole("radio",{name:"API"})).toBeInTheDocument(),await s.keyboard("{Escape}"),await n(i.queryByRole("menu")).not.toBeInTheDocument()}},m={args:{variant:"segmented"},render:({variant:e})=>o.jsx(c,{initial:{mode:"api"},variant:e}),play:async({canvasElement:e})=>{const t=a(e);await s.click(t.getByTitle("Model — prompt default")),await s.type(await a(document.body).findByLabelText("Model id"),"gemini-3-pro"),await n(t.getByTitle("Model — gemini-3-pro")).toBeInTheDocument()}},y={args:{variant:"segmented"},render:({variant:e})=>o.jsx(c,{variant:e,initial:{mode:"cli",model:"anthropic/claude-opus-4-1"}}),play:async({canvasElement:e})=>{const t=a(e),i=a(document.body);await s.click(t.getByTitle("Family — Claude")),await s.click(await i.findByRole("menuitem",{name:/^Codex/})),await n(t.getByTitle("Codex CLI")).toHaveTextContent("CLI"),await n(t.getByTitle("Model — prompt default")).toBeInTheDocument()}},h={args:{variant:"segmented"},render:({variant:e})=>o.jsx(c,{initial:{mode:"agent"},variant:e,families:[{id:"claude",label:"Claude",provider:"anthropic",modes:[{id:"agent",label:"Agent",mode:"agent",title:"Claude Agent SDK"},{id:"cli",label:"CLI",mode:"cli",title:"Claude Code CLI"}]}]}),play:async({canvasElement:e})=>{const t=a(e),i=a(document.body);await s.click(t.getByTitle("Claude Agent SDK")),await n(i.queryByRole("menuitem",{name:/^API/})).not.toBeInTheDocument()}};var B,b,x;l.parameters={...l.parameters,docs:{...(B=l.parameters)==null?void 0:B.docs,source:{originalSource:"{}",...(x=(b=l.parameters)==null?void 0:b.docs)==null?void 0:x.source}}};var f,C,T;u.parameters={...u.parameters,docs:{...(f=u.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: ({
    variant
  }) => <RuntimeBarStory variant={variant} initial={{
    mode: "cli",
    model: "openai/gpt-5-codex",
    effort: "high"
  }} />
}`,...(T=(C=u.parameters)==null?void 0:C.docs)==null?void 0:T.source}}};var R,I,S;p.parameters={...p.parameters,docs:{...(R=p.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
  }
}`,...(S=(I=p.parameters)==null?void 0:I.docs)==null?void 0:S.source}}};var E,D,A;g.parameters={...g.parameters,docs:{...(E=g.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
      name: "Runtime: Claude, CLI, Prompt default, effort High"
    })).toBeInTheDocument();
    await expect(body.getByRole("menu")).toBeInTheDocument();

    // The canonical Claude family includes its hosted API runtime.
    await expect(within(menu).getByRole("radio", {
      name: "API"
    })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect(body.queryByRole("menu")).not.toBeInTheDocument();
  }
}`,...(A=(D=g.parameters)==null?void 0:D.docs)==null?void 0:A.source}}};var M,L,k,P,j;m.parameters={...m.parameters,docs:{...(M=m.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
    await userEvent.click(canvas.getByTitle("Model — prompt default"));
    await userEvent.type(await within(document.body).findByLabelText("Model id"), "gemini-3-pro");
    await expect(canvas.getByTitle("Model — gemini-3-pro")).toBeInTheDocument();
  }
}`,...(k=(L=m.parameters)==null?void 0:L.docs)==null?void 0:k.source},description:{story:`A hosted-API family the catalog does not describe keeps the Model segment;
 its menu offers the free-text entry alone.`,...(j=(P=m.parameters)==null?void 0:P.docs)==null?void 0:j.description}}};var H,N,q;y.parameters={...y.parameters,docs:{...(H=y.parameters)==null?void 0:H.docs,source:{originalSource:`{
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
    await expect(canvas.getByTitle("Model — prompt default")).toBeInTheDocument();
  }
}`,...(q=(N=y.parameters)==null?void 0:N.docs)==null?void 0:q.source}}};var F,O,W;h.parameters={...h.parameters,docs:{...(F=h.parameters)==null?void 0:F.docs,source:{originalSource:`{
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
}`,...(W=(O=h.parameters)==null?void 0:O.docs)==null?void 0:W.source}}};const ue=["Default","WithModelAndEffort","NarrowContainer","Combo","NoModelsForFamily","SwitchingFamilyKeepsTheMode","UnavailableModesAreOmitted"];export{g as Combo,l as Default,p as NarrowContainer,m as NoModelsForFamily,y as SwitchingFamilyKeepsTheMode,h as UnavailableModesAreOmitted,u as WithModelAndEffort,ue as __namedExportsOrder,le as default};
