import{j as t}from"./iframe-BpjD9CLN.js";import{S as o,u as l}from"./SortableHeader-CHJoKncB.js";import"./preload-helper-BZuLNX-z.js";import"./utils-BLSKlp9E.js";const g={title:"Data/SortableHeader",component:o,args:{active:!0,dir:"asc",align:"left",children:"Name",onClick:()=>{}},parameters:{docs:{description:{component:"Minimal sortable header control that shows active/inactive sort affordances and leaves sort state ownership to the caller."}}}},m=[{id:1,name:"Alice",score:82},{id:2,name:"Bob",score:91},{id:3,name:"Charlie",score:74}],a={render:()=>{const{sorted:i,sort:r,toggle:c}=l(m);return t.jsxs("table",{className:"w-full text-sm",children:[t.jsx("thead",{children:t.jsx("tr",{children:["id","name","score"].map(e=>t.jsx("th",{className:"text-left p-density-2 border-b",children:t.jsx(o,{active:(r==null?void 0:r.key)===e,dir:r==null?void 0:r.dir,onClick:()=>c(e),align:e==="score"?"right":"left",children:e})},e))})}),t.jsx("tbody",{children:i.map(e=>t.jsxs("tr",{children:[t.jsx("td",{className:"p-density-2",children:e.id}),t.jsx("td",{className:"p-density-2",children:e.name}),t.jsx("td",{className:"p-density-2 text-right",children:e.score})]},e.id))})]})}};var s,n,d;a.parameters={...a.parameters,docs:{...(s=a.parameters)==null?void 0:s.docs,source:{originalSource:`{
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
}`,...(d=(n=a.parameters)==null?void 0:n.docs)==null?void 0:d.source}}};const y=["TableDemo"];export{a as TableDemo,y as __namedExportsOrder,g as default};
