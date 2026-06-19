import{b as A}from"./Clicky-Dkg5Qi1r.js";import"./iframe-CmW1bXIL.js";import"./preload-helper-ByUaG9M2.js";import"./suspense-BvtEJzrj.js";import"./useQuery-CdU0hvij.js";import"./FilterForm-DyjC5NvY.js";import"./button-Cbf2D1Lj.js";import"./utils-BLSKlp9E.js";import"./index-1evVQkiP.js";import"./loading-BzXaTpRU.js";import"./TimeRange-B1rlhEFO.js";import"./floating-ui.react-mTFBW1Ma.js";import"./index-CvvFywp4.js";import"./index-CwG-8UeD.js";import"./Icon-DgKWNfUH.js";import"./modalStack-CihdweRn.js";import"./zIndex-CigQ76av.js";import"./select-pkm1YVYK.js";import"./UiChevronDown-DNI0luU1.js";import"./UiWatch-BJsevy8H.js";import"./UiCalendar-CMRdMOnT.js";import"./UiArrowRight-Ce2uwFX5.js";import"./UiClose-BWsNrAoC.js";import"./FilterPill-D3c4bT_8.js";import"./UiAdd-cDftFtFQ.js";import"./UiRemove-DdJaLPEm.js";import"./UiCheck-D6M7xpTV.js";import"./types-BHfRQr8X.js";import"./UiSearch-L2vxKGO0.js";import"./DataTable-DEb7A5Ne.js";import"./SortableHeader-CBw982xb.js";import"./use-theme-CPxN17ZC.js";import"./Modal-DxeyfFt4.js";import"./UiFullscreen-C6Iis6jt.js";import"./FilterBar-hAzNCHdh.js";import"./timestamp-format-ukGnKWnC.js";import"./Combobox-C3OZP1cH.js";import"./json-schema-form-size-DYVq0lph.js";import"./DateTimePicker-D-3L2yei.js";import"./MultiSelect-B0RWA2PX.js";import"./UiChevronUp-CCcfE8it.js";import"./RangeSlider-BnNQXcQt.js";import"./UiFilter-CJt0Wq0T.js";import"./UiChevronRight-DL1RnjKc.js";import"./Timestamp-D3g5SIOf.js";import"./TagList-BppJWMaN.js";import"./Badge-DAfksLSj.js";import"./HoverCard-BNjkbk4T.js";import"./Properties-BnV2zwZu.js";import"./UiZoomOut-lCnXr7gA.js";import"./UiCopy-52ldaFhT.js";import"./StatusDot-BEKTAprD.js";import"./UiEllipsis-FwH_tpoh.js";import"./UiArrowLeft-Sn9jsF52.js";import"./UiRows-uyVZ3NI1.js";import"./UiListFlat-BZENYys2.js";import"./UiSun-C_GzQ9UI.js";import"./Tree-DGflsuJB.js";import"./TreeNode-OAJurtQt.js";import"./UiExpandAll-B5hzOJMv.js";import"./CodeBlock-BfTp8hI-.js";import"./JsonView-1BfW0HLV.js";import"./code-highlight-vj-DXbl2.js";import"./RenderedStackTrace-DtbTcUq7.js";import"./UiError-a_6rCuL3.js";import"./UiStackFrameDot-ByQe6xuP.js";import"./UiChip-CZyKjtXS.js";import"./UiDebugStepOver-DrhOrNFa.js";import"./UiMethod-DPZQQljn.js";import"./UiCloudDownload-BqCuG-r2.js";import"./UiComment-BLjmyrV5.js";import"./UiTable-33vuYdx5.js";import"./UiFileCode-DP7iuZ6q.js";import"./UiFileSpreadsheet-BZ1nbJP4.js";import"./UiMarkdown-DNhoy9ad.js";import"./UiFileText-C1nzfTxV.js";import"./UiJson-DEgueWZR.js";const i={version:1,node:{kind:"map",fields:[{name:"title",label:"Title",value:{kind:"text",text:"Cluster Status",plain:"Cluster Status",style:{bold:!0}}},{name:"status",label:"Status",value:{kind:"text",text:"Healthy",plain:"Healthy",style:{bold:!0,color:"#166534"},children:[{kind:"text",text:" in ",plain:" in "},{kind:"text",text:"production",plain:"production",style:{italic:!0}}]}},{name:"actions",label:"Actions",value:{kind:"button-group",items:[{kind:"button",href:"https://example.com/docs",label:{kind:"text",text:"Docs",plain:"Docs"}},{kind:"button",id:"restart",payload:'{"service":"api"}',label:{kind:"text",text:"Restart",plain:"Restart"}}]}},{name:"services",label:"Services",value:{kind:"table",columns:[{name:"name",label:"Name"},{name:"status",label:"Status"},{name:"latency",label:"Latency",align:"right"}],rows:[{cells:{name:{kind:"text",text:"api",plain:"api"},status:{kind:"text",text:"healthy",plain:"healthy",style:{color:"#166534",bold:!0}},latency:{kind:"text",text:"42",plain:"42",style:{monospace:!0}}},detail:{kind:"map",fields:[{name:"owner",label:"Owner",value:{kind:"text",text:"platform",plain:"platform"}},{name:"manifest",label:"Manifest",value:{kind:"code",language:"yaml",source:`apiVersion: v1
kind: Service
metadata:
  name: api`,plain:`apiVersion: v1
kind: Service
metadata:
  name: api`}}]}},{cells:{name:{kind:"text",text:"worker",plain:"worker"},status:{kind:"text",text:"degraded",plain:"degraded",style:{color:"#b45309",bold:!0}},latency:{kind:"text",text:"91",plain:"91",style:{monospace:!0}}}}]}},{name:"topology",label:"Topology",value:{kind:"tree",roots:[{id:"cluster",label:{kind:"text",text:"cluster",plain:"cluster",children:[{kind:"text",text:" / prod-eu",plain:" / prod-eu"}]},children:[{id:"api",label:{kind:"text",text:"api",plain:"api"}},{id:"worker",label:{kind:"text",text:"worker",plain:"worker"}}]}]}},{name:"logs",label:"Logs",value:{kind:"collapsed",label:{kind:"text",text:"Show rollout notes",plain:"Show rollout notes"},content:{kind:"list",items:[{kind:"text",text:"Deployment paused during database migration",plain:"Deployment paused during database migration"},{kind:"text",text:"Worker pool drained before restart",plain:"Worker pool drained before restart"}]}}},{name:"html_note",label:"HTML Note",value:{kind:"html",plain:"sanitized html note",html:'<strong>Heads up</strong>: <span class="text-amber-600">manual approval required</span>'}}]}},te={title:"Data/Clicky",component:A,parameters:{docs:{description:{component:"Renderer for Clicky AST documents produced by the sibling clicky stack. It handles text, tables, trees, badges, code, stack traces, downloads, and command links from one JSON document."}}}},t={args:{data:i}},e={args:{data:JSON.stringify(i)}},a={args:{data:i,view:{pdf:!1,json:!0},download:{all:!0,label:"report"}}},o={args:{url:"/samples/clicky/services.json",data:i,view:[],download:{all:!0,label:"artifact"}}},L={version:1,node:{kind:"table",autoFilter:!0,columns:[{name:"account",label:"Account",sortable:!0,grow:!0},{name:"type",label:"Type",sortable:!0,shrink:!0},{name:"balance",label:"Balance",align:"right",sortable:!0,shrink:!0},{name:"updated",label:"Updated",sortable:!0,shrink:!0}],rows:[{cells:{account:{kind:"text",text:"Operating account",plain:"Operating account"},type:{kind:"text",text:"Bank",plain:"Bank"},balance:{kind:"text",text:"12,480.00",plain:"12480"},updated:{kind:"text",text:"2026-04-15",plain:"2026-04-15"}}},{cells:{account:{kind:"text",text:"Accounts receivable",plain:"Accounts receivable"},type:{kind:"text",text:"Current Asset",plain:"Current Asset"},balance:{kind:"text",text:"8,215.50",plain:"8215.5"},updated:{kind:"text",text:"2026-04-16",plain:"2026-04-16"}}},{cells:{account:{kind:"text",text:"Sales tax payable",plain:"Sales tax payable"},type:{kind:"text",text:"Liability",plain:"Liability"},balance:{kind:"text",text:"-1,142.78",plain:"-1142.78"},updated:{kind:"text",text:"2026-04-18",plain:"2026-04-18"}}}]}},r={args:{url:"/samples/clicky/services.json",data:L,view:[],download:{all:!0,label:"accounts"}},parameters:{docs:{description:{story:"URL-backed Clicky table where download formats are surfaced from the table core menu instead of a separate download toolbar."}}}},l=(N,R)=>({kind:"code",language:N,source:R}),O={version:1,node:{kind:"text",children:[{kind:"text",text:"Go",style:{className:"font-semibold text-sm mt-density-3"}},l("go",`package main

import "fmt"

func main() {
    fmt.Println("Hello, world!")
}`),{kind:"text",text:"Python",style:{className:"font-semibold text-sm mt-density-3"}},l("python",`def greet(name: str = "world") -> str:
    return f"Hello, {name}!"`)]}},n={args:{data:O}};var s,d,p;t.parameters={...t.parameters,docs:{...(s=t.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    data: clickyFixture
  }
}`,...(p=(d=t.parameters)==null?void 0:d.docs)==null?void 0:p.source}}};var m,c,u;e.parameters={...e.parameters,docs:{...(m=e.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    data: JSON.stringify(clickyFixture)
  }
}`,...(u=(c=e.parameters)==null?void 0:c.docs)==null?void 0:u.source}}};var k,x,b;a.parameters={...a.parameters,docs:{...(k=a.parameters)==null?void 0:k.docs,source:{originalSource:`{
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
}`,...(b=(x=a.parameters)==null?void 0:x.docs)==null?void 0:b.source}}};var y,g,w;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    url: "/samples/clicky/services.json",
    data: clickyFixture,
    view: [],
    download: {
      all: true,
      label: "artifact"
    }
  }
}`,...(w=(g=o.parameters)==null?void 0:g.docs)==null?void 0:w.source}}};var f,h,v;r.parameters={...r.parameters,docs:{...(f=r.parameters)==null?void 0:f.docs,source:{originalSource:`{
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
}`,...(v=(h=r.parameters)==null?void 0:h.docs)==null?void 0:v.source}}};var S,D,C;n.parameters={...n.parameters,docs:{...(S=n.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    data: combinedCodeDoc
  }
}`,...(C=(D=n.parameters)==null?void 0:D.docs)==null?void 0:C.source}}};const ee=["RichDocument","JsonStringPayload","WithDownloadControls","RemoteUrl","TableMenuDownloads","CodeNodes"];export{n as CodeNodes,e as JsonStringPayload,o as RemoteUrl,t as RichDocument,r as TableMenuDownloads,a as WithDownloadControls,ee as __namedExportsOrder,te as default};
