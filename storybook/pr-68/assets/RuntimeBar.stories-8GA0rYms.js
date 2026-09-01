import{j as r,r as O}from"./iframe-9kVTKmJ0.js";import{R as F}from"./RuntimeBar-CjifDIg9.js";import"./preload-helper-95TtevsV.js";import"./effort-icons-C1r6X9G1.js";import"./runtime-mode-BlwqcOH8.js";import"./button-BPQ9SyIv.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-MkmNbgtg.js";import"./SegmentedControl-BHY99hW3.js";import"./Icon-CvI4mGjv.js";import"./DropdownMenu-BNM_4WBn.js";import"./floating-ui.react-BUMPLM4a.js";import"./index-Cr37FOZC.js";import"./index-BTeDEC8L.js";import"./DropdownMenuSubmenu-YGHNpTO4.js";import"./modalStack-CNqfYGm3.js";import"./zIndex-BGbNBNA8.js";import"./InputField-CcLJekT9.js";import"./use-hotkey-DDXZeNPd.js";const{expect:n,userEvent:d,within:t}=__STORYBOOK_MODULE_TEST__,_=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,contextWindow:2e5},{id:"anthropic/claude-opus-4-1",provider:"anthropic",label:"Claude Opus 4.1",reasoning:!0,configured:!0,contextWindow:2e5},{id:"openai/gpt-5-codex",provider:"openai",label:"GPT-5 Codex",reasoning:!0,configured:!0,contextWindow:4e5},{id:"openai/gpt-5-mini",provider:"openai",label:"GPT-5 mini",reasoning:!0,configured:!1,contextWindow:4e5}];function s({initial:e,variant:a="segmented",families:o}){const[m,i]=O.useState(e);return r.jsxs("div",{className:"grid max-w-3xl gap-4 p-6",children:[r.jsx(F,{value:m,onChange:i,models:_,families:o,variant:a}),r.jsx("pre",{className:"rounded-md border border-border bg-muted/30 p-3 font-mono text-xs text-muted-foreground",children:JSON.stringify(m,null,2)})]})}const re={title:"AI/RuntimeBar",component:F,tags:["autodocs"],argTypes:{variant:{control:"inline-radio",options:["segmented","combo"]}},args:{variant:"segmented"},parameters:{layout:"fullscreen",docs:{description:{component:"The runtime as one self-describing control. The default segmented variant gives family, mode, model and reasoning effort their own menu triggers. The combo variant condenses the same values into one summary trigger and exposes direct controls in a single dropdown. Switching family keeps the current mode when the new family has it and drops a model the new provider cannot run. Unsupported modes and efforts stay visible but disabled, and the model can always be entered directly when the catalog does not describe it."}}},render:({variant:e})=>r.jsx(s,{initial:{mode:"agent"},variant:e})},l={},u={render:({variant:e})=>r.jsx(s,{variant:e,initial:{mode:"cli",model:"openai/gpt-5-codex",effort:"high"}})},p={args:{variant:"combo"},render:({variant:e})=>r.jsx(s,{variant:e,initial:{mode:"cli",model:"openai/gpt-5-codex",effort:"high"}}),play:async({canvasElement:e})=>{const a=t(e),o=t(document.body),m=a.getByRole("button",{name:"Runtime: Codex, CLI, GPT-5 Codex, effort High"});await d.click(m);const i=await o.findByRole("menu");await n(t(i).getByRole("radiogroup",{name:"Family"})).toBeInTheDocument(),await n(t(i).getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument(),await n(t(i).getByRole("slider",{name:"Reasoning effort"})).toHaveAttribute("aria-valuetext","High"),await n(t(i).queryByLabelText("Model id")).not.toBeInTheDocument();const h=t(i).getByRole("button",{name:"GPT-5 Codex"});await n(h).toHaveAttribute("title","openai/gpt-5-codex"),await n(h).not.toHaveTextContent("openai/gpt-5-codex"),await d.click(t(i).getByRole("radio",{name:"Claude"})),await n(a.getByRole("button",{name:"Runtime: Claude, CLI, Prompt default, effort High"})).toBeInTheDocument(),await n(o.getByRole("menu")).toBeInTheDocument(),await n(t(i).getByRole("radio",{name:"API"})).toBeInTheDocument(),await d.keyboard("{Escape}"),await n(o.queryByRole("menu")).not.toBeInTheDocument()}},c={args:{variant:"segmented"},render:({variant:e})=>r.jsx(s,{initial:{mode:"api"},variant:e}),play:async({canvasElement:e})=>{const a=t(e);await d.click(a.getByTitle("Model — prompt default")),await d.type(await t(document.body).findByLabelText("Model id"),"gemini-3-pro"),await n(a.getByTitle("Model — gemini-3-pro")).toBeInTheDocument()}},g={args:{variant:"segmented"},render:({variant:e})=>r.jsx(s,{variant:e,initial:{mode:"cli",model:"anthropic/claude-opus-4-1"}}),play:async({canvasElement:e})=>{const a=t(e),o=t(document.body);await d.click(a.getByTitle("Family — Claude")),await d.click(await o.findByRole("menuitem",{name:/^Codex/})),await n(a.getByTitle("Codex CLI")).toHaveTextContent("CLI"),await n(a.getByTitle("Model — prompt default")).toBeInTheDocument()}},y={args:{variant:"segmented"},render:({variant:e})=>r.jsx(s,{initial:{mode:"agent"},variant:e,families:[{id:"claude",label:"Claude",provider:"anthropic",modes:[{id:"agent",label:"Agent",mode:"agent",title:"Claude Agent SDK"},{id:"cli",label:"CLI",mode:"cli",title:"Claude Code CLI"}]}]}),play:async({canvasElement:e})=>{const a=t(e),o=t(document.body);await d.click(a.getByTitle("Claude Agent SDK")),await n(o.queryByRole("menuitem",{name:/^API/})).not.toBeInTheDocument()}};var v,w,x;l.parameters={...l.parameters,docs:{...(v=l.parameters)==null?void 0:v.docs,source:{originalSource:"{}",...(x=(w=l.parameters)==null?void 0:w.docs)==null?void 0:x.source}}};var B,f,b;u.parameters={...u.parameters,docs:{...(B=u.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: ({
    variant
  }) => <RuntimeBarStory variant={variant} initial={{
    mode: "cli",
    model: "openai/gpt-5-codex",
    effort: "high"
  }} />
}`,...(b=(f=u.parameters)==null?void 0:f.docs)==null?void 0:b.source}}};var T,C,R;p.parameters={...p.parameters,docs:{...(T=p.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(R=(C=p.parameters)==null?void 0:C.docs)==null?void 0:R.source}}};var I,D,E,S,A;c.parameters={...c.parameters,docs:{...(I=c.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(E=(D=c.parameters)==null?void 0:D.docs)==null?void 0:E.source},description:{story:`A hosted-API family the catalog does not describe keeps the Model segment;
 its menu offers the free-text entry alone.`,...(A=(S=c.parameters)==null?void 0:S.docs)==null?void 0:A.description}}};var M,L,k;g.parameters={...g.parameters,docs:{...(M=g.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
}`,...(k=(L=g.parameters)==null?void 0:L.docs)==null?void 0:k.source}}};var P,H,j;y.parameters={...y.parameters,docs:{...(P=y.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
}`,...(j=(H=y.parameters)==null?void 0:H.docs)==null?void 0:j.source}}};const de=["Default","WithModelAndEffort","Combo","NoModelsForFamily","SwitchingFamilyKeepsTheMode","UnavailableModesAreOmitted"];export{p as Combo,l as Default,c as NoModelsForFamily,g as SwitchingFamilyKeepsTheMode,y as UnavailableModesAreOmitted,u as WithModelAndEffort,de as __namedExportsOrder,re as default};
