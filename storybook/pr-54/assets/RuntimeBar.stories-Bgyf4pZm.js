import{j as t,r as I}from"./iframe-BLMcgo_c.js";import{R}from"./RuntimeBar-D6xO5QmW.js";import"./preload-helper-V0wJDdBF.js";import"./utils-CR52uffu.js";import"./DropdownMenu-CQgT7g8D.js";import"./floating-ui.react-CNA9gpd9.js";import"./index-0GhwRIX8.js";import"./index-C6bGw4eq.js";import"./button-CEv4-a2z.js";import"./index-0zBpNI7D.js";import"./loading-iB_CRy-d.js";import"./Icon-BjbjSuBq.js";import"./DropdownMenuSubmenu-CA72N--A.js";import"./modalStack-D_rEmCN1.js";import"./zIndex-CigQ76av.js";import"./effort-icons-CR1cFjWZ.js";import"./InputField-CcLysu0l.js";import"./use-hotkey-DeHrN7O-.js";import"./Switch-Bk1qL7Lg.js";import"./runtime-mode-BjOHbf-A.js";const{expect:u,userEvent:r,within:a}=__STORYBOOK_MODULE_TEST__,A=[{id:"claude-agent/claude-sonnet-4-6",provider:"claude-agent",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,contextWindow:2e5},{id:"claude-agent/claude-opus-4-1",provider:"claude-agent",label:"Claude Opus 4.1",reasoning:!0,configured:!0,contextWindow:2e5},{id:"codex-cli/gpt-5-codex",provider:"codex-cli",label:"GPT-5 Codex",reasoning:!0,configured:!0,contextWindow:4e5},{id:"codex-cli/gpt-5-mini",provider:"codex-cli",label:"GPT-5 mini",reasoning:!0,configured:!1,contextWindow:4e5}];function s({initial:n}){const[e,o]=I.useState(n);return t.jsxs("div",{className:"grid max-w-3xl gap-4 p-6",children:[t.jsx(R,{value:e,onChange:o,models:A}),t.jsx("pre",{className:"rounded-md border border-border bg-muted/30 p-3 font-mono text-xs text-muted-foreground",children:JSON.stringify(e,null,2)})]})}const $={title:"AI/RuntimeBar",component:R,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:"The runtime as one self-describing row. Family, mode, model and reasoning effort each open their own menu; every segment shows its current value, so the bar needs no field labels above it. Switching family keeps the current mode when the new family has it and drops a model the new provider cannot run. Unsupported modes and efforts stay listed but disabled, with the reason as a hint. The Model segment is always present: it lists the selected family's catalog models and carries a free-text entry for a family the catalog does not describe, so the model never leaves the bar."}}},render:()=>t.jsx(s,{initial:{backend:"claude-agent"}})},d={},c={render:()=>t.jsx(s,{initial:{backend:"codex-cli",model:"codex-cli/gpt-5-codex",effort:"high"}})},i={render:()=>t.jsx(s,{initial:{backend:"gemini"}}),play:async({canvasElement:n})=>{const e=a(n);await r.click(e.getByTitle("Model — prompt default")),await r.type(await a(document.body).findByLabelText("Model id"),"gemini-3-pro"),await u(e.getByTitle("Model — gemini-3-pro")).toBeInTheDocument()}},l={render:()=>t.jsx(s,{initial:{backend:"claude-cli",model:"claude-agent/claude-opus-4-1"}}),play:async({canvasElement:n})=>{const e=a(n),o=a(document.body);await r.click(e.getByTitle("Family — Claude")),await r.click(await o.findByRole("menuitem",{name:/^Codex/})),await u(e.getByTitle("Codex CLI")).toHaveTextContent("CLI"),await u(e.getByTitle("Model — prompt default")).toBeInTheDocument()}},m={render:()=>t.jsx(s,{initial:{backend:"claude-agent"}}),play:async({canvasElement:n})=>{const e=a(n),o=a(document.body);await r.click(e.getByTitle("Claude Agent SDK")),await u(await o.findByRole("menuitem",{name:/^API not on Claude/})).toBeDisabled()}};var p,y,g;d.parameters={...d.parameters,docs:{...(p=d.parameters)==null?void 0:p.docs,source:{originalSource:"{}",...(g=(y=d.parameters)==null?void 0:y.docs)==null?void 0:g.source}}};var f,h,x;c.parameters={...c.parameters,docs:{...(f=c.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <RuntimeBarStory initial={{
    backend: "codex-cli",
    model: "codex-cli/gpt-5-codex",
    effort: "high"
  }} />
}`,...(x=(h=c.parameters)==null?void 0:h.docs)==null?void 0:x.source}}};var w,b,v,B,T;i.parameters={...i.parameters,docs:{...(w=i.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => <RuntimeBarStory initial={{
    backend: "gemini"
  }} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTitle("Model — prompt default"));
    await userEvent.type(await within(document.body).findByLabelText("Model id"), "gemini-3-pro");
    await expect(canvas.getByTitle("Model — gemini-3-pro")).toBeInTheDocument();
  }
}`,...(v=(b=i.parameters)==null?void 0:b.docs)==null?void 0:v.source},description:{story:`A hosted-API family the catalog does not describe keeps the Model segment;
 its menu offers the free-text entry alone.`,...(T=(B=i.parameters)==null?void 0:B.docs)==null?void 0:T.description}}};var C,S,E;l.parameters={...l.parameters,docs:{...(C=l.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => <RuntimeBarStory initial={{
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
}`,...(E=(S=l.parameters)==null?void 0:S.docs)==null?void 0:E.source}}};var M,k,D;m.parameters={...m.parameters,docs:{...(M=m.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: () => <RuntimeBarStory initial={{
    backend: "claude-agent"
  }} />,
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
}`,...(D=(k=m.parameters)==null?void 0:k.docs)==null?void 0:D.source}}};const ee=["Default","WithModelAndEffort","NoModelsForFamily","SwitchingFamilyKeepsTheMode","UnsupportedModesAreDisabled"];export{d as Default,i as NoModelsForFamily,l as SwitchingFamilyKeepsTheMode,m as UnsupportedModesAreDisabled,c as WithModelAndEffort,ee as __namedExportsOrder,$ as default};
