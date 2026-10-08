import{C as T}from"./Clicky-DRuv7H-Z.js";import{c as U,a as c}from"./Clicky.fixtures-DVhrZ9FN.js";import"./iframe-PIqemlGB.js";import"./preload-helper-CLP1olNy.js";import"./queryClient-BK_A812U.js";import"./suspense-CTpCM1El.js";import"./useQuery-5DNLP7uE.js";import"./FilterForm-B2bXq9Jx.js";import"./button-Cpqh3UK7.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CckofzUs.js";import"./FilterBar-DwRdQ7VZ.js";import"./floating-ui.react-xo2j_cLW.js";import"./index-32mlo6to.js";import"./index-DewUnPhR.js";import"./FilterPill-D7eYNNGY.js";import"./Icon-BnoLxMF1.js";import"./Combobox-Cq5Cwgai.js";import"./modalStack-CRXEK55e.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-CZcXzZ1_.js";import"./DateTimePicker-CDhMiyrN.js";import"./MultiSelect-yxv-lAiu.js";import"./RangeSlider-BG7N4rt4.js";import"./TimeRange-CSrBIew_.js";import"./select-C7X0Y6pI.js";import"./WorkloadPicker-LYXB4GXR.js";import"./NamespacePicker-oPgmu1Tq.js";import"./index-CAmlEtzE.js";import"./formMetadata-zKCvPDIO.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./ErrorDetails-EOB3UyzM.js";import"./string-Ye519DiV.js";import"./DataTable-BB1Wfh0H.js";import"./SortableHeader-YxMsDA6S.js";import"./router-BKvyW-mx.js";import"./Timestamp-H6K8rOUp.js";import"./TagList-CKxPl2C0.js";import"./Badge-DB04oQsn.js";import"./HoverCard-B7Vt-bLX.js";import"./Properties-CGJRTav9.js";import"./IconButton-gbin6MpU.js";import"./DropdownMenu-BJXir522.js";import"./DropdownMenuSubmenu-B4D0dxHv.js";import"./StatusDot-7d-SCqTg.js";import"./callout-tones-EFt49BYo.js";import"./Tree-B16uzPzy.js";import"./TreeNode-BsRpZsGS.js";import"./ObjectGraph-CypNUCky.js";import"./ExecutionTree-lKImakd_.js";import"./CodeBlock-j2E1n8ER.js";import"./CodeDiff-Dg5qylaS.js";import"./SegmentedControl-BPtmGqZE.js";import"./HighlightedTokens-B_4xh0bQ.js";import"./JsonView-r0_NeGqp.js";import"./AccordionList-wX34OlLO.js";import"./collections-CoHfwOze.js";import"./RenderedStackTrace-viQQasiJ.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-C0zqi0u3.js";import"./FrameSourceWindow-BNTF74iS.js";import"./useDebugAction-Be6RNqeG.js";import"./debugConsoleSignal-B72erEWu.js";const te={title:"Data/Clicky",component:T,parameters:{docs:{description:{component:"Renderer for Clicky AST documents produced by the sibling clicky stack. It handles text, tables, trees, badges, code, stack traces, downloads, and command links from one JSON document."}}}},t={args:{data:c}},e={args:{data:JSON.stringify(c)}},r={args:{data:U}},L={version:1,node:{kind:"list",unstyled:!0,items:[{kind:"admonition",severity:"note",label:{kind:"text",text:"Note"},content:{kind:"text",text:"Board approval is tracked separately."}},{kind:"admonition",severity:"info",label:{kind:"text",text:"Information"},content:{kind:"text",text:"Comparatives use the prior reporting pack."}},{kind:"admonition",severity:"tip",label:{kind:"text",text:"Tip"},content:{kind:"text",text:"Attach the signed trial balance before export."}},{kind:"admonition",severity:"warning",label:{kind:"text",text:"Warning"},content:{kind:"text",text:"Manual review is required for this note."}},{kind:"admonition",severity:"danger",label:{kind:"text",text:"Danger"},content:{kind:"text",text:"Publication is blocked until cash reconciles."}}]}},o={args:{data:L}},a={args:{data:c,view:{pdf:!1,json:!0},download:{all:!0,label:"report"}}},n={args:{url:"/samples/clicky/services.json",data:c,view:[],download:{all:!0,label:"artifact"}}},W={version:1,node:{kind:"table",autoFilter:!0,columns:[{name:"account",label:"Account",sortable:!0,grow:!0},{name:"type",label:"Type",sortable:!0,shrink:!0},{name:"balance",label:"Balance",align:"right",sortable:!0,shrink:!0},{name:"updated",label:"Updated",sortable:!0,shrink:!0}],rows:[{cells:{account:{kind:"text",text:"Operating account",plain:"Operating account"},type:{kind:"text",text:"Bank",plain:"Bank"},balance:{kind:"text",text:"12,480.00",plain:"12480"},updated:{kind:"text",text:"2026-04-15",plain:"2026-04-15"}}},{cells:{account:{kind:"text",text:"Accounts receivable",plain:"Accounts receivable"},type:{kind:"text",text:"Current Asset",plain:"Current Asset"},balance:{kind:"text",text:"8,215.50",plain:"8215.5"},updated:{kind:"text",text:"2026-04-16",plain:"2026-04-16"}}},{cells:{account:{kind:"text",text:"Sales tax payable",plain:"Sales tax payable"},type:{kind:"text",text:"Liability",plain:"Liability"},balance:{kind:"text",text:"-1,142.78",plain:"-1142.78"},updated:{kind:"text",text:"2026-04-18",plain:"2026-04-18"}}}]}},i={args:{url:"/samples/clicky/services.json",data:W,view:[],download:{all:!0,label:"accounts"}},parameters:{docs:{description:{story:"URL-backed Clicky table where download formats are surfaced from the table core menu instead of a separate download toolbar."}}}},l=(J,P)=>({kind:"code",language:J,source:P}),H={version:1,node:{kind:"text",children:[{kind:"text",text:"Go",style:{className:"font-semibold text-sm mt-density-3"}},l("go",`package main

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
}`,...(g=(y=r.parameters)==null?void 0:y.docs)==null?void 0:g.source}}};var w,f,v;o.parameters={...o.parameters,docs:{...(w=o.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    data: admonitionSeveritiesDoc
  }
}`,...(v=(f=o.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};var h,S,D;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(D=(S=a.parameters)==null?void 0:S.docs)==null?void 0:D.source}}};var C,A,N;n.parameters={...n.parameters,docs:{...(C=n.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(O=(j=s.parameters)==null?void 0:j.docs)==null?void 0:O.source}}};const ee=["RichDocument","JsonStringPayload","MarkdownBlocks","AdmonitionSeverities","WithDownloadControls","RemoteUrl","TableMenuDownloads","CodeNodes"];export{o as AdmonitionSeverities,s as CodeNodes,e as JsonStringPayload,r as MarkdownBlocks,n as RemoteUrl,t as RichDocument,i as TableMenuDownloads,a as WithDownloadControls,ee as __namedExportsOrder,te as default};
