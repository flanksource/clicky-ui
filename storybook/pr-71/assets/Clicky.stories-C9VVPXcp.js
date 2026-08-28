import{C as T}from"./Clicky-DsoNufnZ.js";import{c as U,a as c}from"./Clicky.fixtures-DVhrZ9FN.js";import"./iframe-CIC35eeX.js";import"./preload-helper-CrzHa85r.js";import"./queryClient-Dlhl3_zo.js";import"./suspense-JoMc3dmy.js";import"./useQuery-C_yjEjoY.js";import"./FilterForm-C0vf8Of9.js";import"./button-jrxQ6vwL.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-nBEUV0ex.js";import"./FilterBar-BDMNzfC5.js";import"./floating-ui.react-B-Amc-L4.js";import"./index-DwO5TgZY.js";import"./index-C6gbLGVc.js";import"./FilterPill-DKv4DvZD.js";import"./Icon-BApSHLDT.js";import"./Combobox-l6NoX43q.js";import"./modalStack-CfG6hB1c.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-DDs3I4g0.js";import"./MultiSelect-CsY2Ffa8.js";import"./RangeSlider-r13dYiUP.js";import"./TimeRange-B-elXoE0.js";import"./select-BwS4L93K.js";import"./WorkloadPicker-F9bLsS7a.js";import"./NamespacePicker-DItY5PNm.js";import"./index-Dwoe35I0.js";import"./formMetadata-BpkrjKBY.js";import"./data-table-filter-values-BjWgdAnO.js";import"./ErrorDetails-JabqApvu.js";import"./DataTable-DnGNT9Nj.js";import"./SortableHeader-CGH-BS53.js";import"./Modal-C2Nn2nyp.js";import"./format-2niohfpq.js";import"./Timestamp-BqvOD4-r.js";import"./TagList-BstNaFnn.js";import"./Badge-92x0HdAg.js";import"./HoverCard-DJWsTzDy.js";import"./Properties-5HU2Gyt3.js";import"./IconButton-DNcu9Byf.js";import"./DropdownMenu-CGr2_0le.js";import"./DropdownMenuSubmenu--8qNQwq7.js";import"./StatusDot-aQvF58TV.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-Bi_od6R0.js";import"./TreeNode-DECl2gLo.js";import"./ObjectGraph-Wcssp5Dh.js";import"./ExecutionTree-C9egMlgf.js";import"./CodeBlock-Dt8ylXeY.js";import"./CodeDiff-CXFGbD7q.js";import"./SegmentedControl-B_5LYB9M.js";import"./HighlightedTokens-7bbtkSeq.js";import"./JsonView-1d85aInv.js";import"./RenderedStackTrace-DeaQX9Or.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-DyDwb1vW.js";import"./FrameSourceWindow-fXw2jrmn.js";import"./useDebugAction-CUBj1Cj4.js";import"./debugConsoleSignal-B72erEWu.js";const Xt={title:"Data/Clicky",component:T,parameters:{docs:{description:{component:"Renderer for Clicky AST documents produced by the sibling clicky stack. It handles text, tables, trees, badges, code, stack traces, downloads, and command links from one JSON document."}}}},t={args:{data:c}},e={args:{data:JSON.stringify(c)}},r={args:{data:U}},L={version:1,node:{kind:"list",unstyled:!0,items:[{kind:"admonition",severity:"note",label:{kind:"text",text:"Note"},content:{kind:"text",text:"Board approval is tracked separately."}},{kind:"admonition",severity:"info",label:{kind:"text",text:"Information"},content:{kind:"text",text:"Comparatives use the prior reporting pack."}},{kind:"admonition",severity:"tip",label:{kind:"text",text:"Tip"},content:{kind:"text",text:"Attach the signed trial balance before export."}},{kind:"admonition",severity:"warning",label:{kind:"text",text:"Warning"},content:{kind:"text",text:"Manual review is required for this note."}},{kind:"admonition",severity:"danger",label:{kind:"text",text:"Danger"},content:{kind:"text",text:"Publication is blocked until cash reconciles."}}]}},a={args:{data:L}},o={args:{data:c,view:{pdf:!1,json:!0},download:{all:!0,label:"report"}}},n={args:{url:"/samples/clicky/services.json",data:c,view:[],download:{all:!0,label:"artifact"}}},W={version:1,node:{kind:"table",autoFilter:!0,columns:[{name:"account",label:"Account",sortable:!0,grow:!0},{name:"type",label:"Type",sortable:!0,shrink:!0},{name:"balance",label:"Balance",align:"right",sortable:!0,shrink:!0},{name:"updated",label:"Updated",sortable:!0,shrink:!0}],rows:[{cells:{account:{kind:"text",text:"Operating account",plain:"Operating account"},type:{kind:"text",text:"Bank",plain:"Bank"},balance:{kind:"text",text:"12,480.00",plain:"12480"},updated:{kind:"text",text:"2026-04-15",plain:"2026-04-15"}}},{cells:{account:{kind:"text",text:"Accounts receivable",plain:"Accounts receivable"},type:{kind:"text",text:"Current Asset",plain:"Current Asset"},balance:{kind:"text",text:"8,215.50",plain:"8215.5"},updated:{kind:"text",text:"2026-04-16",plain:"2026-04-16"}}},{cells:{account:{kind:"text",text:"Sales tax payable",plain:"Sales tax payable"},type:{kind:"text",text:"Liability",plain:"Liability"},balance:{kind:"text",text:"-1,142.78",plain:"-1142.78"},updated:{kind:"text",text:"2026-04-18",plain:"2026-04-18"}}}]}},i={args:{url:"/samples/clicky/services.json",data:W,view:[],download:{all:!0,label:"accounts"}},parameters:{docs:{description:{story:"URL-backed Clicky table where download formats are surfaced from the table core menu instead of a separate download toolbar."}}}},l=(J,P)=>({kind:"code",language:J,source:P}),H={version:1,node:{kind:"text",children:[{kind:"text",text:"Go",style:{className:"font-semibold text-sm mt-density-3"}},l("go",`package main

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
