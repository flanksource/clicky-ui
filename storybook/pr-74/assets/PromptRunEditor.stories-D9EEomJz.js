import{r as f,j as t,bD as te,u as ie,bS as ne}from"./iframe-D7GyV4pJ.js";import{B as T}from"./button-DGCXgUzH.js";import{J as re}from"./JsonSchemaForm-ozZ6zT-V.js";import{c as oe}from"./utils-DW-IJACk.js";import{M as se}from"./Modal-DeNB64-i.js";import{I as S}from"./Icon-CjYo4K-K.js";import{D as le}from"./effort-icons-hjHJwx8p.js";import{c as de,A as ce,a as me}from"./Attachment-Dz-31hC8.js";import{r as ue,R as pe}from"./RuntimeBar-B4N56BQZ.js";import{S as fe,l as xe}from"./runtime-mode-DLgbrK-n.js";import{w,S as ye}from"./index-DeWAUkyq.js";import"./preload-helper-B_Vm21o9.js";import"./index-CPURVhFy.js";import"./loading-l0OT6FT8.js";import"./DropdownMenu-CbjgQkAk.js";import"./floating-ui.react-0HlP6Bgn.js";import"./index-vBVdkF1K.js";import"./index-CBRh9JwW.js";import"./DropdownMenuSubmenu-B7tV7pQZ.js";import"./modalStack-j79ynlPx.js";import"./zIndex-BGbNBNA8.js";import"./HoverCard-D4LSpSfM.js";import"./path-tree-hRGj2Ywe.js";import"./json-schema-form-size-E77C3uZS.js";import"./AccordionList-B4Hh1uqU.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-CIXhO4AH.js";import"./Combobox-C64Z6EDs.js";import"./FilterPill-BWoIl1NP.js";import"./DateField-BB23r969.js";import"./DatePicker-CjsCOzKx.js";import"./DateTimePicker-Bn9BjCAe.js";import"./SegmentedControl-C-FDjv1C.js";import"./TreePickerField-Ji0OzXHu.js";import"./Tree-Dfy7ZMf8.js";import"./TreeNode-DDIhgZh5.js";import"./InputField-DCcfOLGV.js";import"./use-hotkey-BYM_BnU0.js";import"./ListMenu-32Zj1jfR.js";import"./Switch-Bqd2LWtt.js";import"./SecretKeySelector-DLhYVY3v.js";import"./index-y8FDIv-9.js";import"./icon-menu-picker-pai8zB1e.js";import"./IconButton-CZUZzE64.js";import"./ProviderStatusPanel-DmKBVY2V.js";import"./types-B4ZMggem.js";import"./SandboxCreateWizard-BO6yOFnw.js";import"./session-tones-DB12P3hm.js";import"./agent-action-icons-XmDMdBxQ.js";import"./FixtureEditor-BiCXD7l9.js";import"./MdxEditorField-BdGYKmf3.js";import"./Callout-DNQflFbc.js";import"./callout-tones-DN7X2Ehz.js";import"./public-api-BjCjxHuM.js";import"./Badge-PT16GLtd.js";const F=["model","id","mode","temperature","effort","noCache","fallbacks"];function ge(e){if(!e)return{};const a={};for(const r of F){const n=e[r];n!==void 0&&Object.assign(a,{[r]:n})}return a}function Re(e){var a;return(a=e.runtimes)!=null&&a.length?e.runtimes:[ge(e.spec)]}function P(e,a){const r=a[0]??{},n=he(e.spec??{},r);if(a.length<=1){const p={...e,spec:n};return delete p.runtimes,p}return{...e,spec:n,runtimes:a}}function he(e,a){const r={...e};for(const n of F)delete r[n];return{...r,...a}}function N({value:e,onChange:a,models:r=[],families:n=fe,tools:p=[],permissionCatalog:R,secretSelector:h,cliOptions:x,sandboxCatalog:m,sandboxCreate:b,reasoningEfforts:c=le,variablesSchema:l,onVariablesValidityChange:A,promptEditor:J,promptLabel:I="User prompt",promptPlaceholder:G="Override the rendered user prompt",enableAttachments:$=!1,attachmentUpload:j,attachmentLimits:q,children:K,header:H,footer:Y,className:Q,editSpecLabel:W="Edit spec",specModalTitle:X="Runtime spec",specSections:B}){var O,U;const[Z,k]=f.useState(!1),d=e.spec??{},u=Re(e),v=ue(r,d),ee=f.useMemo(()=>j??de(),[j]),C=(((O=d.prompt)==null?void 0:O.attachments)??[]).map(i=>({type:"file",url:i.id?`/api/attachments/${i.id}`:i.url??"",mediaType:i.mediaType??"application/octet-stream",...i.id?{attachmentId:i.id}:{},...i.size!=null?{size:i.size}:{},...i.filename?{filename:i.filename}:{},...!i.filename&&i.path?{filename:i.path}:{}}));return t.jsxs("div",{className:oe("grid gap-density-4",Q),children:[H,t.jsxs(L,{title:"Runtime",children:[t.jsxs("div",{className:"grid gap-density-2",children:[u.map((i,o)=>t.jsxs("div",{role:"group","aria-label":`Runtime ${o+1}`,className:"flex min-w-0 items-center gap-density-2",children:[t.jsx(pe,{value:i,onChange:y=>a(P(e,u.map((s,ae)=>ae===o?y:s))),models:r,families:n,reasoningEfforts:c,ariaLabel:`Runtime ${o+1} controls`}),u.length>1&&t.jsx(T,{size:"sm",variant:"ghost","aria-label":`Remove runtime ${o+1}`,onClick:()=>a(P(e,u.filter((y,s)=>s!==o))),children:t.jsx(S,{icon:te,className:"size-4"})})]},o)),t.jsxs("div",{className:"flex flex-wrap items-center gap-density-2",children:[t.jsxs(T,{size:"sm",variant:"outline","aria-label":"Add runtime",onClick:()=>{var i;return a(P(e,[...u,(i=u[0])!=null&&i.mode?{mode:u[0].mode}:{}]))},children:[t.jsx(S,{icon:ie,className:"size-4"}),"Add runtime"]}),t.jsxs(T,{size:"sm",variant:"outline",onClick:()=>k(!0),children:[t.jsx(S,{icon:ne,className:"size-4"}),W]})]})]}),K]}),t.jsx(L,{title:"Variables",children:t.jsx(be,{...l?{schema:l}:{},value:e.variables??{},onChange:i=>a({...e,variables:i}),...A?{onValidityChange:A}:{}})}),t.jsxs(L,{title:I,children:[J??t.jsx("textarea",{value:((U=d.prompt)==null?void 0:U.user)??"",onChange:i=>a({...e,spec:w(d,{user:i.target.value})}),spellCheck:!1,placeholder:G,"aria-label":I,className:"min-h-[7rem] w-full resize-y rounded-md border border-border bg-background px-density-2 py-density-1 text-sm outline-none focus:ring-2 focus:ring-ring"}),$&&t.jsxs("div",{className:"space-y-density-2",children:[t.jsx(ce,{files:C,onRemove:i=>{var o;return a({...e,spec:w(d,{attachments:(((o=d.prompt)==null?void 0:o.attachments)??[]).filter((y,s)=>s!==i)})})}}),t.jsx(me,{files:C,upload:ee,onAdd:i=>{var o;return a({...e,spec:w(d,{attachments:[...((o=d.prompt)==null?void 0:o.attachments)??[],...i.map(y=>{const s=y;return{id:s.attachmentId,mediaType:s.mediaType,size:s.size,...s.filename?{filename:s.filename}:{}}})]})})},...v!=null&&v.inputMediaTypes?{acceptedMediaTypes:v.inputMediaTypes}:{},...q?{limits:q}:{}})]})]}),Y,t.jsx(se,{open:Z,onClose:()=>k(!1),title:X,size:"full",closeOnEsc:!0,className:"h-[95vh]",children:t.jsx(ye,{value:d,onChange:i=>a({...e,spec:i}),models:r,families:n,tools:p,...R?{permissionCatalog:R}:{},...h?{secretSelector:h}:{},...x?{cliOptions:x}:{},...m?{sandboxCatalog:m}:{},...b?{sandboxCreate:b}:{},...B?{sections:B}:{},onSave:()=>k(!1),onCancel:()=>k(!1),saveLabel:"Done",footerStatus:xe(d.mode,n)})})]})}function L({title:e,children:a}){return t.jsxs("section",{className:"space-y-density-2",children:[t.jsx("div",{className:"text-xs font-semibold uppercase tracking-wide text-muted-foreground",children:e}),a]})}function be({schema:e,value:a,onChange:r,onValidityChange:n}){const p=f.useId(),[R,h]=f.useState(()=>ke(a)),[x,m]=f.useState(null);if(e)return t.jsx(re,{idPrefix:`prompt-vars-${p}`,schema:e,value:a,onChange:c=>r(c),size:"sm"});const b=c=>{if(h(c),!c.trim()){m(null),n==null||n(!0),r({});return}try{const l=JSON.parse(c);l&&typeof l=="object"&&!Array.isArray(l)?(m(null),n==null||n(!0),r(l)):(m("Expected a JSON object"),n==null||n(!1))}catch(l){m(l instanceof Error?l.message:"Invalid JSON"),n==null||n(!1)}};return t.jsxs("div",{className:"space-y-1",children:[t.jsx("textarea",{value:R,onChange:c=>b(c.target.value),spellCheck:!1,placeholder:"{}","aria-label":"Variables JSON",className:"h-28 w-full resize-y rounded-md border border-border bg-background px-density-2 py-density-1 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"}),x&&t.jsx("div",{className:"text-xs text-destructive",children:x})]})}function ke(e){return!e||Object.keys(e).length===0?"{}":JSON.stringify(e,null,2)}try{N.displayName="PromptRunEditor",N.__docgenInfo={description:"",displayName:"PromptRunEditor",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",methods:[],props:{value:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"value",required:!0,tags:{},type:{name:"AIPromptRunValue"}},onChange:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"onChange",required:!0,tags:{},type:{name:"(value: AIPromptRunValue) => void"}},models:{defaultValue:{value:"[]"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"models",required:!1,tags:{},type:{name:"ChatModel[] | undefined"}},families:{defaultValue:{value:`[
  {
    id: "claude",
    label: "Claude",
    provider: "anthropic",
    modes: [
      {
        id: "api",
        label: "API",
        icon: UiCloud,
        title: "Anthropic API",
        provider: "anthropic",
      },
      {
        id: "agent",
        label: "Agent",
        icon: UiRobotAi,
        title: "Claude Agent SDK",
        provider: "anthropic",
      },
      {
        id: "cli",
        label: "CLI",
        icon: UiTerminal,
        title: "Claude Code CLI",
        provider: "anthropic",
      },
      {
        id: "cmux",
        label: "cmux",
        icon: UiColumns,
        title: "Claude multiplexer",
        provider: "anthropic",
      },
    ],
  },
  {
    id: "codex",
    label: "Codex",
    provider: "openai",
    modes: [
      {
        id: "api",
        label: "API",
        icon: UiCloud,
        title: "OpenAI API",
        provider: "openai",
      },
      {
        id: "agent",
        label: "Agent",
        icon: UiRobotAi,
        title: "Codex agent",
        provider: "openai",
      },
      {
        id: "cli",
        label: "CLI",
        icon: UiTerminal,
        title: "Codex CLI",
        provider: "openai",
      },
      {
        id: "cmux",
        label: "cmux",
        icon: UiColumns,
        title: "Codex multiplexer",
        provider: "openai",
      },
    ],
  },
  {
    id: "gemini",
    label: "Gemini",
    provider: "googleai",
    modes: [
      { id: "api", label: "API", icon: UiCloud, title: "Gemini API" },
      { id: "cli", label: "CLI", icon: UiTerminal, title: "Gemini CLI" },
    ],
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    provider: "deepseek",
    modes: [{ id: "api", label: "API", icon: UiCloud, title: "DeepSeek API" }],
  },
]`},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"families",required:!1,tags:{},type:{name:"SpecRuntimeFamily[] | undefined"}},tools:{defaultValue:{value:"[]"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"tools",required:!1,tags:{},type:{name:"ToolMeta[] | undefined"}},permissionCatalog:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"permissionCatalog",required:!1,tags:{},type:{name:"AISpecRuntimePermissionCatalog | undefined"}},secretSelector:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"secretSelector",required:!1,tags:{},type:{name:"SpecRuntimeSecretSelectorConfig | undefined"}},cliOptions:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"cliOptions",required:!1,tags:{},type:{name:"SpecRuntimeCLIOptions | undefined"}},sandboxCatalog:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"Sandbox adapter catalog; enables the spec editor's Sandbox section.",name:"sandboxCatalog",required:!1,tags:{},type:{name:"SpecRuntimeSandboxCatalog | undefined"}},sandboxCreate:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"Host-owned sandbox creation and credential-reference adapter.",name:"sandboxCreate",required:!1,tags:{},type:{name:"SpecRuntimeSandboxCreateConfig | undefined"}},reasoningEfforts:{defaultValue:{value:`[
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
  "ultra",
]`},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"reasoningEfforts",required:!1,tags:{},type:{name:"string[] | undefined"}},variablesSchema:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"Schema-driven variables form; omit to render a raw-JSON editor.",name:"variablesSchema",required:!1,tags:{},type:{name:"JsonSchemaObject | undefined"}},onVariablesValidityChange:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"Fires false while raw-JSON variables fail to parse; always true with a schema.",name:"onVariablesValidityChange",required:!1,tags:{},type:{name:"((valid: boolean) => void) | undefined"}},promptEditor:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"Host-supplied editor for the `prompt.user` override; defaults to a textarea.",name:"promptEditor",required:!1,tags:{},type:{name:"ReactNode"}},promptLabel:{defaultValue:{value:"User prompt"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"promptLabel",required:!1,tags:{},type:{name:"string | undefined"}},promptPlaceholder:{defaultValue:{value:"Override the rendered user prompt"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"promptPlaceholder",required:!1,tags:{},type:{name:"string | undefined"}},enableAttachments:{defaultValue:{value:"false"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"enableAttachments",required:!1,tags:{},type:{name:"boolean | undefined"}},attachmentUpload:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"attachmentUpload",required:!1,tags:{},type:{name:"AttachmentUploadAdapter | undefined"}},attachmentLimits:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"attachmentLimits",required:!1,tags:{},type:{name:"AttachmentLimits | undefined"}},children:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"Extra fields injected inside the Runtime block, below Model/Effort.",name:"children",required:!1,tags:{},type:{name:"ReactNode"}},header:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"header",required:!1,tags:{},type:{name:"ReactNode"}},footer:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"footer",required:!1,tags:{},type:{name:"ReactNode"}},className:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"className",required:!1,tags:{},type:{name:"string | undefined"}},editSpecLabel:{defaultValue:{value:"Edit spec"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"editSpecLabel",required:!1,tags:{},type:{name:"string | undefined"}},specModalTitle:{defaultValue:{value:"Runtime spec"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"specModalTitle",required:!1,tags:{},type:{name:"string | undefined"}},specSections:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:'Restrict which SpecRuntimeEditor sections the "Edit spec" modal shows.',name:"specSections",required:!1,tags:{},type:{name:"readonly SpecSectionId[] | undefined"}}},tags:{}}}catch{}const{expect:g,userEvent:_,within:D}=__STORYBOOK_MODULE_TEST__,ve=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function Ee(){const[e,a]=f.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return t.jsx("div",{className:"max-w-3xl p-density-4",children:t.jsx(N,{value:e,onChange:a,models:ve})})}const Ta={title:"AI/PromptRunEditor",component:N,parameters:{layout:"fullscreen"}},E={render:()=>t.jsx(Ee,{}),play:async({canvasElement:e})=>{const a=D(e);await g(a.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await g(a.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await _.click(a.getByRole("button",{name:"Add runtime"}));const r=await a.findByRole("group",{name:"Runtime 2"});await g(D(r).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await g(a.getByRole("button",{name:"Remove runtime 2"})).toBeInTheDocument(),await _.click(a.getByRole("button",{name:"Remove runtime 2"})),await g(a.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}};var M,V,z;E.parameters={...E.parameters,docs:{...(M=E.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
}`,...(z=(V=E.parameters)==null?void 0:V.docs)==null?void 0:z.source}}};const Sa=["CanonicalRequest"];export{E as CanonicalRequest,Sa as __namedExportsOrder,Ta as default};
