import{j as n}from"./iframe-gCNtXdWy.js";import{D as Q}from"./DropdownMenu-DXisIpm9.js";import{B as $}from"./button-BKV1MLun.js";import{U as V}from"./UiJson-CuolWG-g.js";import{U as X}from"./UiMarkdown-CXV6U9v1.js";import{U as Z,a as ee}from"./UiDownload-hdsOVtTr.js";import"./preload-helper-C_Fsq_bH.js";import"./floating-ui.react-DOnFnJ2M.js";import"./index-CFqMPY85.js";import"./index-CubYxTD6.js";import"./utils-BLSKlp9E.js";import"./Icon-BKGlD8mw.js";import"./UiChevronDown-cb46gEod.js";import"./index-1evVQkiP.js";const{expect:t,fn:s,userEvent:B,waitFor:te,within:y}=__STORYBOOK_MODULE_TEST__,Se={title:"Overlay/DropdownMenu",component:Q,parameters:{docs:{description:{component:"Click-triggered dropdown menu. Closes on outside click or Escape. Provide declarative `items` or a `children` render-prop for custom content; the trigger defaults to a Button but accepts any node via `trigger`."}}}},l={args:{label:"Download",icon:Z,items:[{label:"JSON",icon:V,onSelect:()=>{}},{label:"Markdown",icon:X,onSelect:()=>{}}]}},m={args:{label:"Actions",align:"left",items:[{label:"Rename",onSelect:()=>{}},{label:"Duplicate",onSelect:()=>{}},{label:"Delete",onSelect:()=>{},disabled:!0}]}},d={args:{trigger:n.jsx($,{variant:"ghost",size:"icon","aria-label":"Open menu",children:n.jsx(ee,{})}),items:[{label:"Profile",onSelect:()=>{}},{label:"Settings",onSelect:()=>{}}]}},p={args:{label:"Filters",children:r=>n.jsxs("div",{className:"px-3 py-2 text-xs",children:[n.jsx("p",{className:"mb-2 text-muted-foreground",children:"Custom content goes here."}),n.jsx($,{size:"sm",onClick:r,children:"Apply"})]})}},u={args:{label:"Actions",items:[{label:"Edit",onSelect:s()},{label:"Duplicate",onSelect:s()},{label:"Delete",onSelect:s()}]},play:async({args:r,canvasElement:o,step:i})=>{const h=y(o),c=y(document.body);await i("opens the menu in a portal above the canvas",async()=>{await B.click(h.getByRole("button",{name:"Actions"}));const e=await c.findByRole("menu");await t(o.contains(e)).toBe(!1),await t(document.body.contains(e)).toBe(!0)}),await i("selecting an item fires its handler and closes",async()=>{var e,a;await B.click(c.getByRole("menuitem",{name:"Edit"})),await t((a=(e=r.items)==null?void 0:e[0])==null?void 0:a.onSelect).toHaveBeenCalledTimes(1),await te(()=>t(c.queryByRole("menu")).toBeNull())})}};function f(r){return{args:{label:"Actions",items:[{label:"Edit",onSelect:s()},{label:"Duplicate",onSelect:s()},{label:"Delete",onSelect:s()}]},decorators:[o=>n.jsx("div",{className:"fixed inset-0",children:n.jsx("div",{className:`absolute ${r}`,children:n.jsx(o,{})})})],play:async({canvasElement:o})=>{const i=y(o),h=y(document.body);await B.click(i.getByRole("button",{name:"Actions"}));const e=(await h.findByRole("menu")).getBoundingClientRect(),a=1;await t(e.left).toBeGreaterThanOrEqual(-a),await t(e.top).toBeGreaterThanOrEqual(-a),await t(e.right).toBeLessThanOrEqual(window.innerWidth+a),await t(e.bottom).toBeLessThanOrEqual(window.innerHeight+a)}}}const g=f("top-1 left-1"),b=f("top-1 right-1"),S=f("bottom-1 left-1"),w=f("bottom-1 right-1");var E,v,x;l.parameters={...l.parameters,docs:{...(E=l.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(x=(v=l.parameters)==null?void 0:v.docs)==null?void 0:x.source}}};var R,k,D;m.parameters={...m.parameters,docs:{...(R=m.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(D=(k=m.parameters)==null?void 0:k.docs)==null?void 0:D.source}}};var C,T,O;d.parameters={...d.parameters,docs:{...(C=d.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(O=(T=d.parameters)==null?void 0:T.docs)==null?void 0:O.source}}};var A,U,M;p.parameters={...p.parameters,docs:{...(A=p.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    label: "Filters",
    children: closeMenu => <div className="px-3 py-2 text-xs">
        <p className="mb-2 text-muted-foreground">Custom content goes here.</p>
        <Button size="sm" onClick={closeMenu}>
          Apply
        </Button>
      </div>
  }
}`,...(M=(U=p.parameters)==null?void 0:U.docs)==null?void 0:M.source}}};var j,N,L;u.parameters={...u.parameters,docs:{...(j=u.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...(L=(N=u.parameters)==null?void 0:N.docs)==null?void 0:L.source}}};var _,q,z;g.parameters={...g.parameters,docs:{...(_=g.parameters)==null?void 0:_.docs,source:{originalSource:'makeEdgeStory("top-1 left-1")',...(z=(q=g.parameters)==null?void 0:q.docs)==null?void 0:z.source}}};var F,I,J;b.parameters={...b.parameters,docs:{...(F=b.parameters)==null?void 0:F.docs,source:{originalSource:'makeEdgeStory("top-1 right-1")',...(J=(I=b.parameters)==null?void 0:I.docs)==null?void 0:J.source}}};var H,P,G;S.parameters={...S.parameters,docs:{...(H=S.parameters)==null?void 0:H.docs,source:{originalSource:'makeEdgeStory("bottom-1 left-1")',...(G=(P=S.parameters)==null?void 0:P.docs)==null?void 0:G.source}}};var K,W,Y;w.parameters={...w.parameters,docs:{...(K=w.parameters)==null?void 0:K.docs,source:{originalSource:'makeEdgeStory("bottom-1 right-1")',...(Y=(W=w.parameters)==null?void 0:W.docs)==null?void 0:Y.source}}};const we=["Items","AlignLeft","CustomTrigger","CustomContent","Interaction","EdgeTopLeft","EdgeTopRight","EdgeBottomLeft","EdgeBottomRight"];export{m as AlignLeft,p as CustomContent,d as CustomTrigger,S as EdgeBottomLeft,w as EdgeBottomRight,g as EdgeTopLeft,b as EdgeTopRight,u as Interaction,l as Items,we as __namedExportsOrder,Se as default};
