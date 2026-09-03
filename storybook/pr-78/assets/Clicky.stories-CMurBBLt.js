import{C as T}from"./Clicky-BR958FM8.js";import{c as U,a as c}from"./Clicky.fixtures-DVhrZ9FN.js";import"./iframe-Cco5TqZn.js";import"./preload-helper-CW1BdeJu.js";import"./queryClient-wsiT9jxi.js";import"./suspense-BDHMT-c8.js";import"./useQuery-Cw-7fZrp.js";import"./FilterForm-C8Ix4e5_.js";import"./button-DNj3-z2W.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CtZM3MTb.js";import"./FilterBar-DVdHLQod.js";import"./floating-ui.react-Dpy7yByO.js";import"./index-D2E1Pu38.js";import"./index-BboRCSKy.js";import"./FilterPill-BVle6yuL.js";import"./Icon-C6Dn9DLx.js";import"./Combobox-DPrIRjAr.js";import"./modalStack-ZpK0V3tF.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./Modal-BfOLI4vX.js";import"./DateTimePicker-Dy4sFFgJ.js";import"./MultiSelect-CeyhHNCi.js";import"./RangeSlider-Da0vSqmc.js";import"./TimeRange-DlEhKiKb.js";import"./select-DyfR_FV4.js";import"./WorkloadPicker-Y9hi9dEd.js";import"./NamespacePicker-BzzNcGfX.js";import"./index-CBZ8Tip2.js";import"./formMetadata-2inmewgJ.js";import"./data-table-filter-values-BjWgdAnO.js";import"./ErrorDetails-44GfVE44.js";import"./DataTable-BUdHoCkv.js";import"./SortableHeader-DtCNn_uR.js";import"./router-DHJSI_n5.js";import"./format-2niohfpq.js";import"./Timestamp-FGKuMYnS.js";import"./TagList-DUTVq46U.js";import"./Badge-BsNPFd1h.js";import"./HoverCard-D8KXkP_9.js";import"./Properties-Did90PaB.js";import"./IconButton-BQqpNww-.js";import"./DropdownMenu-w_RgGUTs.js";import"./DropdownMenuSubmenu-B3RQvvTh.js";import"./StatusDot-BZGJhrC1.js";import"./callout-tones-EFt49BYo.js";import"./Tree-BRZblghw.js";import"./TreeNode-LqK2sArM.js";import"./ObjectGraph-DgQa-TFG.js";import"./ExecutionTree-B-Y3H11P.js";import"./CodeBlock-BYcrzBK4.js";import"./CodeDiff-BKgy3UT_.js";import"./SegmentedControl-qK3H5opf.js";import"./HighlightedTokens-DbGRJ7uL.js";import"./JsonView-BazgrdGA.js";import"./RenderedStackTrace---7-vBhX.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-Bh3qnMVs.js";import"./FrameSourceWindow-C7WAdttz.js";import"./useDebugAction-2WpJUhB3.js";import"./debugConsoleSignal-B72erEWu.js";const Yt={title:"Data/Clicky",component:T,parameters:{docs:{description:{component:"Renderer for Clicky AST documents produced by the sibling clicky stack. It handles text, tables, trees, badges, code, stack traces, downloads, and command links from one JSON document."}}}},t={args:{data:c}},e={args:{data:JSON.stringify(c)}},r={args:{data:U}},L={version:1,node:{kind:"list",unstyled:!0,items:[{kind:"admonition",severity:"note",label:{kind:"text",text:"Note"},content:{kind:"text",text:"Board approval is tracked separately."}},{kind:"admonition",severity:"info",label:{kind:"text",text:"Information"},content:{kind:"text",text:"Comparatives use the prior reporting pack."}},{kind:"admonition",severity:"tip",label:{kind:"text",text:"Tip"},content:{kind:"text",text:"Attach the signed trial balance before export."}},{kind:"admonition",severity:"warning",label:{kind:"text",text:"Warning"},content:{kind:"text",text:"Manual review is required for this note."}},{kind:"admonition",severity:"danger",label:{kind:"text",text:"Danger"},content:{kind:"text",text:"Publication is blocked until cash reconciles."}}]}},a={args:{data:L}},o={args:{data:c,view:{pdf:!1,json:!0},download:{all:!0,label:"report"}}},n={args:{url:"/samples/clicky/services.json",data:c,view:[],download:{all:!0,label:"artifact"}}},W={version:1,node:{kind:"table",autoFilter:!0,columns:[{name:"account",label:"Account",sortable:!0,grow:!0},{name:"type",label:"Type",sortable:!0,shrink:!0},{name:"balance",label:"Balance",align:"right",sortable:!0,shrink:!0},{name:"updated",label:"Updated",sortable:!0,shrink:!0}],rows:[{cells:{account:{kind:"text",text:"Operating account",plain:"Operating account"},type:{kind:"text",text:"Bank",plain:"Bank"},balance:{kind:"text",text:"12,480.00",plain:"12480"},updated:{kind:"text",text:"2026-04-15",plain:"2026-04-15"}}},{cells:{account:{kind:"text",text:"Accounts receivable",plain:"Accounts receivable"},type:{kind:"text",text:"Current Asset",plain:"Current Asset"},balance:{kind:"text",text:"8,215.50",plain:"8215.5"},updated:{kind:"text",text:"2026-04-16",plain:"2026-04-16"}}},{cells:{account:{kind:"text",text:"Sales tax payable",plain:"Sales tax payable"},type:{kind:"text",text:"Liability",plain:"Liability"},balance:{kind:"text",text:"-1,142.78",plain:"-1142.78"},updated:{kind:"text",text:"2026-04-18",plain:"2026-04-18"}}}]}},i={args:{url:"/samples/clicky/services.json",data:W,view:[],download:{all:!0,label:"accounts"}},parameters:{docs:{description:{story:"URL-backed Clicky table where download formats are surfaced from the table core menu instead of a separate download toolbar."}}}},l=(J,P)=>({kind:"code",language:J,source:P}),H={version:1,node:{kind:"text",children:[{kind:"text",text:"Go",style:{className:"font-semibold text-sm mt-density-3"}},l("go",`package main

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
}`,...(O=(j=s.parameters)==null?void 0:j.docs)==null?void 0:O.source}}};const Zt=["RichDocument","JsonStringPayload","MarkdownBlocks","AdmonitionSeverities","WithDownloadControls","RemoteUrl","TableMenuDownloads","CodeNodes"];export{a as AdmonitionSeverities,s as CodeNodes,e as JsonStringPayload,r as MarkdownBlocks,n as RemoteUrl,t as RichDocument,i as TableMenuDownloads,o as WithDownloadControls,Zt as __namedExportsOrder,Yt as default};
