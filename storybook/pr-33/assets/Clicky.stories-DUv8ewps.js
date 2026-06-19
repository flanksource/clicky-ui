import{b as A}from"./Clicky-CxATA9xQ.js";import"./iframe-BiJjU2HO.js";import"./preload-helper-2oGg8WnX.js";import"./suspense-CE1kbSpp.js";import"./useQuery-CWOEtHNe.js";import"./FilterForm-Dkli9Q6H.js";import"./button-Bq6OtZ5-.js";import"./utils-BLSKlp9E.js";import"./index-1evVQkiP.js";import"./loading-ZWjVqhnr.js";import"./TimeRange-BTjpaOrP.js";import"./floating-ui.react-BtBEW8Wo.js";import"./index-Ct7BkFIG.js";import"./index-oISezv9l.js";import"./Icon-DO6qyvlM.js";import"./modalStack-CpXAXQz5.js";import"./zIndex-CigQ76av.js";import"./select-CURuYAt0.js";import"./UiChevronDown-e2uFe16b.js";import"./UiWatch-CUJ8td2M.js";import"./UiCalendar-B-73cpUU.js";import"./UiArrowRight-B1Ks5-q1.js";import"./UiClose-D1zGB7Oa.js";import"./FilterPill-DqddeDOo.js";import"./UiAdd-CJElNuxK.js";import"./UiRemove-mJbaqQH_.js";import"./UiCheck-r0P984Kc.js";import"./types-BHfRQr8X.js";import"./UiSearch-B6pKN-d6.js";import"./DataTable-DuwqXEFp.js";import"./SortableHeader-CrTWcrvn.js";import"./use-theme-BBgKh4lJ.js";import"./Modal-BhRuVo6a.js";import"./UiFullscreen-B-tYCWX0.js";import"./FilterBar-BvKHoZKr.js";import"./timestamp-format-ukGnKWnC.js";import"./Combobox-DT8eBMld.js";import"./json-schema-form-size-DYVq0lph.js";import"./DateTimePicker-DszBGVO8.js";import"./MultiSelect-DCUMcpmc.js";import"./UiChevronUp-DV520mvX.js";import"./RangeSlider-E85wjFIU.js";import"./UiFilter-DtuRZhHC.js";import"./UiChevronRight-BceXzGzL.js";import"./Timestamp-PR-vLMZZ.js";import"./TagList-CikprBYd.js";import"./Badge-C5DOLWBy.js";import"./HoverCard-D-RsjCoE.js";import"./Properties-BpezNhDw.js";import"./UiZoomOut-DSISmxth.js";import"./UiCopy-Bvb4O-IS.js";import"./StatusDot-DSKq0U0o.js";import"./UiEllipsis-BDbo0zqq.js";import"./UiArrowLeft-DLcgw-6o.js";import"./UiRows-fwqRCD5_.js";import"./UiListFlat-yGYulon3.js";import"./UiSun-Ddyi75Mf.js";import"./Tree-DLpZnTwz.js";import"./TreeNode-E6dQ7Mis.js";import"./UiExpandAll-DJU1fC9B.js";import"./CodeBlock-C392u-qc.js";import"./JsonView-DTE5YJH_.js";import"./code-highlight-CJaZvzKy.js";import"./RenderedStackTrace-uYBb4cH4.js";import"./UiError-Beql1L6O.js";import"./UiStackFrameDot-wSNayZ4C.js";import"./UiChip-Bhulc-ol.js";import"./UiDebugStepOver-CGMQG1RY.js";import"./UiMethod-GhA2KqrQ.js";import"./UiCloudDownload-DNSve1uH.js";import"./UiComment-nqCepTSi.js";import"./UiTable-DC0grity.js";import"./UiFileCode-DecQr7JE.js";import"./UiFileSpreadsheet-eeC3ICgT.js";import"./UiMarkdown-B-tspGyq.js";import"./UiFileText-DhA7wxIr.js";import"./UiJson-zNRlqYFX.js";const i={version:1,node:{kind:"map",fields:[{name:"title",label:"Title",value:{kind:"text",text:"Cluster Status",plain:"Cluster Status",style:{bold:!0}}},{name:"status",label:"Status",value:{kind:"text",text:"Healthy",plain:"Healthy",style:{bold:!0,color:"#166534"},children:[{kind:"text",text:" in ",plain:" in "},{kind:"text",text:"production",plain:"production",style:{italic:!0}}]}},{name:"actions",label:"Actions",value:{kind:"button-group",items:[{kind:"button",href:"https://example.com/docs",label:{kind:"text",text:"Docs",plain:"Docs"}},{kind:"button",id:"restart",payload:'{"service":"api"}',label:{kind:"text",text:"Restart",plain:"Restart"}}]}},{name:"services",label:"Services",value:{kind:"table",columns:[{name:"name",label:"Name"},{name:"status",label:"Status"},{name:"latency",label:"Latency",align:"right"}],rows:[{cells:{name:{kind:"text",text:"api",plain:"api"},status:{kind:"text",text:"healthy",plain:"healthy",style:{color:"#166534",bold:!0}},latency:{kind:"text",text:"42",plain:"42",style:{monospace:!0}}},detail:{kind:"map",fields:[{name:"owner",label:"Owner",value:{kind:"text",text:"platform",plain:"platform"}},{name:"manifest",label:"Manifest",value:{kind:"code",language:"yaml",source:`apiVersion: v1
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
