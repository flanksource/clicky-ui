import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./utils-CEDXhWC6.js";import{n as a,t as o}from"./StatusDot-BMsxwjyw.js";function s(e){return typeof e==`object`&&!!e&&!(0,p.isValidElement)(e)&&!(Symbol.iterator in e)&&`header`in e}function c(e){return e.type===`group`}function l(e){return s(e)?e:{header:e}}function u({depth:e,children:t}){return e?(0,m.jsx)(`div`,{style:{paddingLeft:`${e*h}rem`},children:t}):(0,m.jsx)(m.Fragment,{children:t})}function d({columns:e,rows:t,corner:n,emptyMessage:r=`No data`,angledHeaders:a=!1,density:o=`default`,columnWidth:s=48,headerHeight:d=120,maxHeight:p,className:h,columnClassName:g,rowLabelClassName:_,cellClassName:v,headerClassName:y,groupRowClassName:b}){let x=e.map(l),S=Math.round(d*1.41),C=Math.round(d*.71),w=o===`compact`,T=w?`px-density-2 py-density-1`:`px-density-3 py-density-2`,E=w?`px-density-2 py-1`:`px-density-3 py-density-2`,D=w?`px-density-2 py-1`:`px-density-3 py-density-2`,O={width:s,minWidth:s,maxWidth:s};return(0,m.jsx)(`div`,{className:i(`overflow-auto rounded-md border border-border`,h),style:{...a?{paddingRight:C}:void 0,...p===void 0?void 0:{maxHeight:p}},children:(0,m.jsxs)(`table`,{className:i(`w-max min-w-full border-collapse`,w?`text-xs`:`text-sm`),children:[a&&(0,m.jsxs)(`colgroup`,{children:[(0,m.jsx)(`col`,{}),x.map((e,t)=>(0,m.jsx)(`col`,{style:{width:s}},t))]}),(0,m.jsx)(`thead`,{className:i(a&&`sticky top-0 z-20`),children:(0,m.jsxs)(`tr`,{className:i(!a&&`border-b border-border`,y),children:[(0,m.jsx)(`th`,{scope:`col`,className:i(`sticky left-0 top-0 z-30 min-w-44 border-r border-border text-left font-medium`,T,a?`align-bottom`:i(`border-b border-border`,g),y),children:n}),x.map((e,t)=>a?(0,m.jsxs)(`th`,{scope:`col`,title:e.title??f(e.header),className:i(`relative overflow-visible border-b border-border p-0 align-bottom`,g,y,`bg-transparent`,e.headerClassName),style:{...O,height:d,...e.headerStyle},children:[(0,m.jsx)(`div`,{className:`absolute bottom-0 border-b border-border`,style:{left:s,width:S,transform:`rotate(-45deg)`,transformOrigin:`0 100%`}}),t===0&&(0,m.jsx)(`div`,{className:`absolute bottom-0 border-b border-border`,style:{left:0,width:S,transform:`rotate(-45deg)`,transformOrigin:`0 100%`}}),(0,m.jsx)(`div`,{className:`absolute bottom-0 overflow-hidden text-ellipsis whitespace-nowrap pl-1 text-left text-xs font-medium leading-none text-muted-foreground`,style:{left:s/2,width:S,transform:`rotate(-45deg)`,transformOrigin:`0 100%`},children:e.header})]},t):(0,m.jsx)(`th`,{scope:`col`,title:e.title,className:i(`sticky top-0 z-20 min-w-24 whitespace-nowrap border-b border-border text-center text-xs font-medium text-muted-foreground`,T,g,y,e.headerClassName),style:e.headerStyle,children:e.header},t))]})}),(0,m.jsxs)(`tbody`,{children:[t.length===0&&(0,m.jsx)(`tr`,{children:(0,m.jsx)(`td`,{colSpan:x.length+1,className:`p-density-3 text-sm text-muted-foreground`,children:r})}),t.map(e=>c(e)?(0,m.jsx)(`tr`,{"data-matrix-group":e.key,className:`border-b border-border last:border-b-0`,children:(0,m.jsx)(`th`,{scope:`colgroup`,colSpan:x.length+1,className:i(`p-0 text-left text-[11px] text-foreground`,(e.depth??0)===0?`bg-muted/70 font-semibold`:`bg-muted/30 font-medium`,b,e.className),children:(0,m.jsx)(`div`,{className:i(`sticky left-0 inline-flex max-w-full items-center gap-1.5`,E),children:(0,m.jsx)(u,{depth:e.depth,children:e.label})})})},e.key):(0,m.jsxs)(`tr`,{className:`border-b border-border last:border-b-0`,children:[(0,m.jsx)(`th`,{scope:`row`,className:i(`sticky left-0 z-10 border-r border-border bg-background text-left font-medium`,E,_),children:(0,m.jsx)(u,{depth:e.depth,children:e.label})}),x.map((t,n)=>(0,m.jsx)(`td`,{className:i(a?`p-0 text-center align-middle`:i(D,`text-center align-middle`),v,t.cellClassName),style:a||t.cellStyle?{...a?O:void 0,...t.cellStyle}:void 0,children:e.cells[n]??null},n))]},e.key))]})]})})}function f(e){if(typeof e==`string`||typeof e==`number`)return String(e)}var p,m,h;function g(){return(g=e((()=>{p=t(),r(),m=n(),h=.75;try{d.displayName=`MatrixTable`,d.__docgenInfo={description:``,displayName:`MatrixTable`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/MatrixTable.tsx`,methods:[],props:{columns:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/MatrixTable.tsx`,name:`TypeLiteral`}],description:"Column headers: a bare node, or a `MatrixTableColumn` for per-column styling.",name:`columns`,required:!0,tags:{},type:{name:`(ReactNode | MatrixTableColumn)[]`}},rows:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/MatrixTable.tsx`,name:`TypeLiteral`}],description:``,name:`rows`,required:!0,tags:{},type:{name:`(MatrixTableRow | MatrixTableGroupRow)[]`}},corner:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/MatrixTable.tsx`,name:`TypeLiteral`}],description:``,name:`corner`,required:!1,tags:{},type:{name:`ReactNode`}},emptyMessage:{defaultValue:{value:`No data`},declarations:[{fileName:`clicky-ui/packages/ui/src/data/MatrixTable.tsx`,name:`TypeLiteral`}],description:``,name:`emptyMessage`,required:!1,tags:{},type:{name:`ReactNode`}},angledHeaders:{defaultValue:{value:`false`},declarations:[{fileName:`clicky-ui/packages/ui/src/data/MatrixTable.tsx`,name:`TypeLiteral`}],description:``,name:`angledHeaders`,required:!1,tags:{},type:{name:`boolean`}},density:{defaultValue:{value:`default`},declarations:[{fileName:`clicky-ui/packages/ui/src/data/MatrixTable.tsx`,name:`TypeLiteral`}],description:``,name:`density`,required:!1,tags:{},type:{name:`enum`,raw:`"default" | "compact"`,value:[{value:`"default"`},{value:`"compact"`}]}},columnWidth:{defaultValue:{value:`48`},declarations:[{fileName:`clicky-ui/packages/ui/src/data/MatrixTable.tsx`,name:`TypeLiteral`}],description:``,name:`columnWidth`,required:!1,tags:{},type:{name:`number`}},headerHeight:{defaultValue:{value:`120`},declarations:[{fileName:`clicky-ui/packages/ui/src/data/MatrixTable.tsx`,name:`TypeLiteral`}],description:``,name:`headerHeight`,required:!1,tags:{},type:{name:`number`}},maxHeight:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/MatrixTable.tsx`,name:`TypeLiteral`}],description:``,name:`maxHeight`,required:!1,tags:{},type:{name:`string | number`}},className:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/MatrixTable.tsx`,name:`TypeLiteral`}],description:``,name:`className`,required:!1,tags:{},type:{name:`string`}},columnClassName:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/MatrixTable.tsx`,name:`TypeLiteral`}],description:``,name:`columnClassName`,required:!1,tags:{},type:{name:`string`}},rowLabelClassName:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/MatrixTable.tsx`,name:`TypeLiteral`}],description:``,name:`rowLabelClassName`,required:!1,tags:{},type:{name:`string`}},cellClassName:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/MatrixTable.tsx`,name:`TypeLiteral`}],description:``,name:`cellClassName`,required:!1,tags:{},type:{name:`string`}},headerClassName:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/MatrixTable.tsx`,name:`TypeLiteral`}],description:``,name:`headerClassName`,required:!1,tags:{},type:{name:`string`}},groupRowClassName:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/MatrixTable.tsx`,name:`TypeLiteral`}],description:`Classes added to every group row's cell.`,name:`groupRowClassName`,required:!1,tags:{},type:{name:`string`}}},tags:{}}}catch{}})))()}var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M;function N(){return(N=e((()=>{g(),a(),_=n(),{expect:v}=__STORYBOOK_MODULE_TEST__,y=[`us-east-1`,`us-west-2`,`eu-west-1`,`ap-southeast-2`],b=[`read`,`write`,`execute`,`jvm-instrument`,`environment-read`,`database-query`,`generated-config`],x=e=>(0,_.jsx)(o,{status:e,size:`md`}),S=[{key:`api`,label:`payments-api`,cells:[x(`success`),x(`success`),x(`warning`),x(`success`)]},{key:`web`,label:`storefront-web`,cells:[x(`success`),x(`error`),x(`success`),x(`success`)]},{key:`worker`,label:`batch-worker`,cells:[x(`warning`),x(`success`),x(`success`),x(`error`)]}],C=Array.from({length:18},(e,t)=>({key:`product-${t+1}`,label:`Product ${String(t+1).padStart(2,`0`)}`,cells:b.map((e,n)=>x((t+n)%7==0?`error`:(t+n)%5==0?`warning`:`success`))})),w={title:`Data/MatrixTable`,component:d,tags:[`autodocs`],parameters:{docs:{description:{component:"Excel-style matrix with a frozen first column and sticky header row, so a service × region (or any 2-axis) grid scrolls under its headers. Cells, columns and the corner are arbitrary nodes. Optional `angledHeaders` rotates long column labels 45°."}}},argTypes:{angledHeaders:{control:`boolean`},density:{control:`inline-radio`,options:[`default`,`compact`]},columns:{control:!1},rows:{control:!1}},args:{corner:`Service`,columns:y,rows:S}},T={},E={args:{angledHeaders:!0,headerHeight:90}},D={args:{angledHeaders:!0,columns:b,rows:C,corner:`Scope`,headerClassName:`bg-background`,maxHeight:420}},O=[{name:`qa`,accent:`#0ea5e9`},{name:`uat`,accent:`#f59e0b`},{name:`prod`,accent:`#e11d48`},{name:`main`,accent:void 0}],k=e=>(0,_.jsx)(`span`,{className:`inline-flex h-6 min-w-9 items-center justify-center rounded-md bg-muted px-1.5 text-xs font-semibold ring-1 ring-inset ring-border`,children:e}),A={args:{density:`compact`,corner:`Entity`,maxHeight:360,headerClassName:`bg-muted/50`,columns:O.map(e=>({header:e.name,title:`side ${e.name}`,...e.accent?{headerStyle:{boxShadow:`inset 0 3px 0 ${e.accent}`},cellStyle:{backgroundColor:`color-mix(in srgb, ${e.accent} 6%, transparent)`}}:{}})),rows:[{type:`group`,key:`product:annuity`,label:`Annuity`},{type:`group`,key:`plan:annuity`,label:`Annuity Plan`,depth:1},{key:`add-rider`,label:`AddRider`,depth:2,cells:[`A`,`A`,`B`,`A`].map(k)},{key:`withdrawal`,label:`Withdrawal`,depth:2,cells:[`A`,`A`,`A`,`A`].map(k)},{type:`group`,key:`product:life`,label:`Group Life`},{type:`group`,key:`plan:gl`,label:`GL`,depth:1},{key:`enroll`,label:`GroupLifeEnrollment with a deliberately long label`,depth:2,cells:[`A`,`B`,`C`,`A`].map(k)}]},play:async({canvasElement:e})=>{let t=e.querySelectorAll(`tr[data-matrix-group]`);await v(t).toHaveLength(4);let n=t[0]?.querySelector(`th`);await v(n).toHaveAttribute(`colspan`,String(O.length+1));let r=e.querySelector(`table`);await v(n?.getBoundingClientRect().width).toBeCloseTo(r?.getBoundingClientRect().width??0,0)}},j={args:{rows:[],emptyMessage:`No deployments to compare`}},M=[`Default`,`AngledHeaders`,`AngledHeadersWithBackground`,`GroupedRowsAndColumnTints`,`Empty`],T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    angledHeaders: true,
    headerHeight: 90
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    angledHeaders: true,
    columns: PERMISSION_COLUMNS,
    rows: PERMISSION_ROWS,
    corner: "Scope",
    headerClassName: "bg-background",
    maxHeight: 420
  }
}`,...D.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    density: "compact",
    corner: "Entity",
    maxHeight: 360,
    headerClassName: "bg-muted/50",
    columns: SIDES.map(side => ({
      header: side.name,
      title: \`side \${side.name}\`,
      ...(side.accent ? {
        headerStyle: {
          boxShadow: \`inset 0 3px 0 \${side.accent}\`
        },
        cellStyle: {
          backgroundColor: \`color-mix(in srgb, \${side.accent} 6%, transparent)\`
        }
      } : {})
    })),
    rows: [{
      type: "group",
      key: "product:annuity",
      label: "Annuity"
    }, {
      type: "group",
      key: "plan:annuity",
      label: "Annuity Plan",
      depth: 1
    }, {
      key: "add-rider",
      label: "AddRider",
      depth: 2,
      cells: ["A", "A", "B", "A"].map(variant)
    }, {
      key: "withdrawal",
      label: "Withdrawal",
      depth: 2,
      cells: ["A", "A", "A", "A"].map(variant)
    }, {
      type: "group",
      key: "product:life",
      label: "Group Life"
    }, {
      type: "group",
      key: "plan:gl",
      label: "GL",
      depth: 1
    }, {
      key: "enroll",
      label: "GroupLifeEnrollment with a deliberately long label",
      depth: 2,
      cells: ["A", "B", "C", "A"].map(variant)
    }]
  },
  play: async ({
    canvasElement
  }) => {
    const groups = canvasElement.querySelectorAll("tr[data-matrix-group]");
    await expect(groups).toHaveLength(4);
    const product = groups[0]?.querySelector("th");
    await expect(product).toHaveAttribute("colspan", String(SIDES.length + 1));
    // A group band spans the full table width, not just the label column.
    const table = canvasElement.querySelector("table");
    await expect(product?.getBoundingClientRect().width).toBeCloseTo(table?.getBoundingClientRect().width ?? 0, 0);
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    rows: [],
    emptyMessage: "No deployments to compare"
  }
}`,...j.parameters?.docs?.source}}}})))()}N();export{E as AngledHeaders,D as AngledHeadersWithBackground,T as Default,j as Empty,A as GroupedRowsAndColumnTints,M as __namedExportsOrder,w as default};