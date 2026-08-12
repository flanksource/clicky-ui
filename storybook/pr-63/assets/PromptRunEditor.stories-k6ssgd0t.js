import{r as f,j as i,bz as ee,u as ae,bM as te}from"./iframe-DIGBtUIu.js";import{B as T}from"./button-BhKCLqoA.js";import{J as ie}from"./JsonSchemaForm-BILRi6dS.js";import{c as ne}from"./utils-CR52uffu.js";import{M as re}from"./Modal-BFrt9RBg.js";import{I as S}from"./Icon-Ckp6RE90.js";import{D as se}from"./effort-icons-1tP-hGJQ.js";import{c as oe,A as le,a as ce}from"./Attachment-DHVAXNsu.js";import{R as de}from"./RuntimeBar-BonPtEm0.js";import{S as me,l as ue}from"./runtime-mode-CZ4pENoL.js";import{w,S as pe}from"./index-CmjVmvdL.js";import"./preload-helper-Bz0j3TbD.js";import"./index-0zBpNI7D.js";import"./loading-D2cuqAxD.js";import"./DropdownMenu-CVD-ABeT.js";import"./floating-ui.react-CxgHPOfO.js";import"./index-CXQUnhiw.js";import"./index-evrdMFRC.js";import"./DropdownMenuSubmenu-BK5dfo9E.js";import"./modalStack-C-EkQo6g.js";import"./zIndex-BGbNBNA8.js";import"./HoverCard-DlH6gDP1.js";import"./path-tree-DWa9VY15.js";import"./json-schema-form-size-DYVq0lph.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./timestamp-format-CIXhO4AH.js";import"./Combobox-BgSWV58v.js";import"./FilterPill-DbdXEpGC.js";import"./DateTimePicker-DMZ4d6C6.js";import"./SegmentedControl-CoaMDtpF.js";import"./TreePickerField-DRlB5msV.js";import"./Tree-BC3pW9RS.js";import"./TreeNode-Bbb9eaqn.js";import"./InputField-Bk2xbA8w.js";import"./use-hotkey-RQzGmZcl.js";import"./Switch-CdfoGuEz.js";import"./SecretKeySelector-CvH2HDj2.js";import"./index-CWP6DnIa.js";import"./icon-menu-picker-BirvpDYy.js";import"./IconButton-CAaA5K_1.js";import"./ProviderStatusPanel-By-7xffY.js";import"./agent-action-icons-BNGAlAT6.js";import"./FixtureEditor-LyBMztXr.js";import"./MdxEditorField-B0FcH4w1.js";import"./public-api-BjCjxHuM.js";import"./Badge-CeO7XmU6.js";const V=["model","id","backend","temperature","effort","noCache","fallbacks"];function fe(e){if(!e)return{};const a={};for(const r of V){const n=e[r];n!==void 0&&Object.assign(a,{[r]:n})}return a}function xe(e){var a;return(a=e.runtimes)!=null&&a.length?e.runtimes:[fe(e.spec)]}function P(e,a){const r=a[0]??{},n=ye(e.spec??{},r);if(a.length<=1){const u={...e,spec:n};return delete u.runtimes,u}return{...e,spec:n,runtimes:a}}function ye(e,a){const r={...e};for(const n of V)delete r[n];return{...r,...a}}function N({value:e,onChange:a,models:r=[],families:n=me,tools:u=[],permissionCatalog:R,secretSelector:b,cliOptions:x,reasoningEfforts:p=se,variablesSchema:k,onVariablesValidityChange:c,promptEditor:d,promptLabel:L="User prompt",promptPlaceholder:F="Override the rendered user prompt",enableAttachments:J=!1,attachmentUpload:I,attachmentLimits:j,children:G,header:$,footer:K,className:Y,editSpecLabel:H="Edit spec",specModalTitle:Q="Runtime spec",specSections:B}){var O,C;const[W,h]=f.useState(!1),o=e.spec??{},m=xe(e),v=r.find(t=>t.id===o.id||t.id===o.model),X=f.useMemo(()=>I??oe(),[I]),q=(((O=o.prompt)==null?void 0:O.attachments)??[]).map(t=>({type:"file",url:t.id?`/api/attachments/${t.id}`:t.url??"",mediaType:t.mediaType??"application/octet-stream",...t.id?{attachmentId:t.id}:{},...t.size!=null?{size:t.size}:{},...t.filename?{filename:t.filename}:{},...!t.filename&&t.path?{filename:t.path}:{}}));return i.jsxs("div",{className:ne("grid gap-density-4",Y),children:[$,i.jsxs(A,{title:"Runtime",children:[i.jsxs("div",{className:"grid gap-density-2",children:[m.map((t,s)=>i.jsxs("div",{role:"group","aria-label":`Runtime ${s+1}`,className:"flex min-w-0 items-center gap-density-2",children:[i.jsx(de,{value:t,onChange:y=>a(P(e,m.map((l,Z)=>Z===s?y:l))),models:r,families:n,reasoningEfforts:p,ariaLabel:`Runtime ${s+1} controls`}),m.length>1&&i.jsx(T,{size:"sm",variant:"ghost","aria-label":`Remove runtime ${s+1}`,onClick:()=>a(P(e,m.filter((y,l)=>l!==s))),children:i.jsx(S,{icon:ee,className:"size-4"})})]},s)),i.jsxs("div",{className:"flex flex-wrap items-center gap-density-2",children:[i.jsxs(T,{size:"sm",variant:"outline","aria-label":"Add runtime",onClick:()=>{var t;return a(P(e,[...m,(t=m[0])!=null&&t.backend?{backend:m[0].backend}:{}]))},children:[i.jsx(S,{icon:ae,className:"size-4"}),"Add runtime"]}),i.jsxs(T,{size:"sm",variant:"outline",onClick:()=>h(!0),children:[i.jsx(S,{icon:te,className:"size-4"}),H]})]})]}),G]}),i.jsx(A,{title:"Variables",children:i.jsx(ge,{...k?{schema:k}:{},value:e.variables??{},onChange:t=>a({...e,variables:t}),...c?{onValidityChange:c}:{}})}),i.jsxs(A,{title:L,children:[d??i.jsx("textarea",{value:((C=o.prompt)==null?void 0:C.user)??"",onChange:t=>a({...e,spec:w(o,{user:t.target.value})}),spellCheck:!1,placeholder:F,"aria-label":L,className:"min-h-[7rem] w-full resize-y rounded-md border border-border bg-background px-density-2 py-density-1 text-sm outline-none focus:ring-2 focus:ring-ring"}),J&&i.jsxs("div",{className:"space-y-density-2",children:[i.jsx(le,{files:q,onRemove:t=>{var s;return a({...e,spec:w(o,{attachments:(((s=o.prompt)==null?void 0:s.attachments)??[]).filter((y,l)=>l!==t)})})}}),i.jsx(ce,{files:q,upload:X,onAdd:t=>{var s;return a({...e,spec:w(o,{attachments:[...((s=o.prompt)==null?void 0:s.attachments)??[],...t.map(y=>{const l=y;return{id:l.attachmentId,mediaType:l.mediaType,size:l.size,...l.filename?{filename:l.filename}:{}}})]})})},...v!=null&&v.inputMediaTypes?{acceptedMediaTypes:v.inputMediaTypes}:{},...j?{limits:j}:{}})]})]}),K,i.jsx(re,{open:W,onClose:()=>h(!1),title:Q,size:"full",closeOnEsc:!0,className:"h-[95vh]",children:i.jsx(pe,{value:o,onChange:t=>a({...e,spec:t}),models:r,families:n,tools:u,...R?{permissionCatalog:R}:{},...b?{secretSelector:b}:{},...x?{cliOptions:x}:{},...B?{sections:B}:{},onSave:()=>h(!1),onCancel:()=>h(!1),saveLabel:"Done",footerStatus:ue(o.backend,n)})})]})}function A({title:e,children:a}){return i.jsxs("section",{className:"space-y-density-2",children:[i.jsx("div",{className:"text-xs font-semibold uppercase tracking-wide text-muted-foreground",children:e}),a]})}function ge({schema:e,value:a,onChange:r,onValidityChange:n}){const u=f.useId(),[R,b]=f.useState(()=>Re(a)),[x,p]=f.useState(null);if(e)return i.jsx(ie,{idPrefix:`prompt-vars-${u}`,schema:e,value:a,onChange:c=>r(c),size:"sm"});const k=c=>{if(b(c),!c.trim()){p(null),n==null||n(!0),r({});return}try{const d=JSON.parse(c);d&&typeof d=="object"&&!Array.isArray(d)?(p(null),n==null||n(!0),r(d)):(p("Expected a JSON object"),n==null||n(!1))}catch(d){p(d instanceof Error?d.message:"Invalid JSON"),n==null||n(!1)}};return i.jsxs("div",{className:"space-y-1",children:[i.jsx("textarea",{value:R,onChange:c=>k(c.target.value),spellCheck:!1,placeholder:"{}","aria-label":"Variables JSON",className:"h-28 w-full resize-y rounded-md border border-border bg-background px-density-2 py-density-1 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"}),x&&i.jsx("div",{className:"text-xs text-destructive",children:x})]})}function Re(e){return!e||Object.keys(e).length===0?"{}":JSON.stringify(e,null,2)}try{N.displayName="PromptRunEditor",N.__docgenInfo={description:"",displayName:"PromptRunEditor",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",methods:[],props:{value:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"value",required:!0,tags:{},type:{name:"AIPromptRunValue"}},onChange:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"onChange",required:!0,tags:{},type:{name:"(value: AIPromptRunValue) => void"}},models:{defaultValue:{value:"[]"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"models",required:!1,tags:{},type:{name:"ChatModel[] | undefined"}},families:{defaultValue:{value:`[
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
]`},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"families",required:!1,tags:{},type:{name:"SpecRuntimeFamily[] | undefined"}},tools:{defaultValue:{value:"[]"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"tools",required:!1,tags:{},type:{name:"ToolMeta[] | undefined"}},permissionCatalog:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"permissionCatalog",required:!1,tags:{},type:{name:"AISpecRuntimePermissionCatalog | undefined"}},secretSelector:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"secretSelector",required:!1,tags:{},type:{name:"SpecRuntimeSecretSelectorConfig | undefined"}},cliOptions:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"cliOptions",required:!1,tags:{},type:{name:"SpecRuntimeCLIOptions | undefined"}},reasoningEfforts:{defaultValue:{value:`[
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
  "ultra",
]`},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"reasoningEfforts",required:!1,tags:{},type:{name:"string[] | undefined"}},variablesSchema:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"Schema-driven variables form; omit to render a raw-JSON editor.",name:"variablesSchema",required:!1,tags:{},type:{name:"JsonSchemaObject | undefined"}},onVariablesValidityChange:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"Fires false while raw-JSON variables fail to parse; always true with a schema.",name:"onVariablesValidityChange",required:!1,tags:{},type:{name:"((valid: boolean) => void) | undefined"}},promptEditor:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"Host-supplied editor for the `prompt.user` override; defaults to a textarea.",name:"promptEditor",required:!1,tags:{},type:{name:"ReactNode"}},promptLabel:{defaultValue:{value:"User prompt"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"promptLabel",required:!1,tags:{},type:{name:"string | undefined"}},promptPlaceholder:{defaultValue:{value:"Override the rendered user prompt"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"promptPlaceholder",required:!1,tags:{},type:{name:"string | undefined"}},enableAttachments:{defaultValue:{value:"false"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"enableAttachments",required:!1,tags:{},type:{name:"boolean | undefined"}},attachmentUpload:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"attachmentUpload",required:!1,tags:{},type:{name:"AttachmentUploadAdapter | undefined"}},attachmentLimits:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"attachmentLimits",required:!1,tags:{},type:{name:"AttachmentLimits | undefined"}},children:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"Extra fields injected inside the Runtime block, below Model/Effort.",name:"children",required:!1,tags:{},type:{name:"ReactNode"}},header:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"header",required:!1,tags:{},type:{name:"ReactNode"}},footer:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"footer",required:!1,tags:{},type:{name:"ReactNode"}},className:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"className",required:!1,tags:{},type:{name:"string | undefined"}},editSpecLabel:{defaultValue:{value:"Edit spec"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"editSpecLabel",required:!1,tags:{},type:{name:"string | undefined"}},specModalTitle:{defaultValue:{value:"Runtime spec"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:"",name:"specModalTitle",required:!1,tags:{},type:{name:"string | undefined"}},specSections:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/ai/PromptRunEditor/index.tsx",name:"TypeLiteral"}],description:'Restrict which SpecRuntimeEditor sections the "Edit spec" modal shows.',name:"specSections",required:!1,tags:{},type:{name:"readonly SpecSectionId[] | undefined"}}},tags:{}}}catch{}const{expect:g,userEvent:U,within:_}=__STORYBOOK_MODULE_TEST__,be=[{id:"anthropic/claude-sonnet-4-6",provider:"anthropic",label:"Claude Sonnet 4.6",reasoning:!0,configured:!0,runtime:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic"}},{id:"openai/gpt-5.5",provider:"openai",label:"GPT-5.5",reasoning:!0,configured:!0,runtime:{model:"gpt-5.5",id:"openai/gpt-5.5",backend:"openai"}}];function ke(){const[e,a]=f.useState({variables:{company:"Acme"},spec:{model:"claude-sonnet-4-6",id:"anthropic/claude-sonnet-4-6",backend:"anthropic",prompt:{user:"Review {{company}}"}},chat:!0});return i.jsx("div",{className:"max-w-3xl p-density-4",children:i.jsx(N,{value:e,onChange:a,models:be})})}const pa={title:"AI/PromptRunEditor",component:N,parameters:{layout:"fullscreen"}},E={render:()=>i.jsx(ke,{}),play:async({canvasElement:e})=>{const a=_(e);await g(a.getByRole("group",{name:"Runtime 1"})).toBeInTheDocument(),await g(a.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument(),await U.click(a.getByRole("button",{name:"Add runtime"}));const r=await a.findByRole("group",{name:"Runtime 2"});await g(_(r).getByRole("group",{name:"Runtime 2 controls"})).toBeInTheDocument(),await g(a.getByRole("button",{name:"Remove runtime 2"})).toBeInTheDocument(),await U.click(a.getByRole("button",{name:"Remove runtime 2"})),await g(a.queryByRole("group",{name:"Runtime 2"})).not.toBeInTheDocument()}};var D,M,z;E.parameters={...E.parameters,docs:{...(D=E.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(z=(M=E.parameters)==null?void 0:M.docs)==null?void 0:z.source}}};const fa=["CanonicalRequest"];export{E as CanonicalRequest,fa as __namedExportsOrder,pa as default};
