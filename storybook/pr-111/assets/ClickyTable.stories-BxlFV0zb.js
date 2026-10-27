import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{Ii as t,Ji as n,Ki as r,Pi as i,Qi as a,n as o}from"./icons-Dd_HwYAK.js";import{i as s,r as c}from"./Clicky-DxRp1FSZ.js";var l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{o(),s(),l=[{name:`service`,label:`Service`,sortable:!0,grow:!0},{name:`status`,label:`Status`,kind:`status`,sortable:!0,shrink:!0},{name:`labels`,label:`Labels`,kind:`tags`,filterable:!0,grow:!0}],u=[{cells:{service:{kind:`text`,text:`api`},status:{kind:`text`,text:`healthy`},labels:{kind:`map`,fields:[{name:`team`,value:{kind:`text`,text:`platform`}},{name:`tier`,value:{kind:`text`,text:`edge`}}]}},detail:{kind:`code`,language:`json`,source:JSON.stringify({requests:12492,errors:3},null,2)}},{cells:{service:{kind:`text`,text:`worker`},status:{kind:`text`,text:`degraded`},labels:{kind:`list`,items:[{kind:`text`,text:`team=data`},{kind:`text`,text:`queue=imports`}]}},detail:{kind:`text`,text:`Retry queue is above the warning threshold.`}}],d=[{id:`download-yaml`,label:`YAML`,icon:a,iconClassName:`text-violet-600 dark:text-violet-400`,onSelect:()=>{console.info(`Download YAML`)}},{id:`download-json`,label:`JSON`,icon:n,onSelect:()=>{console.info(`Download JSON`)}},{id:`download-csv`,label:`CSV`,icon:i,iconClassName:`text-emerald-600 dark:text-emerald-400`,onSelect:()=>{console.info(`Download CSV`)}},{id:`download-pdf`,label:`PDF`,icon:t,iconClassName:`text-rose-600 dark:text-rose-400`,onSelect:()=>{console.info(`Download PDF`)}},{id:`download-markdown`,label:`Markdown`,icon:r,onSelect:()=>{console.info(`Download Markdown`)}}],f={title:`Data/Clicky/Table`,component:c,args:{columns:l,rows:u,autoFilter:!0},argTypes:{onTableRowClick:{table:{disable:!0}},getTableRowHref:{table:{disable:!0}},isTableRowClickable:{table:{disable:!0}},search:{table:{disable:!0}},timeRange:{table:{disable:!0}},externalFilters:{table:{disable:!0}},pagination:{table:{disable:!0}},menuActions:{table:{disable:!0}}},parameters:{docs:{description:{component:`Lower-level Clicky table renderer. It maps Clicky columns and rows into DataTable while preserving Clicky cell renderers, details, filters, and runtime row handlers.`}}}},p={},m={args:{rows:[]}},h={args:{menuActions:d}},g={args:{columns:[...l,{name:`owner`,label:`Owner`,shrink:!0,defaultHidden:!0}],rows:u.map((e,t)=>({...e,cells:{...e.cells,owner:{kind:`text`,text:t===0?`team-edge`:`team-data`}}}))}},_=[`Default`,`Empty`,`WithMenuActions`,`WithDefaultHiddenColumn`],p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    rows: []
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    menuActions
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    columns: [...columns, {
      name: "owner",
      label: "Owner",
      shrink: true,
      defaultHidden: true
    }],
    rows: rows.map((row, index) => ({
      ...row,
      cells: {
        ...row.cells,
        owner: {
          kind: "text",
          text: index === 0 ? "team-edge" : "team-data"
        }
      }
    }))
  }
}`,...g.parameters?.docs?.source}}}})))()}v();export{p as Default,m as Empty,g as WithDefaultHiddenColumn,h as WithMenuActions,_ as __namedExportsOrder,f as default};