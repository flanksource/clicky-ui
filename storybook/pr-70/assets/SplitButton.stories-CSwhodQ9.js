import{S as _}from"./SplitButton-D_DGtxmG.js";import"./iframe-BOpLb2SL.js";import"./preload-helper-C9Uksf5K.js";import"./utils-DW-IJACk.js";import"./button-B63egKN7.js";import"./index-CPURVhFy.js";import"./loading-B_5rDg5X.js";import"./Icon-JZhp7A68.js";import"./DropdownMenu-BJvu-6t7.js";import"./floating-ui.react-CEIFBjso.js";import"./index-2QoJ5Ixm.js";import"./index-DJ8M53Md.js";import"./DropdownMenuSubmenu-C84QBl0l.js";import"./modalStack-DTgESsZL.js";import"./zIndex-BGbNBNA8.js";const{expect:m,fn:s,userEvent:t,within:T}=__STORYBOOK_MODULE_TEST__,q={title:"Components/SplitButton",component:_,tags:["autodocs"],parameters:{docs:{description:{component:"A primary action button joined to a chevron trigger that opens a dropdown of secondary actions. Composes `Button` and `DropdownMenu`."}}},argTypes:{variant:{description:"Visual treatment forwarded to both halves.",control:"select",options:["default","destructive","outline","secondary","ghost","link"]},size:{description:"Size preset forwarded to both halves.",control:"select",options:["default","sm","lg"]},loading:{description:"Spinner on the primary half.",control:"boolean"},disabled:{description:"Disable both halves.",control:"boolean"},primaryDisabled:{description:"Disable only the primary action, leaving the menu reachable.",control:"boolean"}},args:{label:"Save",onClick:s(),items:[{label:"Save and close",onSelect:s()},{label:"Save as draft",onSelect:s()},{label:"Discard",onSelect:s()}]}},r={},i={args:{variant:"outline"}},c={args:{loading:!0}},n={args:{primaryDisabled:!0},play:async({args:o,canvasElement:p,step:a})=>{const e=T(p.ownerDocument.body);await a("the primary half is unavailable",async()=>{await m(e.getByRole("button",{name:"Save"})).toBeDisabled()}),await a("the menu still opens and its items still fire",async()=>{await t.click(e.getByRole("button",{name:"Open menu"})),await t.click(e.getByRole("menuitem",{name:"Save as draft"})),await m(o.items[1].onSelect).toHaveBeenCalledTimes(1)})}},l={play:async({args:o,canvasElement:p,step:a})=>{const e=T(p.ownerDocument.body);await a("primary click fires the primary handler",async()=>{await t.click(e.getByRole("button",{name:"Save"})),await m(o.onClick).toHaveBeenCalledTimes(1)}),await a("chevron opens the menu and selection fires the item handler",async()=>{await t.click(e.getByRole("button",{name:"Open menu"})),await t.click(e.getByRole("menuitem",{name:"Save and close"})),await m(o.items[0].onSelect).toHaveBeenCalledTimes(1)})}};var d,u,y;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:"{}",...(y=(u=r.parameters)==null?void 0:u.docs)==null?void 0:y.source}}};var v,g,h;i.parameters={...i.parameters,docs:{...(v=i.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    variant: "outline"
  }
}`,...(h=(g=i.parameters)==null?void 0:g.docs)==null?void 0:h.source}}};var w,b,S;c.parameters={...c.parameters,docs:{...(w=c.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...(S=(b=c.parameters)==null?void 0:b.docs)==null?void 0:S.source}}};var B,f,D,k,E;n.parameters={...n.parameters,docs:{...(B=n.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    primaryDisabled: true
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await step("the primary half is unavailable", async () => {
      await expect(canvas.getByRole("button", {
        name: "Save"
      })).toBeDisabled();
    });
    await step("the menu still opens and its items still fire", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Open menu"
      }));
      await userEvent.click(canvas.getByRole("menuitem", {
        name: "Save as draft"
      }));
      await expect(args.items[1].onSelect).toHaveBeenCalledTimes(1);
    });
  }
}`,...(D=(f=n.parameters)==null?void 0:f.docs)==null?void 0:D.source},description:{story:"The default action does not apply right now, but the secondary ones still do.",...(E=(k=n.parameters)==null?void 0:k.docs)==null?void 0:E.description}}};var R,C,O;l.parameters={...l.parameters,docs:{...(R=l.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(O=(C=l.parameters)==null?void 0:C.docs)==null?void 0:O.source}}};const G=["Default","Outline","Loading","PrimaryDisabled","MenuInteraction"];export{r as Default,c as Loading,l as MenuInteraction,i as Outline,n as PrimaryDisabled,G as __namedExportsOrder,q as default};
