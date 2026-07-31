import{j as i,r as O}from"./iframe-BxSHt6am.js";import{R as F}from"./RuntimeBar-Dx1466sc.js";import"./preload-helper-CMdjLrOk.js";import"./utils-CR52uffu.js";import"./DropdownMenu-CDSlUuAS.js";import"./floating-ui.react-Dx5zIT9R.js";import"./index-C7qnLePO.js";import"./index-BfNp2C0W.js";import"./button-BQC6J4zs.js";import"./index-0zBpNI7D.js";import"./loading-BVbt5uSK.js";import"./Icon-69Sjv527.js";import"./DropdownMenuSubmenu-C85W3XG-.js";import"./modalStack-Btv7ibBQ.js";import"./zIndex-CigQ76av.js";import"./effort-icons-C331W06i.js";import"./SegmentedControl-CJn_8XKa.js";import"./runtime-mode-BwQuNoeY.js";import"./InputField-D-07Ewn2.js";import"./use-hotkey-BofFMzwz.js";import"./Switch-iCQ0G2Sx.js";const{expect:a,userEvent:r,within:t}=__STORYBOOK_MODULE_TEST__,_=[{id:"claude-agent/claude-sonnet-4-6",provider:"claude-agent",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,contextWindow:2e5},{id:"claude-agent/claude-opus-4-1",provider:"claude-agent",label:"Claude Opus 4.1",reasoning:!0,configured:!0,contextWindow:2e5},{id:"codex-cli/gpt-5-codex",provider:"codex-cli",label:"GPT-5 Codex",reasoning:!0,configured:!0,contextWindow:4e5},{id:"codex-cli/gpt-5-mini",provider:"codex-cli",label:"GPT-5 mini",reasoning:!0,configured:!1,contextWindow:4e5}];function d({initial:e,variant:n="segmented"}){const[o,y]=O.useState(e);return i.jsxs("div",{className:"grid max-w-3xl gap-4 p-6",children:[i.jsx(F,{value:o,onChange:y,models:_,variant:n}),i.jsx("pre",{className:"rounded-md border border-border bg-muted/30 p-3 font-mono text-xs text-muted-foreground",children:JSON.stringify(o,null,2)})]})}const ce={title:"AI/RuntimeBar",component:F,tags:["autodocs"],argTypes:{variant:{control:"inline-radio",options:["segmented","combo"]}},args:{variant:"segmented"},parameters:{layout:"fullscreen",docs:{description:{component:"The runtime as one self-describing control. The default segmented variant gives family, mode, model and reasoning effort their own menu triggers. The combo variant condenses the same values into one summary trigger and exposes direct controls in a single dropdown. Switching family keeps the current mode when the new family has it and drops a model the new provider cannot run. Unsupported modes and efforts stay visible but disabled, and the model can always be entered directly when the catalog does not describe it."}}},render:({variant:e})=>i.jsx(d,{initial:{backend:"claude-agent"},variant:e})},l={},m={render:({variant:e})=>i.jsx(d,{variant:e,initial:{backend:"codex-cli",model:"codex-cli/gpt-5-codex",effort:"high"}})},u={args:{variant:"combo"},render:({variant:e})=>i.jsx(d,{variant:e,initial:{backend:"codex-cli",model:"codex-cli/gpt-5-codex",effort:"high"}}),play:async({canvasElement:e})=>{const n=t(e),o=t(document.body),y=n.getByRole("button",{name:"Runtime: Codex, CLI, GPT-5 Codex, effort High"});await r.click(y);const c=await o.findByRole("menu");await a(t(c).getByRole("radiogroup",{name:"Family"})).toBeInTheDocument(),await a(t(c).getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument(),await a(t(c).getByRole("slider",{name:"Reasoning effort"})).toHaveAttribute("aria-valuetext","High"),await a(t(c).queryByLabelText("Model id")).not.toBeInTheDocument();const x=t(c).getByRole("button",{name:"GPT-5 Codex"});await a(x).toHaveAttribute("title","codex-cli/gpt-5-codex"),await a(x).not.toHaveTextContent("codex-cli/gpt-5-codex"),await r.click(t(c).getByRole("radio",{name:"Claude"})),await a(n.getByRole("button",{name:"Runtime: Claude, CLI, Prompt default, effort High"})).toBeInTheDocument(),await a(o.getByRole("menu")).toBeInTheDocument(),await r.keyboard("{Escape}"),await a(o.queryByRole("menu")).not.toBeInTheDocument()}},s={render:({variant:e})=>i.jsx(d,{initial:{backend:"gemini"},variant:e}),play:async({canvasElement:e})=>{const n=t(e);await r.click(n.getByTitle("Model — prompt default")),await r.type(await t(document.body).findByLabelText("Model id"),"gemini-3-pro"),await a(n.getByTitle("Model — gemini-3-pro")).toBeInTheDocument()}},p={render:({variant:e})=>i.jsx(d,{variant:e,initial:{backend:"claude-cli",model:"claude-agent/claude-opus-4-1"}}),play:async({canvasElement:e})=>{const n=t(e),o=t(document.body);await r.click(n.getByTitle("Family — Claude")),await r.click(await o.findByRole("menuitem",{name:/^Codex/})),await a(n.getByTitle("Codex CLI")).toHaveTextContent("CLI"),await a(n.getByTitle("Model — prompt default")).toBeInTheDocument()}},g={render:({variant:e})=>i.jsx(d,{initial:{backend:"claude-agent"},variant:e}),play:async({canvasElement:e})=>{const n=t(e),o=t(document.body);await r.click(n.getByTitle("Claude Agent SDK")),await a(await o.findByRole("menuitem",{name:/^API not on Claude/})).toBeDisabled()}};var w,h,v;l.parameters={...l.parameters,docs:{...(w=l.parameters)==null?void 0:w.docs,source:{originalSource:"{}",...(v=(h=l.parameters)==null?void 0:h.docs)==null?void 0:v.source}}};var b,f,B;m.parameters={...m.parameters,docs:{...(b=m.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: ({
    variant
  }) => <RuntimeBarStory variant={variant} initial={{
    backend: "codex-cli",
    model: "codex-cli/gpt-5-codex",
    effort: "high"
  }} />
}`,...(B=(f=m.parameters)==null?void 0:f.docs)==null?void 0:B.source}}};var T,C,R;u.parameters={...u.parameters,docs:{...(T=u.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
    await userEvent.keyboard("{Escape}");
    await expect(body.queryByRole("menu")).not.toBeInTheDocument();
  }
}`,...(R=(C=u.parameters)==null?void 0:C.docs)==null?void 0:R.source}}};var I,k,E,D,S;s.parameters={...s.parameters,docs:{...(I=s.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
 its menu offers the free-text entry alone.`,...(S=(D=s.parameters)==null?void 0:D.docs)==null?void 0:S.description}}};var M,A,L;p.parameters={...p.parameters,docs:{...(M=p.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
}`,...(L=(A=p.parameters)==null?void 0:A.docs)==null?void 0:L.source}}};var H,j,P;g.parameters={...g.parameters,docs:{...(H=g.parameters)==null?void 0:H.docs,source:{originalSource:`{
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
}`,...(P=(j=g.parameters)==null?void 0:j.docs)==null?void 0:P.source}}};const de=["Default","WithModelAndEffort","Combo","NoModelsForFamily","SwitchingFamilyKeepsTheMode","UnsupportedModesAreDisabled"];export{u as Combo,l as Default,s as NoModelsForFamily,p as SwitchingFamilyKeepsTheMode,g as UnsupportedModesAreDisabled,m as WithModelAndEffort,de as __namedExportsOrder,ce as default};
