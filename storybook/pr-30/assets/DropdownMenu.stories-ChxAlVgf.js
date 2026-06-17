import{j as n,r as ne}from"./iframe-DIPFVygJ.js";import{D as te}from"./DropdownMenu-CDWA7Dxe.js";import{M as oe}from"./Modal-DBuDJXQm.js";import{B as v}from"./button-CQO1VsE8.js";import{U as ae}from"./UiJson-CJilLuQC.js";import{U as se}from"./UiMarkdown-Dl8qPHKJ.js";import{U as ie}from"./UiDownload-DoBXrHIu.js";import{U as re}from"./UiMenu-Br9Yyddb.js";import"./preload-helper-D5l2DbWZ.js";import"./floating-ui.react-BlK1hStf.js";import"./index-DlBsQ62t.js";import"./index-B6v9c5M5.js";import"./utils-BLSKlp9E.js";import"./Icon-GGxX1w_8.js";import"./UiChevronDown-DNTWC3NQ.js";import"./UiFullscreen-CyJySjBg.js";import"./UiClose-yIapmBvP.js";import"./index-1evVQkiP.js";import"./loading-CYQBqqDz.js";const{expect:o,fn:c,userEvent:m,waitFor:le,within:d}=__STORYBOOK_MODULE_TEST__,Ce={title:"Overlay/DropdownMenu",component:te,parameters:{docs:{description:{component:"Click-triggered dropdown menu. Closes on outside click or Escape. Provide declarative `items` or a `children` render-prop for custom content; the trigger defaults to a Button but accepts any node via `trigger`."}}}},u={args:{label:"Download",icon:ie,items:[{label:"JSON",icon:ae,onSelect:()=>{}},{label:"Markdown",icon:se,onSelect:()=>{}}]}},p={args:{label:"Actions",align:"left",items:[{label:"Rename",onSelect:()=>{}},{label:"Duplicate",onSelect:()=>{}},{label:"Delete",onSelect:()=>{},disabled:!0}]}},g={args:{trigger:n.jsx(v,{variant:"ghost",size:"icon","aria-label":"Open menu",children:n.jsx(re,{})}),items:[{label:"Profile",onSelect:()=>{}},{label:"Settings",onSelect:()=>{}}]}},b={args:{label:"Filters",children:s=>n.jsxs("div",{className:"px-3 py-2 text-xs",children:[n.jsx("p",{className:"mb-2 text-muted-foreground",children:"Custom content goes here."}),n.jsx(v,{size:"sm",onClick:s,children:"Apply"})]})}},h={parameters:{docs:{description:{story:"A button inside the menu opens a Modal. Because the Modal portals to `document.body`, it renders centered over the whole viewport instead of being clipped to the dropdown's box — and the menu stays open behind it (closing the menu would otherwise unmount the Modal it renders)."}}},render:()=>{const[s,e]=ne.useState(!1);return n.jsx(te,{label:"Actions",children:()=>n.jsxs("div",{className:"px-1 py-1",children:[n.jsx(v,{size:"sm",variant:"ghost",onClick:()=>e(!0),children:"View log"}),n.jsx(oe,{open:s,onClose:()=>e(!1),title:"Log output",size:"lg",children:n.jsx("pre",{className:"whitespace-pre-wrap text-xs",children:["[12:00:01] starting build…","[12:00:03] compiling 248 modules","[12:00:07] bundle written to dist/","[12:00:07] done in 6.2s"].join(`
`)})})]})})},play:async({canvasElement:s,step:e})=>{const l=d(s),i=d(document.body);await e("opens a Modal from a button inside the menu",async()=>{await m.click(l.getByRole("button",{name:"Actions"})),await i.findByRole("menu"),await m.click(i.getByRole("button",{name:"View log"}))}),await e("the Modal escapes the dropdown's box",async()=>{const r=i.getByRole("menu"),t=await i.findByRole("dialog");await o(r.contains(t)).toBe(!1);const a=r.getBoundingClientRect(),R=t.getBoundingClientRect();await o(R.width).toBeGreaterThan(a.width),await o(R.right).toBeGreaterThan(a.right)}),await e("the menu stays open behind the Modal",async()=>{await o(i.queryByRole("menu")).not.toBeNull()})}},w={args:{label:"Actions",items:[{label:"Edit",onSelect:c()},{label:"Duplicate",onSelect:c()},{label:"Delete",onSelect:c()}]},play:async({args:s,canvasElement:e,step:l})=>{const i=d(e),r=d(document.body);await l("opens the menu in a portal above the canvas",async()=>{await m.click(i.getByRole("button",{name:"Actions"}));const t=await r.findByRole("menu");await o(e.contains(t)).toBe(!1),await o(document.body.contains(t)).toBe(!0)}),await l("selecting an item fires its handler and closes",async()=>{var t,a;await m.click(r.getByRole("menuitem",{name:"Edit"})),await o((a=(t=s.items)==null?void 0:t[0])==null?void 0:a.onSelect).toHaveBeenCalledTimes(1),await le(()=>o(r.queryByRole("menu")).toBeNull())})}};function x(s){return{args:{label:"Actions",items:[{label:"Edit",onSelect:c()},{label:"Duplicate",onSelect:c()},{label:"Delete",onSelect:c()}]},decorators:[e=>n.jsx("div",{className:"fixed inset-0",children:n.jsx("div",{className:`absolute ${s}`,children:n.jsx(e,{})})})],play:async({canvasElement:e})=>{const l=d(e),i=d(document.body);await m.click(l.getByRole("button",{name:"Actions"}));const t=(await i.findByRole("menu")).getBoundingClientRect(),a=1;await o(t.left).toBeGreaterThanOrEqual(-a),await o(t.top).toBeGreaterThanOrEqual(-a),await o(t.right).toBeLessThanOrEqual(window.innerWidth+a),await o(t.bottom).toBeLessThanOrEqual(window.innerHeight+a)}}}const y=x("top-1 left-1"),B=x("top-1 right-1"),f=x("bottom-1 left-1"),S=x("bottom-1 right-1");var E,M,k;u.parameters={...u.parameters,docs:{...(E=u.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(j=(A=g.parameters)==null?void 0:A.docs)==null?void 0:j.source}}};var N,U,L;b.parameters={...b.parameters,docs:{...(N=b.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    label: "Filters",
    children: closeMenu => <div className="px-3 py-2 text-xs">
        <p className="mb-2 text-muted-foreground">Custom content goes here.</p>
        <Button size="sm" onClick={closeMenu}>
          Apply
        </Button>
      </div>
  }
}`,...(L=(U=b.parameters)==null?void 0:U.docs)==null?void 0:L.source}}};var q,z,_;h.parameters={...h.parameters,docs:{...(q=h.parameters)==null?void 0:q.docs,source:{originalSource:`{
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
    await step("opens a Modal from a button inside the menu", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Actions"
      }));
      await body.findByRole("menu");
      await userEvent.click(body.getByRole("button", {
        name: "View log"
      }));
    });
    await step("the Modal escapes the dropdown's box", async () => {
      const menu = body.getByRole("menu");
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
      await expect(body.queryByRole("menu")).not.toBeNull();
    });
  }
}`,...(_=(z=h.parameters)==null?void 0:z.docs)==null?void 0:_.source}}};var G,F,I;w.parameters={...w.parameters,docs:{...(G=w.parameters)==null?void 0:G.docs,source:{originalSource:`{
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
}`,...(I=(F=w.parameters)==null?void 0:F.docs)==null?void 0:I.source}}};var J,P,V;y.parameters={...y.parameters,docs:{...(J=y.parameters)==null?void 0:J.docs,source:{originalSource:'makeEdgeStory("top-1 left-1")',...(V=(P=y.parameters)==null?void 0:P.docs)==null?void 0:V.source}}};var H,K,W;B.parameters={...B.parameters,docs:{...(H=B.parameters)==null?void 0:H.docs,source:{originalSource:'makeEdgeStory("top-1 right-1")',...(W=(K=B.parameters)==null?void 0:K.docs)==null?void 0:W.source}}};var Y,$,Q;f.parameters={...f.parameters,docs:{...(Y=f.parameters)==null?void 0:Y.docs,source:{originalSource:'makeEdgeStory("bottom-1 left-1")',...(Q=($=f.parameters)==null?void 0:$.docs)==null?void 0:Q.source}}};var X,Z,ee;S.parameters={...S.parameters,docs:{...(X=S.parameters)==null?void 0:X.docs,source:{originalSource:'makeEdgeStory("bottom-1 right-1")',...(ee=(Z=S.parameters)==null?void 0:Z.docs)==null?void 0:ee.source}}};const De=["Items","AlignLeft","CustomTrigger","CustomContent","OpensModal","Interaction","EdgeTopLeft","EdgeTopRight","EdgeBottomLeft","EdgeBottomRight"];export{p as AlignLeft,b as CustomContent,g as CustomTrigger,f as EdgeBottomLeft,S as EdgeBottomRight,y as EdgeTopLeft,B as EdgeTopRight,w as Interaction,u as Items,h as OpensModal,De as __namedExportsOrder,Ce as default};
