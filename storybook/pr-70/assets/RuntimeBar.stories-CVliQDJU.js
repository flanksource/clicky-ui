import{j as i,r as O}from"./iframe-CiHj_drq.js";import{R as F}from"./RuntimeBar-DekRUMbi.js";import"./preload-helper-C9Uksf5K.js";import"./effort-icons-BVCJvYV7.js";import"./button-CF8Oad92.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CvQxXIfs.js";import"./SegmentedControl-46VZUa35.js";import"./Icon-B8CHvJLE.js";import"./DropdownMenu-DKU5huRk.js";import"./floating-ui.react-CdsFUqBP.js";import"./index-D-c_5Z52.js";import"./index-BTP8oBdU.js";import"./DropdownMenuSubmenu-BhgkJeya.js";import"./modalStack-BxawZIg3.js";import"./zIndex-BGbNBNA8.js";import"./runtime-mode-CG7tshgc.js";import"./InputField-BtK-uyCB.js";import"./use-hotkey-BxIDO_1W.js";const{expect:n,userEvent:r,within:t}=__STORYBOOK_MODULE_TEST__,q=[{id:"claude-agent/claude-sonnet-4-6",provider:"claude-agent",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,contextWindow:2e5},{id:"claude-agent/claude-opus-4-1",provider:"claude-agent",label:"Claude Opus 4.1",reasoning:!0,configured:!0,contextWindow:2e5},{id:"codex-cli/gpt-5-codex",provider:"codex-cli",label:"GPT-5 Codex",reasoning:!0,configured:!0,contextWindow:4e5},{id:"codex-cli/gpt-5-mini",provider:"codex-cli",label:"GPT-5 mini",reasoning:!0,configured:!1,contextWindow:4e5}];function d({initial:e,variant:a="segmented"}){const[o,y]=O.useState(e);return i.jsxs("div",{className:"grid max-w-3xl gap-4 p-6",children:[i.jsx(F,{value:o,onChange:y,models:q,variant:a}),i.jsx("pre",{className:"rounded-md border border-border bg-muted/30 p-3 font-mono text-xs text-muted-foreground",children:JSON.stringify(o,null,2)})]})}const re={title:"AI/RuntimeBar",component:F,tags:["autodocs"],argTypes:{variant:{control:"inline-radio",options:["segmented","combo"]}},args:{variant:"segmented"},parameters:{layout:"fullscreen",docs:{description:{component:"The runtime as one self-describing control. The default segmented variant gives family, mode, model and reasoning effort their own menu triggers. The combo variant condenses the same values into one summary trigger and exposes direct controls in a single dropdown. Switching family keeps the current mode when the new family has it and drops a model the new provider cannot run. Unsupported modes and efforts stay visible but disabled, and the model can always be entered directly when the catalog does not describe it."}}},render:({variant:e})=>i.jsx(d,{initial:{backend:"claude-agent"},variant:e})},l={},m={render:({variant:e})=>i.jsx(d,{variant:e,initial:{backend:"codex-cli",model:"codex-cli/gpt-5-codex",effort:"high"}})},u={args:{variant:"combo"},render:({variant:e})=>i.jsx(d,{variant:e,initial:{backend:"codex-cli",model:"codex-cli/gpt-5-codex",effort:"high"}}),play:async({canvasElement:e})=>{const a=t(e),o=t(document.body),y=a.getByRole("button",{name:"Runtime: Codex, CLI, GPT-5 Codex, effort High"});await r.click(y);const c=await o.findByRole("menu");await n(t(c).getByRole("radiogroup",{name:"Family"})).toBeInTheDocument(),await n(t(c).getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument(),await n(t(c).getByRole("slider",{name:"Reasoning effort"})).toHaveAttribute("aria-valuetext","High"),await n(t(c).queryByLabelText("Model id")).not.toBeInTheDocument();const h=t(c).getByRole("button",{name:"GPT-5 Codex"});await n(h).toHaveAttribute("title","codex-cli/gpt-5-codex"),await n(h).not.toHaveTextContent("codex-cli/gpt-5-codex"),await r.click(t(c).getByRole("radio",{name:"Claude"})),await n(a.getByRole("button",{name:"Runtime: Claude, CLI, Prompt default, effort High"})).toBeInTheDocument(),await n(o.getByRole("menu")).toBeInTheDocument(),await n(t(c).queryByRole("radio",{name:"API"})).not.toBeInTheDocument(),await r.keyboard("{Escape}"),await n(o.queryByRole("menu")).not.toBeInTheDocument()}},s={args:{variant:"segmented"},render:({variant:e})=>i.jsx(d,{initial:{backend:"gemini"},variant:e}),play:async({canvasElement:e})=>{const a=t(e);await r.click(a.getByTitle("Model — prompt default")),await r.type(await t(document.body).findByLabelText("Model id"),"gemini-3-pro"),await n(a.getByTitle("Model — gemini-3-pro")).toBeInTheDocument()}},g={args:{variant:"segmented"},render:({variant:e})=>i.jsx(d,{variant:e,initial:{backend:"claude-cli",model:"claude-agent/claude-opus-4-1"}}),play:async({canvasElement:e})=>{const a=t(e),o=t(document.body);await r.click(a.getByTitle("Family — Claude")),await r.click(await o.findByRole("menuitem",{name:/^Codex/})),await n(a.getByTitle("Codex CLI")).toHaveTextContent("CLI"),await n(a.getByTitle("Model — prompt default")).toBeInTheDocument()}},p={args:{variant:"segmented"},render:({variant:e})=>i.jsx(d,{initial:{backend:"claude-agent"},variant:e}),play:async({canvasElement:e})=>{const a=t(e),o=t(document.body);await r.click(a.getByTitle("Claude Agent SDK")),await n(o.queryByRole("menuitem",{name:/^API/})).not.toBeInTheDocument()}};var v,x,w;l.parameters={...l.parameters,docs:{...(v=l.parameters)==null?void 0:v.docs,source:{originalSource:"{}",...(w=(x=l.parameters)==null?void 0:x.docs)==null?void 0:w.source}}};var b,B,f;m.parameters={...m.parameters,docs:{...(b=m.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: ({
    variant
  }) => <RuntimeBarStory variant={variant} initial={{
    backend: "codex-cli",
    model: "codex-cli/gpt-5-codex",
    effort: "high"
  }} />
}`,...(f=(B=m.parameters)==null?void 0:B.docs)==null?void 0:f.source}}};var T,R,C;u.parameters={...u.parameters,docs:{...(T=u.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    variant: "combo"
  },
  render: ({
    variant
  }) => <RuntimeBarStory variant={variant} initial={{
    backend: "codex-cli",
    model: "codex-cli/gpt-5-codex",
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
    await expect(modelChoice).toHaveAttribute("title", "codex-cli/gpt-5-codex");
    await expect(modelChoice).not.toHaveTextContent("codex-cli/gpt-5-codex");
    await userEvent.click(within(menu).getByRole("radio", {
      name: "Claude"
    }));
    await expect(canvas.getByRole("button", {
      name: "Runtime: Claude, CLI, Prompt default, effort High"
    })).toBeInTheDocument();
    await expect(body.getByRole("menu")).toBeInTheDocument();

    // Claude has no API mode, so the unavailable choice is omitted.
    await expect(within(menu).queryByRole("radio", {
      name: "API"
    })).not.toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect(body.queryByRole("menu")).not.toBeInTheDocument();
  }
}`,...(C=(R=u.parameters)==null?void 0:R.docs)==null?void 0:C.source}}};var I,k,E,D,S;s.parameters={...s.parameters,docs:{...(I=s.parameters)==null?void 0:I.docs,source:{originalSource:`{
  // Pinned: the free-text model entry these interactions drive belongs to the
  // segmented variant; the combo variant renders no SpecInput.
  args: {
    variant: "segmented"
  },
  render: ({
    variant
  }) => <RuntimeBarStory initial={{
    backend: "gemini"
  }} variant={variant} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTitle("Model — prompt default"));
    await userEvent.type(await within(document.body).findByLabelText("Model id"), "gemini-3-pro");
    await expect(canvas.getByTitle("Model — gemini-3-pro")).toBeInTheDocument();
  }
}`,...(E=(k=s.parameters)==null?void 0:k.docs)==null?void 0:E.source},description:{story:`A hosted-API family the catalog does not describe keeps the Model segment;
 its menu offers the free-text entry alone.`,...(S=(D=s.parameters)==null?void 0:D.docs)==null?void 0:S.description}}};var M,A,P;g.parameters={...g.parameters,docs:{...(M=g.parameters)==null?void 0:M.docs,source:{originalSource:`{
  // Pinned: the segment menus these interactions drive exist only in the
  // segmented variant; the combo variant exposes radios behind one trigger.
  args: {
    variant: "segmented"
  },
  render: ({
    variant
  }) => <RuntimeBarStory variant={variant} initial={{
    backend: "claude-cli",
    model: "claude-agent/claude-opus-4-1"
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
}`,...(P=(A=g.parameters)==null?void 0:A.docs)==null?void 0:P.source}}};var L,H,j;p.parameters={...p.parameters,docs:{...(L=p.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    variant: "segmented"
  },
  render: ({
    variant
  }) => <RuntimeBarStory initial={{
    backend: "claude-agent"
  }} variant={variant} />,
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
}`,...(j=(H=p.parameters)==null?void 0:H.docs)==null?void 0:j.source}}};const ce=["Default","WithModelAndEffort","Combo","NoModelsForFamily","SwitchingFamilyKeepsTheMode","UnavailableModesAreOmitted"];export{u as Combo,l as Default,s as NoModelsForFamily,g as SwitchingFamilyKeepsTheMode,p as UnavailableModesAreOmitted,m as WithModelAndEffort,ce as __namedExportsOrder,re as default};
