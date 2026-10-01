import{r as w,j as n}from"./iframe-CLXtWVmt.js";import{J as f}from"./JsonSchemaForm-BLo94cmK.js";import"./preload-helper-DmsBQNJi.js";import"./utils-DW-IJACk.js";import"./Icon-CpZ1luCu.js";import"./DropdownMenu-BfTU1-5e.js";import"./floating-ui.react-BEe3PkFT.js";import"./index-cL1Er3Pi.js";import"./index-99h8sS2h.js";import"./button-C8mx3enX.js";import"./index-CPURVhFy.js";import"./loading-B0OjGzLE.js";import"./DropdownMenuSubmenu-DJ3OnS11.js";import"./modalStack-gt8ROY-G.js";import"./zIndex-BGbNBNA8.js";import"./Properties-BFYUqXPk.js";import"./IconButton-Diyo__bS.js";import"./HoverCard-DRjWtDYf.js";import"./json-schema-form-size-E77C3uZS.js";import"./collections-CoHfwOze.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-BJ4XmsSf.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-BjmBMG3b.js";import"./FilterPill-CM5YOpR7.js";import"./DateField-DuQ14mtG.js";import"./DatePicker-BWt51Z9R.js";import"./DateTimePicker-D0HzU81W.js";import"./SegmentedControl-Dg191Kku.js";import"./TreePickerField-4-ix3axk.js";import"./Tree-CnzDD2rQ.js";import"./TreeNode-5m61ijv1.js";import"./AccordionList-syEv9AV1.js";import"./InputField-VmQoEzD9.js";import"./use-hotkey-0-_8lVll.js";import"./ListMenu-DS3Imowd.js";import"./Markdown-D95aR_fc.js";import"./Callout-Bl1ILe5K.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DOQ2p1GO.js";import"./CodeDiff-DDSLPz_c.js";import"./HighlightedTokens-l_kw19vr.js";import"./JsonView-D5gKhrYL.js";const{expect:s,userEvent:m,within:p}=__STORYBOOK_MODULE_TEST__,e=t=>({type:"string",title:t}),v={type:"object",properties:{Beneficiaries:{type:"array",title:"Beneficiaries",items:{type:"object",properties:{Name:e("Name"),Relationship:e("Relationship"),Share:{type:"number",title:"Share %"}}}},Reinsurers:{type:"array",title:"Reinsurers",items:{type:"object",properties:{Name:e("Reinsurer"),Treaty:e("Treaty"),Share:{type:"number",title:"Share %"},Retention:{type:"number",title:"Retention"},Currency:e("Currency"),Effective:{type:"string",format:"date",title:"Effective"},Notes:e("Notes")}}}}},g={Beneficiaries:[{Name:"Ada Example",Relationship:"Spouse",Share:60},{Name:"Ben Example",Relationship:"Child",Share:40}],Reinsurers:[{Name:"Acme Re",Treaty:"QS-01",Share:50,Retention:1e5,Currency:"USD",Effective:"2026-01-01"},{Name:"Example Re",Treaty:"XL-02",Share:25,Retention:25e4,Currency:"USD",Effective:"2026-01-01"}]};function x({layout:t}){const[r,a]=w.useState(g);return n.jsxs("div",{className:"max-w-4xl space-y-4 p-4",children:[n.jsx(f,{schema:v,value:r,onChange:a,layout:t,showPreferencesMenu:!1}),n.jsx("pre",{className:"overflow-auto rounded-md border bg-muted/30 p-3 text-xs",children:JSON.stringify(r,null,2)})]})}const ce={title:"JsonSchemaForm/Object array views",component:x,args:{layout:{mode:"stacked"}},parameters:{docs:{description:{component:"Object arrays with no display hint open as a grid while their visible columns fit (`x-table-max-columns`, default 4) and as the inline item form beyond that. `x-layout: table` and `x-array-display: accordion` pick the opening view explicitly. The ⋮ menu switches views in place."}}}},i={play:async({canvasElement:t,step:r})=>{const a=p(t);await r("the 3-column array opens as a grid, the 7-column one as item rows",async()=>{await s(a.getAllByRole("table")).toHaveLength(1)}),await r("the view menu switches the grid to the stack form",async()=>{await m.click(a.getByRole("button",{name:"View options for Beneficiaries"})),await m.click(p(document.body).getByRole("menuitem",{name:"Stack form"})),await s(a.queryByRole("table")).toBeNull()})}},o={args:{layout:{mode:"inline"}}};var c,l,u;i.parameters={...i.parameters,docs:{...(c=i.parameters)==null?void 0:c.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("the 3-column array opens as a grid, the 7-column one as item rows", async () => {
      await expect(canvas.getAllByRole("table")).toHaveLength(1);
    });
    await step("the view menu switches the grid to the stack form", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "View options for Beneficiaries"
      }));
      await userEvent.click(within(document.body).getByRole("menuitem", {
        name: "Stack form"
      }));
      await expect(canvas.queryByRole("table")).toBeNull();
    });
  }
}`,...(u=(l=i.parameters)==null?void 0:l.docs)==null?void 0:u.source}}};var y,d,h;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    layout: {
      mode: "inline"
    }
  }
}`,...(h=(d=o.parameters)==null?void 0:d.docs)==null?void 0:h.source}}};const le=["NarrowAndWide","InlineForm"];export{o as InlineForm,i as NarrowAndWide,le as __namedExportsOrder,ce as default};
