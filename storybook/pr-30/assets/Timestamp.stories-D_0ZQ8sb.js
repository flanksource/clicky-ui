import{j as e}from"./iframe-ChhGfndY.js";import{T as f}from"./Timestamp-ChBTR5YC.js";import"./preload-helper-D5l2DbWZ.js";import"./utils-BLSKlp9E.js";import"./timestamp-format-ukGnKWnC.js";const x="2026-06-02T09:30:00Z",y={title:"Data/Cells/Timestamp",component:f,tags:["autodocs"],parameters:{docs:{description:{component:"Formats any parseable timestamp value for table cells, with the full ISO time on hover. `format` selects the display style; unparseable values render an em dash. Note `relative` formats against the real current time, so its output changes over time."}}},argTypes:{value:{control:"text"},format:{control:"inline-radio",options:["relative","time","short","iso"]},showTitleOnHover:{control:"boolean"}},args:{value:x,format:"short",showTitleOnHover:!0}},t={},r={render:()=>e.jsx("table",{className:"text-sm",children:e.jsx("tbody",{children:["relative","time","short","iso"].map(s=>e.jsxs("tr",{children:[e.jsx("td",{className:"pr-4 font-mono text-xs text-muted-foreground",children:s}),e.jsx("td",{children:e.jsx(f,{value:x,format:s})})]},s))})})},a={args:{value:"not-a-date"}};var o,n,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:"{}",...(m=(n=t.parameters)==null?void 0:n.docs)==null?void 0:m.source}}};var l,i,c;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <table className="text-sm">
      <tbody>
        {(["relative", "time", "short", "iso"] as const).map(f => <tr key={f}>
            <td className="pr-4 font-mono text-xs text-muted-foreground">{f}</td>
            <td>
              <Timestamp value={SAMPLE} format={f} />
            </td>
          </tr>)}
      </tbody>
    </table>
}`,...(c=(i=r.parameters)==null?void 0:i.docs)==null?void 0:c.source}}};var d,p,u;a.parameters={...a.parameters,docs:{...(d=a.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    value: "not-a-date"
  }
}`,...(u=(p=a.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};const T=["Default","Formats","Invalid"];export{t as Default,r as Formats,a as Invalid,T as __namedExportsOrder,y as default};
