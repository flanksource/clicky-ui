import{j as i,r as _}from"./iframe-DBr7zNeS.js";import{R as O}from"./RuntimeBar-KbUaLTvM.js";import"./preload-helper-DOqJbnTS.js";import"./effort-icons-tGl5GZg9.js";import"./button--5fQhbPU.js";import"./utils-CR52uffu.js";import"./index-0zBpNI7D.js";import"./loading-BPm7-hB-.js";import"./SegmentedControl-BUfs-Zk7.js";import"./Icon-BJt4CZDw.js";import"./DropdownMenu-QeSunhD0.js";import"./floating-ui.react-BCE0IOJT.js";import"./index-DBE-7TL_.js";import"./index-C-JF4fJV.js";import"./DropdownMenuSubmenu-XC3IPjqo.js";import"./modalStack-C6iTnFFa.js";import"./zIndex-CigQ76av.js";import"./runtime-mode-CKMKw80o.js";import"./InputField-CBmL5F0Y.js";import"./use-hotkey-CjwtYNM9.js";const{expect:t,userEvent:r,within:n}=__STORYBOOK_MODULE_TEST__,G=[{id:"claude-agent/claude-sonnet-4-6",provider:"claude-agent",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,contextWindow:2e5},{id:"claude-agent/claude-opus-4-1",provider:"claude-agent",label:"Claude Opus 4.1",reasoning:!0,configured:!0,contextWindow:2e5},{id:"codex-cli/gpt-5-codex",provider:"codex-cli",label:"GPT-5 Codex",reasoning:!0,configured:!0,contextWindow:4e5},{id:"codex-cli/gpt-5-mini",provider:"codex-cli",label:"GPT-5 mini",reasoning:!0,configured:!1,contextWindow:4e5}];function c({initial:e,variant:a="segmented"}){const[o,y]=_.useState(e);return i.jsxs("div",{className:"grid max-w-3xl gap-4 p-6",children:[i.jsx(O,{value:o,onChange:y,models:G,variant:a}),i.jsx("pre",{className:"rounded-md border border-border bg-muted/30 p-3 font-mono text-xs text-muted-foreground",children:JSON.stringify(o,null,2)})]})}const de={title:"AI/RuntimeBar",component:O,tags:["autodocs"],argTypes:{variant:{control:"inline-radio",options:["segmented","combo"]}},args:{variant:"segmented"},parameters:{layout:"fullscreen",docs:{description:{component:"The runtime as one self-describing control. The default segmented variant gives family, mode, model and reasoning effort their own menu triggers. The combo variant condenses the same values into one summary trigger and exposes direct controls in a single dropdown. Switching family keeps the current mode when the new family has it and drops a model the new provider cannot run. Unsupported modes and efforts stay visible but disabled, and the model can always be entered directly when the catalog does not describe it."}}},render:({variant:e})=>i.jsx(c,{initial:{backend:"claude-agent"},variant:e})},l={},m={render:({variant:e})=>i.jsx(c,{variant:e,initial:{backend:"codex-cli",model:"codex-cli/gpt-5-codex",effort:"high"}})},u={args:{variant:"combo"},render:({variant:e})=>i.jsx(c,{variant:e,initial:{backend:"codex-cli",model:"codex-cli/gpt-5-codex",effort:"high"}}),play:async({canvasElement:e})=>{const a=n(e),o=n(document.body),y=a.getByRole("button",{name:"Runtime: Codex, CLI, GPT-5 Codex, effort High"});await r.click(y);const d=await o.findByRole("menu");await t(n(d).getByRole("radiogroup",{name:"Family"})).toBeInTheDocument(),await t(n(d).getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument(),await t(n(d).getByRole("slider",{name:"Reasoning effort"})).toHaveAttribute("aria-valuetext","High"),await t(n(d).queryByLabelText("Model id")).not.toBeInTheDocument();const h=n(d).getByRole("button",{name:"GPT-5 Codex"});await t(h).toHaveAttribute("title","codex-cli/gpt-5-codex"),await t(h).not.toHaveTextContent("codex-cli/gpt-5-codex"),await r.click(n(d).getByRole("radio",{name:"Claude"})),await t(a.getByRole("button",{name:"Runtime: Claude, CLI, Prompt default, effort High"})).toBeInTheDocument(),await t(o.getByRole("menu")).toBeInTheDocument();const v=n(d).getByRole("radio",{name:"API"});await t(v).toBeDisabled(),await t(v).toHaveAttribute("title","not on Claude"),await r.keyboard("{Escape}"),await t(o.queryByRole("menu")).not.toBeInTheDocument()}},s={args:{variant:"segmented"},render:({variant:e})=>i.jsx(c,{initial:{backend:"gemini"},variant:e}),play:async({canvasElement:e})=>{const a=n(e);await r.click(a.getByTitle("Model — prompt default")),await r.type(await n(document.body).findByLabelText("Model id"),"gemini-3-pro"),await t(a.getByTitle("Model — gemini-3-pro")).toBeInTheDocument()}},p={args:{variant:"segmented"},render:({variant:e})=>i.jsx(c,{variant:e,initial:{backend:"claude-cli",model:"claude-agent/claude-opus-4-1"}}),play:async({canvasElement:e})=>{const a=n(e),o=n(document.body);await r.click(a.getByTitle("Family — Claude")),await r.click(await o.findByRole("menuitem",{name:/^Codex/})),await t(a.getByTitle("Codex CLI")).toHaveTextContent("CLI"),await t(a.getByTitle("Model — prompt default")).toBeInTheDocument()}},g={args:{variant:"segmented"},render:({variant:e})=>i.jsx(c,{initial:{backend:"claude-agent"},variant:e}),play:async({canvasElement:e})=>{const a=n(e),o=n(document.body);await r.click(a.getByTitle("Claude Agent SDK")),await t(await o.findByRole("menuitem",{name:/^API not on Claude/})).toBeDisabled()}};var w,x,b;l.parameters={...l.parameters,docs:{...(w=l.parameters)==null?void 0:w.docs,source:{originalSource:"{}",...(b=(x=l.parameters)==null?void 0:x.docs)==null?void 0:b.source}}};var B,f,T;m.parameters={...m.parameters,docs:{...(B=m.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: ({
    variant
  }) => <RuntimeBarStory variant={variant} initial={{
    backend: "codex-cli",
    model: "codex-cli/gpt-5-codex",
    effort: "high"
  }} />
}`,...(T=(f=m.parameters)==null?void 0:f.docs)==null?void 0:T.source}}};var C,R,I;u.parameters={...u.parameters,docs:{...(C=u.parameters)==null?void 0:C.docs,source:{originalSource:`{
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

    // Claude has no API mode: the segment stays visible but inert, worded the
    // same way the segmented variant words it.
    const api = within(menu).getByRole("radio", {
      name: "API"
    });
    await expect(api).toBeDisabled();
    await expect(api).toHaveAttribute("title", "not on Claude");
    await userEvent.keyboard("{Escape}");
    await expect(body.queryByRole("menu")).not.toBeInTheDocument();
  }
}`,...(I=(R=u.parameters)==null?void 0:R.docs)==null?void 0:I.source}}};var D,k,E,S,M;s.parameters={...s.parameters,docs:{...(D=s.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
 its menu offers the free-text entry alone.`,...(M=(S=s.parameters)==null?void 0:S.docs)==null?void 0:M.description}}};var A,P,H;p.parameters={...p.parameters,docs:{...(A=p.parameters)==null?void 0:A.docs,source:{originalSource:`{
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
}`,...(H=(P=p.parameters)==null?void 0:P.docs)==null?void 0:H.source}}};var L,j,F;g.parameters={...g.parameters,docs:{...(L=g.parameters)==null?void 0:L.docs,source:{originalSource:`{
  // Pinned: the disabled mode is a menuitem here and a radio in combo, which
  // the Combo story asserts instead.
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
    await expect(await body.findByRole("menuitem", {
      name: /^API not on Claude/
    })).toBeDisabled();
  }
}`,...(F=(j=g.parameters)==null?void 0:j.docs)==null?void 0:F.source}}};const ce=["Default","WithModelAndEffort","Combo","NoModelsForFamily","SwitchingFamilyKeepsTheMode","UnsupportedModesAreDisabled"];export{u as Combo,l as Default,s as NoModelsForFamily,p as SwitchingFamilyKeepsTheMode,g as UnsupportedModesAreDisabled,m as WithModelAndEffort,ce as __namedExportsOrder,de as default};
