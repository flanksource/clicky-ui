import{C as T}from"./Clicky-g8WFZZ9P.js";import{c as U,a as c}from"./Clicky.fixtures-DVhrZ9FN.js";import"./iframe-B4Jlte7j.js";import"./preload-helper-DEXbRKRX.js";import"./queryClient-61RepQW5.js";import"./suspense-CdWG8kwC.js";import"./useQuery-m0Vo8_9Z.js";import"./FilterForm-0GnJXkRl.js";import"./button-Cz-uT3Xg.js";import"./utils-CR52uffu.js";import"./index-0zBpNI7D.js";import"./loading-DeD_1Din.js";import"./TimeRange-BQLekFm7.js";import"./floating-ui.react-C3GZwCXD.js";import"./index-pMrG7UvS.js";import"./index-DVtcdygO.js";import"./Icon-CmsFmOUo.js";import"./modalStack-rtvhmXFS.js";import"./zIndex-BGbNBNA8.js";import"./select-BsZV6TxH.js";import"./FilterPill-xBbW0bsO.js";import"./types-BHfRQr8X.js";import"./DataTable-DHtOPi1X.js";import"./SortableHeader-DK25xte0.js";import"./Modal-DmjECvH_.js";import"./FilterBar-CvtXpTid.js";import"./Combobox-s1oGg2-B.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-KbMxgN18.js";import"./MultiSelect-C-DTaW6u.js";import"./RangeSlider-Ck23kCpB.js";import"./Timestamp-B6AsSf9u.js";import"./TagList-CGntswbT.js";import"./Badge-BOuo3IQR.js";import"./HoverCard-zOCC4a_e.js";import"./Properties-CNxCP6uX.js";import"./IconButton-MSIQ6k2l.js";import"./DropdownMenu-Bq1HhKbq.js";import"./DropdownMenuSubmenu-B3adKdY1.js";import"./StatusDot-BWFmgJm9.js";import"./Tree-DvMZ21in.js";import"./TreeNode-CYiP4Jtc.js";import"./ObjectGraph-CS7SNEgR.js";import"./ExecutionTree-XjcvTCPP.js";import"./CodeBlock-DckRFgZF.js";import"./CodeDiff-BMTxEEVV.js";import"./SegmentedControl-DJgeaIPA.js";import"./code-highlight--PIzQ-Ck.js";import"./JsonView-ClRMHfyU.js";import"./RenderedStackTrace-DBHp8fGZ.js";const Lt={title:"Data/Clicky",component:T,parameters:{docs:{description:{component:"Renderer for Clicky AST documents produced by the sibling clicky stack. It handles text, tables, trees, badges, code, stack traces, downloads, and command links from one JSON document."}}}},t={args:{data:c}},e={args:{data:JSON.stringify(c)}},a={args:{data:U}},L={version:1,node:{kind:"list",unstyled:!0,items:[{kind:"admonition",severity:"note",label:{kind:"text",text:"Note"},content:{kind:"text",text:"Board approval is tracked separately."}},{kind:"admonition",severity:"info",label:{kind:"text",text:"Information"},content:{kind:"text",text:"Comparatives use the prior reporting pack."}},{kind:"admonition",severity:"tip",label:{kind:"text",text:"Tip"},content:{kind:"text",text:"Attach the signed trial balance before export."}},{kind:"admonition",severity:"warning",label:{kind:"text",text:"Warning"},content:{kind:"text",text:"Manual review is required for this note."}},{kind:"admonition",severity:"danger",label:{kind:"text",text:"Danger"},content:{kind:"text",text:"Publication is blocked until cash reconciles."}}]}},r={args:{data:L}},o={args:{data:c,view:{pdf:!1,json:!0},download:{all:!0,label:"report"}}},n={args:{url:"/samples/clicky/services.json",data:c,view:[],download:{all:!0,label:"artifact"}}},W={version:1,node:{kind:"table",autoFilter:!0,columns:[{name:"account",label:"Account",sortable:!0,grow:!0},{name:"type",label:"Type",sortable:!0,shrink:!0},{name:"balance",label:"Balance",align:"right",sortable:!0,shrink:!0},{name:"updated",label:"Updated",sortable:!0,shrink:!0}],rows:[{cells:{account:{kind:"text",text:"Operating account",plain:"Operating account"},type:{kind:"text",text:"Bank",plain:"Bank"},balance:{kind:"text",text:"12,480.00",plain:"12480"},updated:{kind:"text",text:"2026-04-15",plain:"2026-04-15"}}},{cells:{account:{kind:"text",text:"Accounts receivable",plain:"Accounts receivable"},type:{kind:"text",text:"Current Asset",plain:"Current Asset"},balance:{kind:"text",text:"8,215.50",plain:"8215.5"},updated:{kind:"text",text:"2026-04-16",plain:"2026-04-16"}}},{cells:{account:{kind:"text",text:"Sales tax payable",plain:"Sales tax payable"},type:{kind:"text",text:"Liability",plain:"Liability"},balance:{kind:"text",text:"-1,142.78",plain:"-1142.78"},updated:{kind:"text",text:"2026-04-18",plain:"2026-04-18"}}}]}},i={args:{url:"/samples/clicky/services.json",data:W,view:[],download:{all:!0,label:"accounts"}},parameters:{docs:{description:{story:"URL-backed Clicky table where download formats are surfaced from the table core menu instead of a separate download toolbar."}}}},l=(J,P)=>({kind:"code",language:J,source:P}),H={version:1,node:{kind:"text",children:[{kind:"text",text:"Go",style:{className:"font-semibold text-sm mt-density-3"}},l("go",`package main

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
}`,...(x=(k=e.parameters)==null?void 0:k.docs)==null?void 0:x.source}}};var b,y,g;a.parameters={...a.parameters,docs:{...(b=a.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    data: clickyMarkdownBlocksFixture
  }
}`,...(g=(y=a.parameters)==null?void 0:y.docs)==null?void 0:g.source}}};var w,f,v;r.parameters={...r.parameters,docs:{...(w=r.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    data: admonitionSeveritiesDoc
  }
}`,...(v=(f=r.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};var h,S,D;o.parameters={...o.parameters,docs:{...(h=o.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(O=(j=s.parameters)==null?void 0:j.docs)==null?void 0:O.source}}};const Wt=["RichDocument","JsonStringPayload","MarkdownBlocks","AdmonitionSeverities","WithDownloadControls","RemoteUrl","TableMenuDownloads","CodeNodes"];export{r as AdmonitionSeverities,s as CodeNodes,e as JsonStringPayload,a as MarkdownBlocks,n as RemoteUrl,t as RichDocument,i as TableMenuDownloads,o as WithDownloadControls,Wt as __namedExportsOrder,Lt as default};
