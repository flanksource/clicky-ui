import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{i as t,t as n}from"./Clicky-BWO_5MPD.js";import{i as r,n as i,t as a}from"./Clicky.fixtures-DPEyihul.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{t(),r(),o={title:`Data/Clicky`,component:n,parameters:{docs:{description:{component:`Renderer for Clicky AST documents produced by the sibling clicky stack. It handles text, tables, trees, badges, code, stack traces, downloads, and command links from one JSON document.`}}}},s={args:{data:a}},c={args:{data:JSON.stringify(a)}},l={args:{data:i}},u={version:1,node:{kind:`list`,unstyled:!0,items:[{kind:`admonition`,severity:`note`,label:{kind:`text`,text:`Note`},content:{kind:`text`,text:`Board approval is tracked separately.`}},{kind:`admonition`,severity:`info`,label:{kind:`text`,text:`Information`},content:{kind:`text`,text:`Comparatives use the prior reporting pack.`}},{kind:`admonition`,severity:`tip`,label:{kind:`text`,text:`Tip`},content:{kind:`text`,text:`Attach the signed trial balance before export.`}},{kind:`admonition`,severity:`warning`,label:{kind:`text`,text:`Warning`},content:{kind:`text`,text:`Manual review is required for this note.`}},{kind:`admonition`,severity:`danger`,label:{kind:`text`,text:`Danger`},content:{kind:`text`,text:`Publication is blocked until cash reconciles.`}}]}},d={args:{data:u}},f={args:{data:a,view:{pdf:!1,json:!0},download:{all:!0,label:`report`}}},p={args:{url:`/samples/clicky/services.json`,data:a,view:[],download:{all:!0,label:`artifact`}}},m={version:1,node:{kind:`table`,autoFilter:!0,columns:[{name:`account`,label:`Account`,sortable:!0,grow:!0},{name:`type`,label:`Type`,sortable:!0,shrink:!0},{name:`balance`,label:`Balance`,align:`right`,sortable:!0,shrink:!0},{name:`updated`,label:`Updated`,sortable:!0,shrink:!0}],rows:[{cells:{account:{kind:`text`,text:`Operating account`,plain:`Operating account`},type:{kind:`text`,text:`Bank`,plain:`Bank`},balance:{kind:`text`,text:`12,480.00`,plain:`12480`},updated:{kind:`text`,text:`2026-04-15`,plain:`2026-04-15`}}},{cells:{account:{kind:`text`,text:`Accounts receivable`,plain:`Accounts receivable`},type:{kind:`text`,text:`Current Asset`,plain:`Current Asset`},balance:{kind:`text`,text:`8,215.50`,plain:`8215.5`},updated:{kind:`text`,text:`2026-04-16`,plain:`2026-04-16`}}},{cells:{account:{kind:`text`,text:`Sales tax payable`,plain:`Sales tax payable`},type:{kind:`text`,text:`Liability`,plain:`Liability`},balance:{kind:`text`,text:`-1,142.78`,plain:`-1142.78`},updated:{kind:`text`,text:`2026-04-18`,plain:`2026-04-18`}}}]}},h={args:{url:`/samples/clicky/services.json`,data:m,view:[],download:{all:!0,label:`accounts`}},parameters:{docs:{description:{story:`URL-backed Clicky table where download formats are surfaced from the table core menu instead of a separate download toolbar.`}}}},g=(e,t)=>({kind:`code`,language:e,source:t}),_={version:1,node:{kind:`text`,children:[{kind:`text`,text:`Go`,style:{className:`font-semibold text-sm mt-density-3`}},g(`go`,`package main

import "fmt"

func main() {
    fmt.Println("Hello, world!")
}`),{kind:`text`,text:`Python`,style:{className:`font-semibold text-sm mt-density-3`}},g(`python`,`def greet(name: str = "world") -> str:
    return f"Hello, {name}!"`)]}},v={args:{data:_}},y=[`RichDocument`,`JsonStringPayload`,`MarkdownBlocks`,`AdmonitionSeverities`,`WithDownloadControls`,`RemoteUrl`,`TableMenuDownloads`,`CodeNodes`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    data: clickyFixture
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    data: JSON.stringify(clickyFixture)
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    data: clickyMarkdownBlocksFixture
  }
}`,...l.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    data: admonitionSeveritiesDoc
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    url: "/samples/clicky/services.json",
    data: clickyFixture,
    view: [],
    download: {
      all: true,
      label: "artifact"
    }
  }
}`,...p.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    data: combinedCodeDoc
  }
}`,...v.parameters?.docs?.source}}}})))()}b();export{d as AdmonitionSeverities,v as CodeNodes,c as JsonStringPayload,l as MarkdownBlocks,p as RemoteUrl,s as RichDocument,h as TableMenuDownloads,f as WithDownloadControls,y as __namedExportsOrder,o as default};