import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./StatusDot-ytQ_pFpa.js";import{a,i as o,r as s,t as c}from"./MatrixTreeTable-D_Je2xY1.js";var l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{l=t(),a(),s(),r(),u=n(),{expect:d,userEvent:f,within:p}=__STORYBOOK_MODULE_TEST__,m=[`Operators`,`Finance`,`Audit`,`Support`],h=[{id:`company`,name:`Company`,children:[{id:`acme`,name:`Acme Insurance`,children:[{id:`acme-page`,name:`Policy page`,cells:[`success`,`success`,null,`warning`]},{id:`acme-tx`,name:`Payments`,children:[{id:`acme-tx-run`,name:`Run payment`,cells:[`success`,null,null,`error`]},{id:`acme-tx-undo`,name:`Undo payment`,cells:[null,`warning`,null,null]}]}]}]},{id:`plan`,name:`Plan`,children:[{id:`gold`,name:`Gold plan`,children:[{id:`gold-field`,name:`Premium field`,cells:[`success`,`success`,`success`,null]}]}]}],g={getChildren:e=>e.children,getKey:e=>e.id},_={title:`Data/MatrixTreeTable`,component:c,tags:[`autodocs`],parameters:{docs:{description:{component:"A MatrixTable whose rows form a tree. Parent nodes are collapsible bands that span every column, leaves are matrix rows; both indent by depth. Expansion is uncontrolled with `defaultExpanded`, or controlled with `expanded` overrides and `onExpandedChange` (use `expandAllTree` for Expand/Collapse all)."}}},args:{roots:h,columns:m,corner:`Permission`,angledHeaders:!0,headerClassName:`bg-background`,headerHeight:90,...g,getAriaLabel:e=>e.name,renderLabel:e=>e.name,getCells:e=>(e.cells??[]).map((e,t)=>e?(0,u.jsx)(i,{status:e,size:`md`},t):null),defaultExpanded:(e,t)=>t<2}},v={play:async({canvasElement:e})=>{let t=p(e);await d(t.queryByText(`Run payment`)).not.toBeInTheDocument(),await f.click(t.getByRole(`button`,{name:`Expand Payments`})),await d(t.getByText(`Run payment`)).toBeInTheDocument()}},y={render:e=>{let[t,n]=(0,l.useState)({});return(0,u.jsxs)(`div`,{className:`space-y-2`,children:[(0,u.jsxs)(`div`,{className:`flex gap-2 text-sm`,children:[(0,u.jsx)(`button`,{type:`button`,className:`underline`,onClick:()=>n(o(h,g,!0)),children:`Expand all`}),(0,u.jsx)(`button`,{type:`button`,className:`underline`,onClick:()=>n(o(h,g,!1)),children:`Collapse all`})]}),(0,u.jsx)(c,{...e,expanded:t,onExpandedChange:n})]})}},b=[`Default`,`ControlledExpandAll`],v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText("Run payment")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", {
      name: "Expand Payments"
    }));
    await expect(canvas.getByText("Run payment")).toBeInTheDocument();
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [expanded, setExpanded] = useState<TreeExpansion>({});
    return <div className="space-y-2">
        <div className="flex gap-2 text-sm">
          <button type="button" className="underline" onClick={() => setExpanded(expandAllTree(ROOTS, accessors, true))}>Expand all</button>
          <button type="button" className="underline" onClick={() => setExpanded(expandAllTree(ROOTS, accessors, false))}>Collapse all</button>
        </div>
        <MatrixTreeTable<Node> {...args} expanded={expanded} onExpandedChange={setExpanded} />
      </div>;
  }
}`,...y.parameters?.docs?.source}}}})))()}x();export{y as ControlledExpandAll,v as Default,b as __namedExportsOrder,_ as default};