import{b as A}from"./Clicky-Cm1OJiCj.js";import"./iframe-ChhGfndY.js";import"./preload-helper-D5l2DbWZ.js";import"./suspense-DVStHZID.js";import"./useQuery-BLpIaRIj.js";import"./FilterForm-kMa5p6AN.js";import"./button-B_Z8s8vs.js";import"./utils-BLSKlp9E.js";import"./index-1evVQkiP.js";import"./loading-TLYQvG27.js";import"./TimeRange-LSxJrMLJ.js";import"./Icon-CYeB20F_.js";import"./select-CAqDlAGE.js";import"./UiChevronDown-CUiVFXzA.js";import"./UiWatch-MrCgZBYb.js";import"./UiCalendar-CPvlgWhM.js";import"./UiArrowRight-CFSaZxfG.js";import"./UiClose-DcGXWzrE.js";import"./FilterPill-bgJNW4vl.js";import"./UiAdd-h1IuClyL.js";import"./UiRemove-1ki0-NK9.js";import"./UiCheck-NmGBycic.js";import"./types-BHfRQr8X.js";import"./UiSearch-CHBRbBmR.js";import"./DataTable-CbptW96P.js";import"./SortableHeader-DyYNVPlu.js";import"./use-theme-Dlq9daPI.js";import"./Modal-DdpFV-bX.js";import"./index-DIRkFHAF.js";import"./index-C4HJUOxc.js";import"./UiFullscreen-C9wG_8Y-.js";import"./FilterBar-BwPgayUV.js";import"./timestamp-format-ukGnKWnC.js";import"./Combobox-C0jGKp3c.js";import"./json-schema-form-size-DYVq0lph.js";import"./DateTimePicker-CsSXnIK9.js";import"./MultiSelect-BfDlepii.js";import"./UiChevronUp-zRG4p9CL.js";import"./RangeSlider-BWkiL0FG.js";import"./UiFilter-DXxmIRYq.js";import"./UiChevronRight-BnkLT8LU.js";import"./Timestamp-ChBTR5YC.js";import"./TagList-BVAtdLFX.js";import"./Badge-6893KHoo.js";import"./HoverCard-B7_P5PWB.js";import"./Properties-D_TNG4k3.js";import"./UiZoomOut-2U38Xp2I.js";import"./UiCopy-BajsyPmw.js";import"./StatusDot-CHK0R5Dk.js";import"./UiEllipsis-O5v8tcGn.js";import"./UiArrowLeft-uYj0HzhT.js";import"./UiRows-C6sOfJ_L.js";import"./UiListFlat-DiEMNcCL.js";import"./UiSun-BgGhsien.js";import"./Tree-yiaNQwql.js";import"./TreeNode-CVQH1Uw-.js";import"./UiExpandAll-ClvcpyZm.js";import"./CodeBlock-BSXogfzU.js";import"./JsonView-ZSnrc377.js";import"./code-highlight-DzzumZyi.js";import"./RenderedStackTrace-Crs21faP.js";import"./UiError-N-BdXqTl.js";import"./UiStackFrameDot-CXLqIfJg.js";import"./UiChip-DaoiB19j.js";import"./UiDebugStepOver-CYYzUK1Z.js";import"./UiMethod-ve3m4zxk.js";import"./UiCloudDownload-De6JitJl.js";import"./UiComment-BXVq6rx7.js";import"./UiTable--T2LD365.js";import"./UiFileCode-DOxFhyka.js";import"./UiFileSpreadsheet-DVLikLHh.js";import"./UiMarkdown-cjxZpefk.js";import"./UiFileText-CkL29K5G.js";import"./UiJson-DDmX0iZ1.js";const i={version:1,node:{kind:"map",fields:[{name:"title",label:"Title",value:{kind:"text",text:"Cluster Status",plain:"Cluster Status",style:{bold:!0}}},{name:"status",label:"Status",value:{kind:"text",text:"Healthy",plain:"Healthy",style:{bold:!0,color:"#166534"},children:[{kind:"text",text:" in ",plain:" in "},{kind:"text",text:"production",plain:"production",style:{italic:!0}}]}},{name:"actions",label:"Actions",value:{kind:"button-group",items:[{kind:"button",href:"https://example.com/docs",label:{kind:"text",text:"Docs",plain:"Docs"}},{kind:"button",id:"restart",payload:'{"service":"api"}',label:{kind:"text",text:"Restart",plain:"Restart"}}]}},{name:"services",label:"Services",value:{kind:"table",columns:[{name:"name",label:"Name"},{name:"status",label:"Status"},{name:"latency",label:"Latency",align:"right"}],rows:[{cells:{name:{kind:"text",text:"api",plain:"api"},status:{kind:"text",text:"healthy",plain:"healthy",style:{color:"#166534",bold:!0}},latency:{kind:"text",text:"42",plain:"42",style:{monospace:!0}}},detail:{kind:"map",fields:[{name:"owner",label:"Owner",value:{kind:"text",text:"platform",plain:"platform"}},{name:"manifest",label:"Manifest",value:{kind:"code",language:"yaml",source:`apiVersion: v1
kind: Service
metadata:
  name: api`,plain:`apiVersion: v1
kind: Service
metadata:
  name: api`}}]}},{cells:{name:{kind:"text",text:"worker",plain:"worker"},status:{kind:"text",text:"degraded",plain:"degraded",style:{color:"#b45309",bold:!0}},latency:{kind:"text",text:"91",plain:"91",style:{monospace:!0}}}}]}},{name:"topology",label:"Topology",value:{kind:"tree",roots:[{id:"cluster",label:{kind:"text",text:"cluster",plain:"cluster",children:[{kind:"text",text:" / prod-eu",plain:" / prod-eu"}]},children:[{id:"api",label:{kind:"text",text:"api",plain:"api"}},{id:"worker",label:{kind:"text",text:"worker",plain:"worker"}}]}]}},{name:"logs",label:"Logs",value:{kind:"collapsed",label:{kind:"text",text:"Show rollout notes",plain:"Show rollout notes"},content:{kind:"list",items:[{kind:"text",text:"Deployment paused during database migration",plain:"Deployment paused during database migration"},{kind:"text",text:"Worker pool drained before restart",plain:"Worker pool drained before restart"}]}}},{name:"html_note",label:"HTML Note",value:{kind:"html",plain:"sanitized html note",html:'<strong>Heads up</strong>: <span class="text-amber-600">manual approval required</span>'}}]}},Yt={title:"Data/Clicky",component:A,parameters:{docs:{description:{component:"Renderer for Clicky AST documents produced by the sibling clicky stack. It handles text, tables, trees, badges, code, stack traces, downloads, and command links from one JSON document."}}}},t={args:{data:i}},e={args:{data:JSON.stringify(i)}},a={args:{data:i,view:{pdf:!1,json:!0},download:{all:!0,label:"report"}}},o={args:{url:"/samples/clicky/services.json",data:i,view:[],download:{all:!0,label:"artifact"}}},L={version:1,node:{kind:"table",autoFilter:!0,columns:[{name:"account",label:"Account",sortable:!0,grow:!0},{name:"type",label:"Type",sortable:!0,shrink:!0},{name:"balance",label:"Balance",align:"right",sortable:!0,shrink:!0},{name:"updated",label:"Updated",sortable:!0,shrink:!0}],rows:[{cells:{account:{kind:"text",text:"Operating account",plain:"Operating account"},type:{kind:"text",text:"Bank",plain:"Bank"},balance:{kind:"text",text:"12,480.00",plain:"12480"},updated:{kind:"text",text:"2026-04-15",plain:"2026-04-15"}}},{cells:{account:{kind:"text",text:"Accounts receivable",plain:"Accounts receivable"},type:{kind:"text",text:"Current Asset",plain:"Current Asset"},balance:{kind:"text",text:"8,215.50",plain:"8215.5"},updated:{kind:"text",text:"2026-04-16",plain:"2026-04-16"}}},{cells:{account:{kind:"text",text:"Sales tax payable",plain:"Sales tax payable"},type:{kind:"text",text:"Liability",plain:"Liability"},balance:{kind:"text",text:"-1,142.78",plain:"-1142.78"},updated:{kind:"text",text:"2026-04-18",plain:"2026-04-18"}}}]}},r={args:{url:"/samples/clicky/services.json",data:L,view:[],download:{all:!0,label:"accounts"}},parameters:{docs:{description:{story:"URL-backed Clicky table where download formats are surfaced from the table core menu instead of a separate download toolbar."}}}},l=(N,R)=>({kind:"code",language:N,source:R}),O={version:1,node:{kind:"text",children:[{kind:"text",text:"Go",style:{className:"font-semibold text-sm mt-density-3"}},l("go",`package main

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
}`,...(C=(D=n.parameters)==null?void 0:D.docs)==null?void 0:C.source}}};const Zt=["RichDocument","JsonStringPayload","WithDownloadControls","RemoteUrl","TableMenuDownloads","CodeNodes"];export{n as CodeNodes,e as JsonStringPayload,o as RemoteUrl,t as RichDocument,r as TableMenuDownloads,a as WithDownloadControls,Zt as __namedExportsOrder,Yt as default};
