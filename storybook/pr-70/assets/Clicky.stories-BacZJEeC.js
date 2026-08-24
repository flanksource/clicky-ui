import{C as T}from"./Clicky-YbVBnhJW.js";import{c as U,a as c}from"./Clicky.fixtures-DVhrZ9FN.js";import"./iframe-CiHj_drq.js";import"./preload-helper-C9Uksf5K.js";import"./queryClient-DwOJ7SpZ.js";import"./suspense-3w3a1LEC.js";import"./useQuery-C_mp4XbG.js";import"./FilterForm-CUyV2ayM.js";import"./button-CF8Oad92.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CvQxXIfs.js";import"./FilterBar-DGHJFTaL.js";import"./floating-ui.react-CdsFUqBP.js";import"./index-D-c_5Z52.js";import"./index-BTP8oBdU.js";import"./FilterPill-Cd01icRX.js";import"./Icon-B8CHvJLE.js";import"./Combobox-BeG22V1s.js";import"./modalStack-BxawZIg3.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-BLABB2Ii.js";import"./MultiSelect-bpx4mBh0.js";import"./RangeSlider-Cyidobpc.js";import"./TimeRange-KTlWidEX.js";import"./select-BS0Fe7RG.js";import"./WorkloadPicker-CyS_JrPw.js";import"./NamespacePicker-XKgMl5_i.js";import"./index-JYe4JoQ1.js";import"./formMetadata-CGf803wG.js";import"./data-table-filter-values-BjWgdAnO.js";import"./ErrorDetails-DiVf2Che.js";import"./DataTable-DDfDt-sz.js";import"./SortableHeader-loDSAR1A.js";import"./Modal-CiRTtmCj.js";import"./format-2niohfpq.js";import"./Timestamp-Bquiqu9t.js";import"./TagList-DQ0BBwqx.js";import"./Badge-ap7M4ZBa.js";import"./HoverCard-BD4fAzxG.js";import"./Properties-CWtEUSYZ.js";import"./IconButton-CduQ6f0Q.js";import"./DropdownMenu-DKU5huRk.js";import"./DropdownMenuSubmenu-BhgkJeya.js";import"./StatusDot-DCaLEXDq.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-BRz2UhTv.js";import"./TreeNode-CFqnHS1i.js";import"./ObjectGraph-BsHvJPMN.js";import"./ExecutionTree-BRGq9CcJ.js";import"./CodeBlock-DGXNpTk9.js";import"./CodeDiff-D0i-M3bf.js";import"./SegmentedControl-46VZUa35.js";import"./HighlightedTokens-BKwT3Lug.js";import"./JsonView-BHVT7TW6.js";import"./RenderedStackTrace-Ci79PygC.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-BitX2zSV.js";import"./FrameSourceWindow-DUrEOG2b.js";import"./useDebugAction-Z2-YNnwA.js";import"./debugConsoleSignal-B72erEWu.js";const Xt={title:"Data/Clicky",component:T,parameters:{docs:{description:{component:"Renderer for Clicky AST documents produced by the sibling clicky stack. It handles text, tables, trees, badges, code, stack traces, downloads, and command links from one JSON document."}}}},t={args:{data:c}},e={args:{data:JSON.stringify(c)}},r={args:{data:U}},L={version:1,node:{kind:"list",unstyled:!0,items:[{kind:"admonition",severity:"note",label:{kind:"text",text:"Note"},content:{kind:"text",text:"Board approval is tracked separately."}},{kind:"admonition",severity:"info",label:{kind:"text",text:"Information"},content:{kind:"text",text:"Comparatives use the prior reporting pack."}},{kind:"admonition",severity:"tip",label:{kind:"text",text:"Tip"},content:{kind:"text",text:"Attach the signed trial balance before export."}},{kind:"admonition",severity:"warning",label:{kind:"text",text:"Warning"},content:{kind:"text",text:"Manual review is required for this note."}},{kind:"admonition",severity:"danger",label:{kind:"text",text:"Danger"},content:{kind:"text",text:"Publication is blocked until cash reconciles."}}]}},a={args:{data:L}},o={args:{data:c,view:{pdf:!1,json:!0},download:{all:!0,label:"report"}}},n={args:{url:"/samples/clicky/services.json",data:c,view:[],download:{all:!0,label:"artifact"}}},W={version:1,node:{kind:"table",autoFilter:!0,columns:[{name:"account",label:"Account",sortable:!0,grow:!0},{name:"type",label:"Type",sortable:!0,shrink:!0},{name:"balance",label:"Balance",align:"right",sortable:!0,shrink:!0},{name:"updated",label:"Updated",sortable:!0,shrink:!0}],rows:[{cells:{account:{kind:"text",text:"Operating account",plain:"Operating account"},type:{kind:"text",text:"Bank",plain:"Bank"},balance:{kind:"text",text:"12,480.00",plain:"12480"},updated:{kind:"text",text:"2026-04-15",plain:"2026-04-15"}}},{cells:{account:{kind:"text",text:"Accounts receivable",plain:"Accounts receivable"},type:{kind:"text",text:"Current Asset",plain:"Current Asset"},balance:{kind:"text",text:"8,215.50",plain:"8215.5"},updated:{kind:"text",text:"2026-04-16",plain:"2026-04-16"}}},{cells:{account:{kind:"text",text:"Sales tax payable",plain:"Sales tax payable"},type:{kind:"text",text:"Liability",plain:"Liability"},balance:{kind:"text",text:"-1,142.78",plain:"-1142.78"},updated:{kind:"text",text:"2026-04-18",plain:"2026-04-18"}}}]}},i={args:{url:"/samples/clicky/services.json",data:W,view:[],download:{all:!0,label:"accounts"}},parameters:{docs:{description:{story:"URL-backed Clicky table where download formats are surfaced from the table core menu instead of a separate download toolbar."}}}},l=(J,P)=>({kind:"code",language:J,source:P}),H={version:1,node:{kind:"text",children:[{kind:"text",text:"Go",style:{className:"font-semibold text-sm mt-density-3"}},l("go",`package main

import "fmt"

func main() {
    fmt.Println("Hello, world!")
}`),{kind:"text",text:"Python",style:{className:"font-semibold text-sm mt-density-3"}},l("python",`def greet(name: str = "world") -> str:
    return f"Hello, {name}!"`)]}},s={args:{data:H}};var d,m,p;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    data: clickyFixture
  }
}`,...(p=(m=t.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};var u,k,x;e.parameters={...e.parameters,docs:{...(u=e.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    data: JSON.stringify(clickyFixture)
  }
}`,...(x=(k=e.parameters)==null?void 0:k.docs)==null?void 0:x.source}}};var b,y,g;r.parameters={...r.parameters,docs:{...(b=r.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    data: clickyMarkdownBlocksFixture
  }
}`,...(g=(y=r.parameters)==null?void 0:y.docs)==null?void 0:g.source}}};var w,f,v;a.parameters={...a.parameters,docs:{...(w=a.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    data: admonitionSeveritiesDoc
  }
}`,...(v=(f=a.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};var h,S,D;o.parameters={...o.parameters,docs:{...(h=o.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    data: clickyFixture,
    view: {
      pdf: false,
      json: true
    },
    download: {
      all: true,
      label: "report"
    }
  }
}`,...(D=(S=o.parameters)==null?void 0:S.docs)==null?void 0:D.source}}};var C,A,N;n.parameters={...n.parameters,docs:{...(C=n.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    url: "/samples/clicky/services.json",
    data: clickyFixture,
    view: [],
    download: {
      all: true,
      label: "artifact"
    }
  }
}`,...(N=(A=n.parameters)==null?void 0:A.docs)==null?void 0:N.source}}};var B,F,M;i.parameters={...i.parameters,docs:{...(B=i.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    url: "/samples/clicky/services.json",
    data: tableDownloadDoc,
    view: [],
    download: {
      all: true,
      label: "accounts"
    }
  },
  parameters: {
    docs: {
      description: {
        story: "URL-backed Clicky table where download formats are surfaced from the table core menu instead of a separate download toolbar."
      }
    }
  }
}`,...(M=(F=i.parameters)==null?void 0:F.docs)==null?void 0:M.source}}};var R,j,O;s.parameters={...s.parameters,docs:{...(R=s.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    data: combinedCodeDoc
  }
}`,...(O=(j=s.parameters)==null?void 0:j.docs)==null?void 0:O.source}}};const Yt=["RichDocument","JsonStringPayload","MarkdownBlocks","AdmonitionSeverities","WithDownloadControls","RemoteUrl","TableMenuDownloads","CodeNodes"];export{a as AdmonitionSeverities,s as CodeNodes,e as JsonStringPayload,r as MarkdownBlocks,n as RemoteUrl,t as RichDocument,i as TableMenuDownloads,o as WithDownloadControls,Yt as __namedExportsOrder,Xt as default};
