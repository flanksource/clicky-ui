import{_ as ne,a1 as oe,bf as ae,j as n,bg as se,r as ie}from"./iframe-DbCl_ZTc.js";import{D as te}from"./DropdownMenu-Bxittvr2.js";import{M as re}from"./Modal-3wB0or_4.js";import{B as v}from"./button-BvGBn064.js";import"./preload-helper-DArPGhL4.js";import"./floating-ui.react-313NX-TC.js";import"./index-urVF_qKJ.js";import"./index-Bq5CuWor.js";import"./utils-CR52uffu.js";import"./Icon-BLEFF23r.js";import"./DropdownMenuSubmenu-Btp3LiIs.js";import"./modalStack-B2V66lx-.js";import"./zIndex-CigQ76av.js";import"./index-0zBpNI7D.js";import"./loading-BASxxKF3.js";const{expect:o,fn:d,userEvent:m,waitFor:le,within:r}=__STORYBOOK_MODULE_TEST__,Ee={title:"Overlay/DropdownMenu",component:te,parameters:{docs:{description:{component:"Click-triggered dropdown menu. Closes on outside click or Escape. Provide declarative `items` or a `children` render-prop for custom content; the trigger defaults to a Button but accepts any node via `trigger`."}}}},u={args:{label:"Download",icon:ae,items:[{label:"JSON",icon:ne,onSelect:()=>{}},{label:"Markdown",icon:oe,onSelect:()=>{}}]}},p={args:{label:"Actions",align:"left",items:[{label:"Rename",onSelect:()=>{}},{label:"Duplicate",onSelect:()=>{}},{label:"Delete",onSelect:()=>{},disabled:!0}]}},g={args:{trigger:n.jsx(v,{variant:"ghost",size:"icon","aria-label":"Open menu",children:n.jsx(se,{})}),items:[{label:"Profile",onSelect:()=>{}},{label:"Settings",onSelect:()=>{}}]}},w={args:{label:"Filters",children:i=>n.jsxs("div",{className:"px-3 py-2 text-xs",children:[n.jsx("p",{className:"mb-2 text-muted-foreground",children:"Custom content goes here."}),n.jsx(v,{size:"sm",onClick:i,children:"Apply"})]})}},h={parameters:{docs:{description:{story:"A button inside the menu opens a Modal. Because the Modal portals to `document.body`, it renders centered over the whole viewport instead of being clipped to the dropdown's box — and the menu stays open behind it (closing the menu would otherwise unmount the Modal it renders)."}}},render:()=>{const[i,e]=ie.useState(!1);return n.jsx(te,{label:"Actions",children:()=>n.jsxs("div",{className:"px-1 py-1",children:[n.jsx(v,{size:"sm",variant:"ghost",onClick:()=>e(!0),children:"View log"}),n.jsx(re,{open:i,onClose:()=>e(!1),title:"Log output",size:"lg",children:n.jsx("pre",{className:"whitespace-pre-wrap text-xs",children:["[12:00:01] starting build…","[12:00:03] compiling 248 modules","[12:00:07] bundle written to dist/","[12:00:07] done in 6.2s"].join(`
`)})})]})})},play:async({canvasElement:i,step:e})=>{const l=r(i),c=r(document.body);let a=null;if(await e("opens a Modal from a button inside the menu",async()=>{await m.click(l.getByRole("button",{name:"Actions"})),a=await c.findByRole("menu"),await m.click(r(a).getByRole("button",{name:"View log"}))}),!a)throw new Error("Dropdown menu did not open");await e("the Modal escapes the dropdown's box",async()=>{const t=await c.findByRole("dialog");await o(a.contains(t)).toBe(!1);const s=a.getBoundingClientRect(),E=t.getBoundingClientRect();await o(E.width).toBeGreaterThan(s.width),await o(E.right).toBeGreaterThan(s.right)}),await e("the menu stays open behind the Modal",async()=>{await o(document.body.contains(a)).toBe(!0)})}},b={args:{label:"Actions",items:[{label:"Edit",onSelect:d()},{label:"Duplicate",onSelect:d()},{label:"Delete",onSelect:d()}]},play:async({args:i,canvasElement:e,step:l})=>{const c=r(e),a=r(document.body);await l("opens the menu in a portal above the canvas",async()=>{await m.click(c.getByRole("button",{name:"Actions"}));const t=await a.findByRole("menu");await o(e.contains(t)).toBe(!1),await o(document.body.contains(t)).toBe(!0)}),await l("selecting an item fires its handler and closes",async()=>{var t,s;await m.click(a.getByRole("menuitem",{name:"Edit"})),await o((s=(t=i.items)==null?void 0:t[0])==null?void 0:s.onSelect).toHaveBeenCalledTimes(1),await le(()=>o(a.queryByRole("menu")).toBeNull())})}};function x(i){return{args:{label:"Actions",items:[{label:"Edit",onSelect:d()},{label:"Duplicate",onSelect:d()},{label:"Delete",onSelect:d()}]},decorators:[e=>n.jsx("div",{className:"fixed inset-0",children:n.jsx("div",{className:`absolute ${i}`,children:n.jsx(e,{})})})],play:async({canvasElement:e})=>{const l=r(e),c=r(document.body);await m.click(l.getByRole("button",{name:"Actions"}));const t=(await c.findByRole("menu")).getBoundingClientRect(),s=1;await o(t.left).toBeGreaterThanOrEqual(-s),await o(t.top).toBeGreaterThanOrEqual(-s),await o(t.right).toBeLessThanOrEqual(window.innerWidth+s),await o(t.bottom).toBeLessThanOrEqual(window.innerHeight+s)}}}const y=x("top-1 left-1"),B=x("top-1 right-1"),f=x("bottom-1 left-1"),S=x("bottom-1 right-1");var R,M,k;u.parameters={...u.parameters,docs:{...(R=u.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    label: "Download",
    icon: UiDownload,
    items: [{
      label: "JSON",
      icon: UiJson,
      onSelect: () => {}
    }, {
      label: "Markdown",
      icon: UiMarkdown,
      onSelect: () => {}
    }]
  }
}`,...(k=(M=u.parameters)==null?void 0:M.docs)==null?void 0:k.source}}};var C,D,O;p.parameters={...p.parameters,docs:{...(C=p.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    label: "Actions",
    align: "left",
    items: [{
      label: "Rename",
      onSelect: () => {}
    }, {
      label: "Duplicate",
      onSelect: () => {}
    }, {
      label: "Delete",
      onSelect: () => {},
      disabled: true
    }]
  }
}`,...(O=(D=p.parameters)==null?void 0:D.docs)==null?void 0:O.source}}};var T,A,j;g.parameters={...g.parameters,docs:{...(T=g.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    trigger: <Button variant="ghost" size="icon" aria-label="Open menu">
        <UiMenu />
      </Button>,
    items: [{
      label: "Profile",
      onSelect: () => {}
    }, {
      label: "Settings",
      onSelect: () => {}
    }]
  }
}`,...(j=(A=g.parameters)==null?void 0:A.docs)==null?void 0:j.source}}};var N,L,U;w.parameters={...w.parameters,docs:{...(N=w.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    label: "Filters",
    children: closeMenu => <div className="px-3 py-2 text-xs">
        <p className="mb-2 text-muted-foreground">Custom content goes here.</p>
        <Button size="sm" onClick={closeMenu}>
          Apply
        </Button>
      </div>
  }
}`,...(U=(L=w.parameters)==null?void 0:L.docs)==null?void 0:U.source}}};var _,z,q;h.parameters={...h.parameters,docs:{...(_=h.parameters)==null?void 0:_.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "A button inside the menu opens a Modal. Because the Modal portals to \`document.body\`, it renders centered over the whole viewport instead of being clipped to the dropdown's box — and the menu stays open behind it (closing the menu would otherwise unmount the Modal it renders)."
      }
    }
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return <DropdownMenu label="Actions">
        {() => <div className="px-1 py-1">
            <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
              View log
            </Button>
            <Modal open={open} onClose={() => setOpen(false)} title="Log output" size="lg">
              <pre className="whitespace-pre-wrap text-xs">
                {["[12:00:01] starting build…", "[12:00:03] compiling 248 modules", "[12:00:07] bundle written to dist/", "[12:00:07] done in 6.2s"].join("\\n")}
              </pre>
            </Modal>
          </div>}
      </DropdownMenu>;
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    let menu: HTMLElement | null = null;
    await step("opens a Modal from a button inside the menu", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Actions"
      }));
      menu = await body.findByRole("menu");
      await userEvent.click(within(menu).getByRole("button", {
        name: "View log"
      }));
    });
    if (!menu) throw new Error("Dropdown menu did not open");
    await step("the Modal escapes the dropdown's box", async () => {
      const dialog = await body.findByRole("dialog");
      // Portaled out of the menu's DOM subtree, and overflows the menu's box
      // rather than being clipped to it.
      await expect(menu.contains(dialog)).toBe(false);
      const menuRect = menu.getBoundingClientRect();
      const dialogRect = dialog.getBoundingClientRect();
      await expect(dialogRect.width).toBeGreaterThan(menuRect.width);
      await expect(dialogRect.right).toBeGreaterThan(menuRect.right);
    });
    await step("the menu stays open behind the Modal", async () => {
      // Closing the menu would unmount the Modal it renders, so it must persist.
      await expect(document.body.contains(menu)).toBe(true);
    });
  }
}`,...(q=(z=h.parameters)==null?void 0:z.docs)==null?void 0:q.source}}};var G,F,H;b.parameters={...b.parameters,docs:{...(G=b.parameters)==null?void 0:G.docs,source:{originalSource:`{
  args: {
    label: "Actions",
    items: [{
      label: "Edit",
      onSelect: fn()
    }, {
      label: "Duplicate",
      onSelect: fn()
    }, {
      label: "Delete",
      onSelect: fn()
    }]
  },
  play: async ({
    args,
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await step("opens the menu in a portal above the canvas", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Actions"
      }));
      const menu = await body.findByRole("menu");
      await expect(canvasElement.contains(menu)).toBe(false);
      await expect(document.body.contains(menu)).toBe(true);
    });
    await step("selecting an item fires its handler and closes", async () => {
      await userEvent.click(body.getByRole("menuitem", {
        name: "Edit"
      }));
      await expect(args.items?.[0]?.onSelect).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(body.queryByRole("menu")).toBeNull());
    });
  }
}`,...(H=(F=b.parameters)==null?void 0:F.docs)==null?void 0:H.source}}};var I,J,P;y.parameters={...y.parameters,docs:{...(I=y.parameters)==null?void 0:I.docs,source:{originalSource:'makeEdgeStory("top-1 left-1")',...(P=(J=y.parameters)==null?void 0:J.docs)==null?void 0:P.source}}};var V,K,W;B.parameters={...B.parameters,docs:{...(V=B.parameters)==null?void 0:V.docs,source:{originalSource:'makeEdgeStory("top-1 right-1")',...(W=(K=B.parameters)==null?void 0:K.docs)==null?void 0:W.source}}};var Y,$,Q;f.parameters={...f.parameters,docs:{...(Y=f.parameters)==null?void 0:Y.docs,source:{originalSource:'makeEdgeStory("bottom-1 left-1")',...(Q=($=f.parameters)==null?void 0:$.docs)==null?void 0:Q.source}}};var X,Z,ee;S.parameters={...S.parameters,docs:{...(X=S.parameters)==null?void 0:X.docs,source:{originalSource:'makeEdgeStory("bottom-1 right-1")',...(ee=(Z=S.parameters)==null?void 0:Z.docs)==null?void 0:ee.source}}};const Re=["Items","AlignLeft","CustomTrigger","CustomContent","OpensModal","Interaction","EdgeTopLeft","EdgeTopRight","EdgeBottomLeft","EdgeBottomRight"];export{p as AlignLeft,w as CustomContent,g as CustomTrigger,f as EdgeBottomLeft,S as EdgeBottomRight,y as EdgeTopLeft,B as EdgeTopRight,b as Interaction,u as Items,h as OpensModal,Re as __namedExportsOrder,Ee as default};
