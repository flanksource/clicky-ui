import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./StatusDot-DbT6UVe4.js";import{n as i,t as a}from"./MatrixTable-DDwLuKpi.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{i(),n(),o=t(),{expect:s}=__STORYBOOK_MODULE_TEST__,c=[`us-east-1`,`us-west-2`,`eu-west-1`,`ap-southeast-2`],l=[`read`,`write`,`execute`,`jvm-instrument`,`environment-read`,`database-query`,`generated-config`],u=e=>(0,o.jsx)(r,{status:e,size:`md`}),d=[{key:`api`,label:`payments-api`,cells:[u(`success`),u(`success`),u(`warning`),u(`success`)]},{key:`web`,label:`storefront-web`,cells:[u(`success`),u(`error`),u(`success`),u(`success`)]},{key:`worker`,label:`batch-worker`,cells:[u(`warning`),u(`success`),u(`success`),u(`error`)]}],f=Array.from({length:18},(e,t)=>({key:`product-${t+1}`,label:`Product ${String(t+1).padStart(2,`0`)}`,cells:l.map((e,n)=>u((t+n)%7==0?`error`:(t+n)%5==0?`warning`:`success`))})),p={title:`Data/MatrixTable`,component:a,tags:[`autodocs`],parameters:{docs:{description:{component:"Excel-style matrix with a frozen first column and sticky header row, so a service × region (or any 2-axis) grid scrolls under its headers. Cells, columns and the corner are arbitrary nodes. Optional `angledHeaders` rotates long column labels 45°."}}},argTypes:{angledHeaders:{control:`boolean`},density:{control:`inline-radio`,options:[`default`,`compact`]},columns:{control:!1},rows:{control:!1}},args:{corner:`Service`,columns:c,rows:d}},m={},h={args:{angledHeaders:!0,headerHeight:90}},g={args:{angledHeaders:!0,columns:l,rows:f,corner:`Scope`,headerClassName:`bg-background`,maxHeight:420}},_=[{name:`qa`,accent:`#0ea5e9`},{name:`uat`,accent:`#f59e0b`},{name:`prod`,accent:`#e11d48`},{name:`main`,accent:void 0}],v=e=>(0,o.jsx)(`span`,{className:`inline-flex h-6 min-w-9 items-center justify-center rounded-md bg-muted px-1.5 text-xs font-semibold ring-1 ring-inset ring-border`,children:e}),y={args:{density:`compact`,corner:`Entity`,maxHeight:360,headerClassName:`bg-muted/50`,columns:_.map(e=>({header:e.name,title:`side ${e.name}`,...e.accent?{headerStyle:{boxShadow:`inset 0 3px 0 ${e.accent}`},cellStyle:{backgroundColor:`color-mix(in srgb, ${e.accent} 6%, transparent)`}}:{}})),rows:[{type:`group`,key:`product:annuity`,label:`Annuity`},{type:`group`,key:`plan:annuity`,label:`Annuity Plan`,depth:1},{key:`add-rider`,label:`AddRider`,depth:2,cells:[`A`,`A`,`B`,`A`].map(v)},{key:`withdrawal`,label:`Withdrawal`,depth:2,cells:[`A`,`A`,`A`,`A`].map(v)},{type:`group`,key:`product:life`,label:`Group Life`},{type:`group`,key:`plan:gl`,label:`GL`,depth:1},{key:`enroll`,label:`GroupLifeEnrollment with a deliberately long label`,depth:2,cells:[`A`,`B`,`C`,`A`].map(v)}]},play:async({canvasElement:e})=>{let t=e.querySelectorAll(`tr[data-matrix-group]`);await s(t).toHaveLength(4);let n=t[0]?.querySelector(`th`);await s(n).toHaveAttribute(`colspan`,String(_.length+1));let r=e.querySelector(`table`);await s(n?.getBoundingClientRect().width).toBeCloseTo(r?.getBoundingClientRect().width??0,0)}},b={args:{rows:[],emptyMessage:`No deployments to compare`}},x=[`Default`,`AngledHeaders`,`AngledHeadersWithBackground`,`GroupedRowsAndColumnTints`,`Empty`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    angledHeaders: true,
    headerHeight: 90
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    angledHeaders: true,
    columns: PERMISSION_COLUMNS,
    rows: PERMISSION_ROWS,
    corner: "Scope",
    headerClassName: "bg-background",
    maxHeight: 420
  }
}`,...g.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    rows: [],
    emptyMessage: "No deployments to compare"
  }
}`,...b.parameters?.docs?.source}}}})))()}S();export{h as AngledHeaders,g as AngledHeadersWithBackground,m as Default,b as Empty,y as GroupedRowsAndColumnTints,x as __namedExportsOrder,p as default};