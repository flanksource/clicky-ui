import{S as k}from"./SplitButton-FXnVtEiF.js";import"./iframe-BO3XiECZ.js";import"./preload-helper-B2wK-Kjy.js";import"./utils-BLSKlp9E.js";import"./button-D09c44qg.js";import"./index-1evVQkiP.js";import"./loading-DKpQqMGf.js";import"./Icon-GruNqjyl.js";import"./DropdownMenu-AoZVwYhh.js";import"./floating-ui.react-B_2LfBkg.js";import"./index-D_v1HQsH.js";import"./index-OHfE5VLg.js";import"./modalStack-yDe9UqJq.js";import"./zIndex-CigQ76av.js";import"./UiChevronDown-CmLEZyD7.js";import"./UiChevronUp-CVno9QiD.js";const{expect:l,fn:e,userEvent:s,within:E}=__STORYBOOK_MODULE_TEST__,P={title:"Components/SplitButton",component:k,tags:["autodocs"],parameters:{docs:{description:{component:"A primary action button joined to a chevron trigger that opens a dropdown of secondary actions. Composes `Button` and `DropdownMenu`."}}},argTypes:{variant:{description:"Visual treatment forwarded to both halves.",control:"select",options:["default","destructive","outline","secondary","ghost","link"]},size:{description:"Size preset forwarded to both halves.",control:"select",options:["default","sm","lg"]},loading:{description:"Spinner on the primary half.",control:"boolean"},disabled:{description:"Disable both halves.",control:"boolean"}},args:{label:"Save",onClick:e(),items:[{label:"Save and close",onSelect:e()},{label:"Save as draft",onSelect:e()},{label:"Discard",onSelect:e()}]}},t={},a={args:{variant:"outline"}},n={args:{loading:!0}},o={play:async({args:i,canvasElement:B,step:c})=>{const r=E(B.ownerDocument.body);await c("primary click fires the primary handler",async()=>{await s.click(r.getByRole("button",{name:"Save"})),await l(i.onClick).toHaveBeenCalledTimes(1)}),await c("chevron opens the menu and selection fires the item handler",async()=>{await s.click(r.getByRole("button",{name:"Open menu"})),await s.click(r.getByRole("menuitem",{name:"Save and close"})),await l(i.items[0].onSelect).toHaveBeenCalledTimes(1)})}};var m,p,d;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:"{}",...(d=(p=t.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};var u,v,g;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    variant: "outline"
  }
}`,...(g=(v=a.parameters)==null?void 0:v.docs)==null?void 0:g.source}}};var h,y,w;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...(w=(y=n.parameters)==null?void 0:y.docs)==null?void 0:w.source}}};var S,b,f;o.parameters={...o.parameters,docs:{...(S=o.parameters)==null?void 0:S.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    // Query the whole document, not just the story canvas: the menu renders in a
    // FloatingPortal at document.body, outside canvasElement.
    const canvas = within(canvasElement.ownerDocument.body);
    await step("primary click fires the primary handler", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Save"
      }));
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });
    await step("chevron opens the menu and selection fires the item handler", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Open menu"
      }));
      await userEvent.click(canvas.getByRole("menuitem", {
        name: "Save and close"
      }));
      await expect(args.items[0].onSelect).toHaveBeenCalledTimes(1);
    });
  }
}`,...(f=(b=o.parameters)==null?void 0:b.docs)==null?void 0:f.source}}};const Q=["Default","Outline","Loading","MenuInteraction"];export{t as Default,n as Loading,o as MenuInteraction,a as Outline,Q as __namedExportsOrder,P as default};
