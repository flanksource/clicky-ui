import{r as w,j as n}from"./iframe-DP177qYv.js";import{J as f}from"./JsonSchemaForm-D6m6mBh8.js";import"./preload-helper-BZq7nIkI.js";import"./utils-DW-IJACk.js";import"./Icon-CVZO3WAG.js";import"./DropdownMenu-DauniJQT.js";import"./floating-ui.react-BnsrA79A.js";import"./index-CbIba--f.js";import"./index-D5WrkPBq.js";import"./button-FbNKbbzk.js";import"./index-CPURVhFy.js";import"./loading-BGP2vbyq.js";import"./DropdownMenuSubmenu-pG2iVqTe.js";import"./modalStack-CD5aSVTc.js";import"./zIndex-BGbNBNA8.js";import"./Properties-DzT-zp1x.js";import"./IconButton-ByGG337J.js";import"./format-2niohfpq.js";import"./JsonView-euY554sO.js";import"./AccordionList-ae6JTwF6.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-DkHitohI.js";import"./HoverCard-k2Xsc41N.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-BWAlqUsR.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-gw5c6cQc.js";import"./FilterPill-CB6e5lha.js";import"./DateField-Vz0SUsTh.js";import"./DatePicker-C9FXaiIe.js";import"./DateTimePicker-4Tx0xEVq.js";import"./SegmentedControl-CmQrpni4.js";import"./TreePickerField-BjPB4mTt.js";import"./Tree-Dkq9wKMp.js";import"./TreeNode-Qs-FBFgq.js";import"./InputField-DQb9Rhrw.js";import"./use-hotkey-iixTK3zz.js";import"./ListMenu-DaHgzerB.js";import"./Markdown-DQ6pSWFS.js";import"./Callout-CSQkENON.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-CoYNYiBs.js";import"./CodeDiff-ew4pkH_9.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BtMvzD9N.js";import"./HighlightedTokens-F0uKqAH1.js";const{expect:s,userEvent:m,within:p}=__STORYBOOK_MODULE_TEST__,e=t=>({type:"string",title:t}),v={type:"object",properties:{Beneficiaries:{type:"array",title:"Beneficiaries",items:{type:"object",properties:{Name:e("Name"),Relationship:e("Relationship"),Share:{type:"number",title:"Share %"}}}},Reinsurers:{type:"array",title:"Reinsurers",items:{type:"object",properties:{Name:e("Reinsurer"),Treaty:e("Treaty"),Share:{type:"number",title:"Share %"},Retention:{type:"number",title:"Retention"},Currency:e("Currency"),Effective:{type:"string",format:"date",title:"Effective"},Notes:e("Notes")}}}}},g={Beneficiaries:[{Name:"Ada Example",Relationship:"Spouse",Share:60},{Name:"Ben Example",Relationship:"Child",Share:40}],Reinsurers:[{Name:"Acme Re",Treaty:"QS-01",Share:50,Retention:1e5,Currency:"USD",Effective:"2026-01-01"},{Name:"Example Re",Treaty:"XL-02",Share:25,Retention:25e4,Currency:"USD",Effective:"2026-01-01"}]};function x({layout:t}){const[r,a]=w.useState(g);return n.jsxs("div",{className:"max-w-4xl space-y-4 p-4",children:[n.jsx(f,{schema:v,value:r,onChange:a,layout:t,showPreferencesMenu:!1}),n.jsx("pre",{className:"overflow-auto rounded-md border bg-muted/30 p-3 text-xs",children:JSON.stringify(r,null,2)})]})}const de={title:"JsonSchemaForm/Object array views",component:x,args:{layout:{mode:"stacked"}},parameters:{docs:{description:{component:"Object arrays with no display hint open as a grid while their visible columns fit (`x-table-max-columns`, default 4) and as the inline item form beyond that. `x-layout: table` and `x-array-display: accordion` pick the opening view explicitly. The ⋮ menu switches views in place."}}}},i={play:async({canvasElement:t,step:r})=>{const a=p(t);await r("the 3-column array opens as a grid, the 7-column one as item rows",async()=>{await s(a.getAllByRole("table")).toHaveLength(1)}),await r("the view menu switches the grid to the stack form",async()=>{await m.click(a.getByRole("button",{name:"View options for Beneficiaries"})),await m.click(p(document.body).getByRole("menuitem",{name:"Stack form"})),await s(a.queryByRole("table")).toBeNull()})}},o={args:{layout:{mode:"inline"}}};var c,l,u;i.parameters={...i.parameters,docs:{...(c=i.parameters)==null?void 0:c.docs,source:{originalSource:`{
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
}`,...(h=(d=o.parameters)==null?void 0:d.docs)==null?void 0:h.source}}};const he=["NarrowAndWide","InlineForm"];export{o as InlineForm,i as NarrowAndWide,he as __namedExportsOrder,de as default};
