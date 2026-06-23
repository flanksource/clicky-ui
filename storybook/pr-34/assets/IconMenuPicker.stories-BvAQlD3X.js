import{j as e,r as Q}from"./iframe-B-R1GM9F.js";import{I as J}from"./icon-menu-picker-D5TnlHmo.js";import{U as X,a as Z,b as ee}from"./UiSun-C8IWEqEW.js";import"./preload-helper-B4w--iqy.js";import"./floating-ui.react-DPNvzpty.js";import"./index-DJve4rSX.js";import"./index-BWgeyKN8.js";import"./utils-BLSKlp9E.js";import"./Icon-GOgSuK4c.js";import"./modalStack-DOuKvvHi.js";import"./zIndex-CigQ76av.js";import"./button-BuoaacKd.js";import"./index-1evVQkiP.js";import"./loading-BCTdXuAj.js";import"./IconButton-CNeil-mo.js";import"./UiChevronDown-7vVXchWm.js";import"./UiCheck-BThsfaV8.js";const{expect:t,userEvent:v,waitFor:te,within:s}=__STORYBOOK_MODULE_TEST__,oe=[{value:"light",icon:X,label:"light"},{value:"dark",icon:Z,label:"dark"},{value:"system",icon:ee,label:"system"}];function i(o){const[n,a]=Q.useState("system");return e.jsx(J,{value:n,onChange:a,options:oe,ariaLabel:"Theme",...o})}const fe={title:"Components/IconMenuPicker",component:J,tags:["autodocs"],parameters:{docs:{description:{component:"An icon-triggered radio menu used by the theme and density switchers. The menu is rendered in a portal above all other content and uses Floating UI's `flip`/`shift` so it stays fully on-screen no matter where the trigger sits."}}}},u={render:()=>e.jsx(i,{})},p={render:()=>e.jsx("div",{className:"w-56",children:e.jsx(i,{showLabel:!0,footer:e.jsx("span",{children:"resolves to dark"})})})},h={render:()=>e.jsx(i,{}),play:async({canvasElement:o,step:n})=>{const a=s(o),r=s(document.body);await n("opens the menu in a portal, above the canvas",async()=>{await v.click(a.getByRole("button",{name:"Theme"}));const E=await r.findByRole("menu",{name:"Theme"});await t(o.contains(E)).toBe(!1),await t(document.body.contains(E)).toBe(!0)}),await n("selecting an option updates the trigger and closes",async()=>{await v.click(r.getByRole("menuitemradio",{name:/light/})),await te(()=>t(r.queryByRole("menu")).toBeNull()),await t(a.getByRole("button",{name:"Theme"})).toHaveAttribute("title","Theme: light")})}},c={TopLeft:"top-1 left-1",TopRight:"top-1 right-1",BottomLeft:"bottom-1 left-1",BottomRight:"bottom-1 right-1",BottomCenter:"bottom-1 left-1/2 -translate-x-1/2"};function m(o){return{render:()=>e.jsx("div",{className:"fixed inset-0",children:e.jsx("div",{className:`absolute ${o}`,children:e.jsx(i,{})})}),play:async({canvasElement:n})=>{const a=s(n),r=s(document.body);await v.click(a.getByRole("button",{name:"Theme"}));const d=(await r.findByRole("menu",{name:"Theme"})).getBoundingClientRect(),l=1;await t(d.left).toBeGreaterThanOrEqual(-l),await t(d.top).toBeGreaterThanOrEqual(-l),await t(d.right).toBeLessThanOrEqual(window.innerWidth+l),await t(d.bottom).toBeLessThanOrEqual(window.innerHeight+l)}}}const g=m(c.TopLeft),y=m(c.TopRight),b=m(c.BottomLeft),w=m(c.BottomRight),B=m(c.BottomCenter),f={render:()=>e.jsxs("div",{className:"h-40 w-64 overflow-hidden rounded border border-border p-3",children:[e.jsx("p",{className:"mb-2 text-sm text-muted-foreground",children:"The picker lives in an overflow-hidden box; the menu still escapes it."}),e.jsx(i,{})]}),play:async({canvasElement:o})=>{const n=s(o),a=s(document.body);await v.click(n.getByRole("button",{name:"Theme"}));const r=await a.findByRole("menu",{name:"Theme"});await t(document.body.contains(r)).toBe(!0),await t(o.contains(r)).toBe(!1)}};var R,T,x;u.parameters={...u.parameters,docs:{...(R=u.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => <ControlledPicker />
}`,...(x=(T=u.parameters)==null?void 0:T.docs)==null?void 0:x.source}}};var S,k,C;p.parameters={...p.parameters,docs:{...(S=p.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <div className="w-56">
      <ControlledPicker showLabel footer={<span>resolves to dark</span>} />
    </div>
}`,...(C=(k=p.parameters)==null?void 0:k.docs)==null?void 0:C.source}}};var L,N,O;h.parameters={...h.parameters,docs:{...(L=h.parameters)==null?void 0:L.docs,source:{originalSource:`{
  render: () => <ControlledPicker />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await step("opens the menu in a portal, above the canvas", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Theme"
      }));
      const menu = await body.findByRole("menu", {
        name: "Theme"
      });
      // The menu is portaled to document.body, not nested under the trigger.
      await expect(canvasElement.contains(menu)).toBe(false);
      await expect(document.body.contains(menu)).toBe(true);
    });
    await step("selecting an option updates the trigger and closes", async () => {
      await userEvent.click(body.getByRole("menuitemradio", {
        name: /light/
      }));
      await waitFor(() => expect(body.queryByRole("menu")).toBeNull());
      await expect(canvas.getByRole("button", {
        name: "Theme"
      })).toHaveAttribute("title", "Theme: light");
    });
  }
}`,...(O=(N=h.parameters)==null?void 0:N.docs)==null?void 0:O.source}}};var j,I,P;g.parameters={...g.parameters,docs:{...(j=g.parameters)==null?void 0:j.docs,source:{originalSource:"makeEdgeStory(CORNERS.TopLeft)",...(P=(I=g.parameters)==null?void 0:I.docs)==null?void 0:P.source}}};var _,q,U;y.parameters={...y.parameters,docs:{...(_=y.parameters)==null?void 0:_.docs,source:{originalSource:"makeEdgeStory(CORNERS.TopRight)",...(U=(q=y.parameters)==null?void 0:q.docs)==null?void 0:U.source}}};var M,D,H;b.parameters={...b.parameters,docs:{...(M=b.parameters)==null?void 0:M.docs,source:{originalSource:"makeEdgeStory(CORNERS.BottomLeft)",...(H=(D=b.parameters)==null?void 0:D.docs)==null?void 0:H.source}}};var A,F,W;w.parameters={...w.parameters,docs:{...(A=w.parameters)==null?void 0:A.docs,source:{originalSource:"makeEdgeStory(CORNERS.BottomRight)",...(W=(F=w.parameters)==null?void 0:F.docs)==null?void 0:W.source}}};var G,K,V;B.parameters={...B.parameters,docs:{...(G=B.parameters)==null?void 0:G.docs,source:{originalSource:"makeEdgeStory(CORNERS.BottomCenter)",...(V=(K=B.parameters)==null?void 0:K.docs)==null?void 0:V.source}}};var Y,$,z;f.parameters={...f.parameters,docs:{...(Y=f.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  render: () => <div className="h-40 w-64 overflow-hidden rounded border border-border p-3">
      <p className="mb-2 text-sm text-muted-foreground">
        The picker lives in an overflow-hidden box; the menu still escapes it.
      </p>
      <ControlledPicker />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole("button", {
      name: "Theme"
    }));
    const menu = await body.findByRole("menu", {
      name: "Theme"
    });
    // Portaled out of the clipping container, so it renders on document.body.
    await expect(document.body.contains(menu)).toBe(true);
    await expect(canvasElement.contains(menu)).toBe(false);
  }
}`,...(z=($=f.parameters)==null?void 0:$.docs)==null?void 0:z.source}}};const ve=["Default","WithLabel","Interaction","EdgeTopLeft","EdgeTopRight","EdgeBottomLeft","EdgeBottomRight","EdgeBottomCenter","InsideScrollContainer"];export{u as Default,B as EdgeBottomCenter,b as EdgeBottomLeft,w as EdgeBottomRight,g as EdgeTopLeft,y as EdgeTopRight,f as InsideScrollContainer,h as Interaction,p as WithLabel,ve as __namedExportsOrder,fe as default};
