import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{i as n,n as r,r as i,t as a}from"./SortableHeader-DHrttfS3.js";var o,s,c,l,u;function d(){return(d=e((()=>{i(),r(),o=t(),s={title:`Data/SortableHeader`,component:a,args:{active:!0,dir:`asc`,align:`left`,children:`Name`,onClick:()=>void 0},parameters:{docs:{description:{component:`Minimal sortable header control that shows active/inactive sort affordances and leaves sort state ownership to the caller.`}}}},c=[{id:1,name:`Alice`,score:82},{id:2,name:`Bob`,score:91},{id:3,name:`Charlie`,score:74}],l={render:()=>{let{sorted:e,sort:t,toggle:r}=n(c);return(0,o.jsxs)(`table`,{className:`w-full text-sm`,children:[(0,o.jsx)(`thead`,{children:(0,o.jsx)(`tr`,{children:[`id`,`name`,`score`].map(e=>(0,o.jsx)(`th`,{className:`text-left p-density-2 border-b`,children:(0,o.jsx)(a,{active:t?.key===e,dir:t?.dir,onClick:()=>r(e),align:e===`score`?`right`:`left`,children:e})},e))})}),(0,o.jsx)(`tbody`,{children:e.map(e=>(0,o.jsxs)(`tr`,{children:[(0,o.jsx)(`td`,{className:`p-density-2`,children:e.id}),(0,o.jsx)(`td`,{className:`p-density-2`,children:e.name}),(0,o.jsx)(`td`,{className:`p-density-2 text-right`,children:e.score})]},e.id))})]})}},u=[`TableDemo`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      sorted,
      sort,
      toggle
    } = useSort(data);
    return <table className="w-full text-sm">
        <thead>
          <tr>
            {(["id", "name", "score"] as const).map(k => <th key={k} className="text-left p-density-2 border-b">
                <SortableHeader active={sort?.key === k} dir={sort?.dir} onClick={() => toggle(k)} align={k === "score" ? "right" : "left"}>
                  {k}
                </SortableHeader>
              </th>)}
          </tr>
        </thead>
        <tbody>
          {sorted.map(r => <tr key={r.id}>
              <td className="p-density-2">{r.id}</td>
              <td className="p-density-2">{r.name}</td>
              <td className="p-density-2 text-right">{r.score}</td>
            </tr>)}
        </tbody>
      </table>;
  }
}`,...l.parameters?.docs?.source}}}})))()}d();export{l as TableDemo,u as __namedExportsOrder,s as default};