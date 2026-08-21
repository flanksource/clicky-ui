import{r as f,j as i,bD as te,u as ie,bP as ne}from"./iframe-YETa_cG9.js";import{B as T}from"./button-wvsJ1tMU.js";import{J as re}from"./JsonSchemaForm-DlmpeJpK.js";import{c as se}from"./utils-DW-IJACk.js";import{M as oe}from"./Modal-B6frkNwF.js";import{I as S}from"./Icon-Ca6PCkd-.js";import{D as le}from"./effort-icons-BM35KlxN.js";import{c as ce,A as de,a as me}from"./Attachment-Bn7CbHl5.js";import{R as ue}from"./RuntimeBar-MIAPgnPD.js";import{S as pe,l as fe}from"./runtime-mode-CQxa2AFP.js";import{w as P,S as xe}from"./index-BZf2rX5f.js";import"./preload-helper-BF_8wlrL.js";import"./index-CPURVhFy.js";import"./loading-BAKLzrcW.js";import"./DropdownMenu-CiFq7tJJ.js";import"./floating-ui.react-5Xu4xio0.js";import"./index-OzyaF4V_.js";import"./index-CseixOkg.js";import"./DropdownMenuSubmenu-CvY5YgBD.js";import"./modalStack-Dm7Q2W0x.js";import"./zIndex-BGbNBNA8.js";import"./HoverCard-DKlkGkUA.js";import"./path-tree-hRGj2Ywe.js";import"./json-schema-form-size-E77C3uZS.js";import"./AccordionList-D1Su7D8s.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-CIXhO4AH.js";import"./Combobox-DwypI7by.js";import"./FilterPill-BHlDdZuO.js";import"./DateField-DObw4SDl.js";import"./DatePicker-CE_MmryT.js";import"./DateTimePicker-BsjKNXxy.js";import"./SegmentedControl-DEMn3w7A.js";import"./TreePickerField-BSLePEio.js";import"./Tree-B468uYWs.js";import"./TreeNode-DI-9saRK.js";import"./InputField-DXrUPi4m.js";import"./use-hotkey--ALeVqVI.js";import"./Switch-VukeVhP3.js";import"./SecretKeySelector-DhCbi94F.js";import"./index-kwPzq5DO.js";import"./icon-menu-picker-BPG02o9-.js";import"./IconButton-Dpkf3rqZ.js";import"./ProviderStatusPanel-DBlOJeA2.js";import"./agent-action-icons-DX_hSF07.js";import"./SandboxCreateWizard-vkNUxmBU.js";import"./FixtureEditor-CI1GtPIL.js";import"./MdxEditorField-aHcLaB5j.js";import"./Callout-CJOhXq6V.js";import"./callout-tones-DN7X2Ehz.js";import"./public-api-BjCjxHuM.js";import"./Badge-DMxUBa2p.js";const F=["model","id","backend","temperature","effort","noCache","fallbacks"];function ye(e){if(!e)return{};const a={};for(const r of F){const n=e[r];n!==void 0&&Object.assign(a,{[r]:n})}return a}function ge(e){var a;return(a=e.runtimes)!=null&&a.length?e.runtimes:[ye(e.spec)]}function w(e,a){const r=a[0]??{},n=be(e.spec??{},r);if(a.length<=1){const p={...e,spec:n};return delete p.runtimes,p}return{...e,spec:n,runtimes:a}}function be(e,a){const r={...e};for(const n of F)delete r[n];return{...r,...a}}function N({value:e,onChange:a,models:r=[],families:n=pe,tools:p=[],permissionCatalog:b,secretSelector:R,cliOptions:x,sandboxCatalog:m,sandboxCreate:k,reasoningEfforts:d=le,variablesSchema:c,onVariablesValidityChange:A,promptEditor:J,promptLabel:I="User prompt",promptPlaceholder:G="Override the rendered user prompt",enableAttachments:$=!1,attachmentUpload:j,attachmentLimits:q,children:K,header:H,footer:Y,className:Q,editSpecLabel:W="Edit spec",specModalTitle:X="Runtime spec",specSections:B}){var O,U;const[Z,h]=f.useState(!1),o=e.spec??{},u=ge(e),v=r.find(t=>t.id===o.id||t.id===o.model),ee=f.useMemo(()=>j??ce(),[j]),C=(((O=o.prompt)==null?void 0:O.attachments)??[]).map(t=>({type:"file",url:t.id?`/api/attachments/${t.id}`:t.url??"",mediaType:t.mediaType??"application/octet-stream",...t.id?{attachmentId:t.id}:{},...t.size!=null?{size:t.size}:{},...t.filename?{filename:t.filename}:{},...!t.filename&&t.path?{filename:t.path}:{}}));return i.jsxs("div",{className:se("grid gap-density-4",Q),children:[H,i.jsxs(L,{title:"Runtime",children:[i.jsxs("div",{className:"grid gap-density-2",children:[u.map((t,s)=>i.jsxs("div",{role:"group","aria-label":`Runtime ${s+1}`,className:"flex min-w-0 items-center gap-density-2",children:[i.jsx(ue,{value:t,onChange:y=>a(w(e,u.map((l,ae)=>ae===s?y:l))),models:r,families:n,reasoningEfforts:d,ariaLabel:`Runtime ${s+1} controls`}),u.length>1&&i.jsx(T,{size:"sm",variant:"ghost","aria-label":`Remove runtime ${s+1}`,onClick:()=>a(w(e,u.filter((y,l)=>l!==s))),children:i.jsx(S,{icon:te,className:"size-4"})})]},s)),i.jsxs("div",{className:"flex flex-wrap items-center gap-density-2",children:[i.jsxs(T,{size:"sm",variant:"outline","aria-label":"Add runtime",onClick:()=>{var t;return a(w(e,[...u,(t=u[0])!=null&&t.backend?{backend:u[0].backend}:{}]))},children:[i.jsx(S,{icon:ie,className:"size-4"}),"Add runtime"]}),i.jsxs(T,{size:"sm",variant:"outline",onClick:()=>h(!0),children:[i.jsx(S,{icon:ne,className:"size-4"}),W]})]})]}),K]}),i.jsx(L,{title:"Variables",children:i.jsx(Re,{...c?{schema:c}:{},value:e.variables??{},onChange:t=>a({...e,variables:t}),...A?{onValidityChange:A}:{}})}),i.jsxs(L,{title:I,children:[J??i.jsx("textarea",{value:((U=o.prompt)==null?void 0:U.user)??"",onChange:t=>a({...e,spec:P(o,{user:t.target.value})}),spellCheck:!1,placeholder:G,"aria-label":I,className:"min-h-[7rem] w-full resize-y rounded-md border border-border bg-background px-density-2 py-density-1 text-sm outline-none focus:ring-2 focus:ring-ring"}),$&&i.jsxs("div",{className:"space-y-density-2",children:[i.jsx(de,{files:C,onRemove:t=>{var s;return a({...e,spec:P(o,{attachments:(((s=o.prompt)==null?void 0:s.attachments)??[]).filter((y,l)=>l!==t)})})}}),i.jsx(me,{files:C,upload:ee,onAdd:t=>{var s;return a({...e,spec:P(o,{attachments:[...((s=o.prompt)==null?void 0:s.attachments)??[],...t.map(y=>{const l=y;return{id:l.attachmentId,mediaType:l.mediaType,size:l.size,...l.filename?{filename:l.filename}:{}}})]})})},...v!=null&&v.inputMediaTypes?{acceptedMediaTypes:v.inputMediaTypes}:{},...q?{limits:q}:{}})]})]}),Y,i.jsx(oe,{open:Z,onClose:()=>h(!1),title:X,size:"full",closeOnEsc:!0,className:"h-[95vh]",children:i.jsx(xe,{value:o,onChange:t=>a({...e,spec:t}),models:r,families:n,tools:p,...b?{permissionCatalog:b}:{},...R?{secretSelector:R}:{},...x?{cliOptions:x}:{},...m?{sandboxCatalog:m}:{},...k?{sandboxCreate:k}:{},...B?{sections:B}:{},onSave:()=>h(!1),onCancel:()=>h(!1),saveLabel:"Done",footerStatus:fe(o.backend,n)})})]})}function L({title:e,children:a}){return i.jsxs("section",{className:"space-y-density-2",children:[i.jsx("div",{className:"text-xs font-semibold uppercase tracking-wide text-muted-foreground",children:e}),a]})}function Re({schema:e,value:a,onChange:r,onValidityChange:n}){const p=f.useId(),[b,R]=f.useState(()=>ke(a)),[x,m]=f.useState(null);if(e)return i.jsx(re,{idPrefix:`prompt-vars-${p}`,schema:e,value:a,onChange:d=>r(d),size:"sm"});const k=d=>{if(R(d),!d.trim()){m(null),n==null||n(!0),r({});return}try{const c=JSON.parse(d);c&&typeof c=="object"&&!Array.isArray(c)?(m(null),n==null||n(!0),r(c)):(m("Expected a JSON object"),n==null||n(!1))}catch(c){m(c instanceof Error?c.message:"Invalid JSON"),n==null||n(!1)}};return i.jsxs("div",{className:"space-y-1",children:[i.jsx("textarea",{value:b,onChange:d=>k(d.target.value),spellCheck:!1,placeholder:"{}","aria-label":"Variables JSON",className:"h-28 w-full resize-y rounded-md border border-border bg-background px-density-2 py-density-1 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"}),x&&i.jsx("div",{className:"text-xs text-destructive",children:x})]})}function ke(e){return!e||Object.keys(e).length===0?"{}":JSON.stringify(e,null,2)}try{N.displayName="PromptRunEditor",N.__docgenInfo={description:"",displayName:"PromptRunEditor",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",methods:[],props:{value:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"value",required:!0,tags:{},type:{name:"AIPromptRunValue"}},onChange:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"onChange",required:!0,tags:{},type:{name:"(value: AIPromptRunValue) => void"}},models:{defaultValue:{value:"[]"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"models",required:!1,tags:{},type:{name:"ChatModel[] | undefined"}},families:{defaultValue:{value:`[
  {
    id: "claude",
    label: "Claude",
    provider: "claude-agent",
    modes: [
      {
        id: "agent",
        label: "Agent",
        backend: "claude-agent",
        icon: UiRobotAi,
        title: "Claude Agent SDK",
      },
      {
        id: "cli",
        label: "CLI",
        backend: "claude-cli",
        icon: UiTerminal,
        title: "Claude Code CLI",
      },
      {
        id: "cmux",
        label: "cmux",
        backend: "claude-cmux",
        icon: UiColumns,
        title: "Claude multiplexer",
      },
    ],
  },
  {
    id: "codex",
    label: "Codex",
    provider: "codex-cli",
    modes: [
      {
        id: "agent",
        label: "Agent",
        backend: "codex-agent",
        icon: UiRobotAi,
        title: "Codex agent",
      },
      {
        id: "cli",
        label: "CLI",
        backend: "codex-cli",
        icon: UiTerminal,
        title: "Codex CLI",
      },
      {
        id: "cmux",
        label: "cmux",
        backend: "codex-cmux",
        icon: UiColumns,
        title: "Codex multiplexer",
      },
    ],
  },
  {
    id: "openai",
    label: "OpenAI",
    provider: "openai",
    modes: [
      {
        id: "api",
        label: "API",
        backend: "openai",
        icon: UiCloud,
        title: "OpenAI API",
      },
    ],
  },
  {
    id: "anthropic",
    label: "Anthropic",
    provider: "anthropic",
    modes: [
      {
        id: "api",
        label: "API",
        backend: "anthropic",
        icon: UiCloud,
        title: "Anthropic API",
      },
    ],
  },
  {
    id: "gemini",
    label: "Gemini",
    provider: "googleai",
    modes: [
      {
        id: "api",
        label: "API",
        backend: "gemini",
        icon: UiCloud,
        title: "Gemini API",
      },
      {
        id: "cli",
        label: "CLI",
        backend: "gemini-cli",
        icon: UiTerminal,
        title: "Gemini CLI",
      },
    ],
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    provider: "deepseek",
    modes: [
      {
        id: "api",
        label: "API",
        backend: "deepseek",
        icon: UiCloud,
        title: "DeepSeek API",
      },
    ],
  },
]`},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"families",required:!1,tags:{},type:{name:"SpecRuntimeFamily[] | undefined"}},tools:{defaultValue:{value:"[]"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"tools",required:!1,tags:{},type:{name:"ToolMeta[] | undefined"}},permissionCatalog:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"permissionCatalog",required:!1,tags:{},type:{name:"AISpecRuntimePermissionCatalog | undefined"}},secretSelector:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"secretSelector",required:!1,tags:{},type:{name:"SpecRuntimeSecretSelectorConfig | undefined"}},cliOptions:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"cliOptions",required:!1,tags:{},type:{name:"SpecRuntimeCLIOptions | undefined"}},sandboxCatalog:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"Sandbox adapter catalog; enables the spec editor's Sandbox section.",name:"sandboxCatalog",required:!1,tags:{},type:{name:"SpecRuntimeSandboxCatalog | undefined"}},sandboxCreate:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"Host-owned sandbox creation and credential-reference adapter.",name:"sandboxCreate",required:!1,tags:{},type:{name:"SpecRuntimeSandboxCreateConfig | undefined"}},reasoningEfforts:{defaultValue:{value:`[
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
  "ultra",
]`},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"reasoningEfforts",required:!1,tags:{},type:{name:"string[] | undefined"}},variablesSchema:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"Schema-driven variables form; omit to render a raw-JSON editor.",name:"variablesSchema",required:!1,tags:{},type:{name:"JsonSchemaObject | undefined"}},onVariablesValidityChange:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"Fires false while raw-JSON variables fail to parse; always true with a schema.",name:"onVariablesValidityChange",required:!1,tags:{},type:{name:"((valid: boolean) => void) | undefined"}},promptEditor:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"Host-supplied editor for the `prompt.user` override; defaults to a textarea.",name:"promptEditor",required:!1,tags:{},type:{name:"ReactNode"}},promptLabel:{defaultValue:{value:"User prompt"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"promptLabel",required:!1,tags:{},type:{name:"string | undefined"}},promptPlaceholder:{defaultValue:{value:"Override the rendered user prompt"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"promptPlaceholder",required:!1,tags:{},type:{name:"string | undefined"}},enableAttachments:{defaultValue:{value:"false"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"enableAttachments",required:!1,tags:{},type:{name:"boolean | undefined"}},attachmentUpload:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"attachmentUpload",required:!1,tags:{},type:{name:"AttachmentUploadAdapter | undefined"}},attachmentLimits:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"attachmentLimits",required:!1,tags:{},type:{name:"AttachmentLimits | undefined"}},children:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"Extra fields injected inside the Runtime block, below Model/Effort.",name:"children",required:!1,tags:{},type:{name:"ReactNode"}},header:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"header",required:!1,tags:{},type:{name:"ReactNode"}},footer:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"footer",required:!1,tags:{},type:{name:"ReactNode"}},className:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"className",required:!1,tags:{},type:{name:"string | undefined"}},editSpecLabel:{defaultValue:{value:"Edit spec"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"editSpecLabel",required:!1,tags:{},type:{name:"string | undefined"}},specModalTitle:{defaultValue:{value:"Runtime spec"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"specModalTitle",required:!1,tags:{},type:{name:"string | undefined"}},specSections:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:'Restrict which SpecRuntimeEditor sections the "Edit spec" modal shows.',name:"specSections",required:!1,tags:{},type:{name:"readonly SpecSectionId[] | undefined"}}},tags:{}}}catch{}const{expect:g,userEvent:_,within:D}=__STORYBOOK_MODULE_TEST__,he=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function ve(){const[e,a]=f.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(N,{value:e,onChange:a,models:he})})}const ha={title:"AI/PromptRunEditor",component:N,parameters:{layout:"fullscreen"}},E={render:()=>i.jsx(ve,{}),play:async({canvasElement:e})=>{const a=D(e);await g(a.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await g(a.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await _.click(a.getByRole("button",{name:"Add runtime"}));const r=await a.findByRole("group",{name:"Runtime 2"});await g(D(r).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await g(a.getByRole("button",{name:"Remove runtime 2"})).toBeInTheDocument(),await _.click(a.getByRole("button",{name:"Remove runtime 2"})),await g(a.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}};var M,V,z;E.parameters={...E.parameters,docs:{...(M=E.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: () => <CanonicalRequestStory />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", {
      name: "Runtime 1"
    })).toBeInTheDocument();
    await expect(canvas.queryByRole("group", {
      name: "Runtime 2"
    })).not.toBeInTheDocument();

    // A comparison row seeds from the first row's backend and becomes
    // removable, so both rows carry their own controls.
    await userEvent.click(canvas.getByRole("button", {
      name: "Add runtime"
    }));
    const second = await canvas.findByRole("group", {
      name: "Runtime 2"
    });
    await expect(within(second).getByRole("group", {
      name: "Runtime 2 controls"
    })).toBeInTheDocument();
    await expect(canvas.getByRole("button", {
      name: "Remove runtime 2"
    })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", {
      name: "Remove runtime 2"
    }));
    await expect(canvas.queryByRole("group", {
      name: "Runtime 2"
    })).not.toBeInTheDocument();
  }
}`,...(z=(V=E.parameters)==null?void 0:V.docs)==null?void 0:z.source}}};const va=["CanonicalRequest"];export{E as CanonicalRequest,va as __namedExportsOrder,ha as default};
