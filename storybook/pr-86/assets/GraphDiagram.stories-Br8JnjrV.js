import{r as T,j as o}from"./iframe-DeBYCw4x.js";import{c as v}from"./utils-DW-IJACk.js";import"./preload-helper-CcRYDqr-.js";const ce=168,le=60,de=40,ue=24,me=96;function R(a,e){const r=a[e];if(!r)throw new Error(`ringLayout: expected a node at index ${e}`);return r}function pe(a,e={}){const r=e.nodeWidth??ce,n=e.nodeHeight??le,m=e.gap??de,i=e.padding??ue,c=a.length,s=c<=1?0:Math.max(me,(r+m)/(2*Math.sin(Math.PI/c))),l=s+r/2+i,d=s+n/2+i,u={};return c===1?u[R(a,0).id]={x:l,y:d}:c===2?(u[R(a,0).id]={x:l-s,y:d},u[R(a,1).id]={x:l+s,y:d}):a.forEach((g,h)=>{const f=-Math.PI/2+h*(2*Math.PI/c);u[g.id]={x:l+s*Math.cos(f),y:d+s*Math.sin(f)}}),{width:2*l,height:2*d,positions:u}}const ge=22;function he(a,e){return a<e?`${a}\0${e}`:`${e}\0${a}`}function S(a,e){const r=a[e];if(!r)throw new Error(`routeEdges: no layout position for node "${e}"`);return r}function fe(a,e){const r=a[e];if(!r)throw new Error(`routeEdges: expected an edge at index ${e}`);return r}function q(a,e,r,n){const m=e.x-a.x,i=e.y-a.y;if(m===0&&i===0)return{x:a.x,y:a.y};const c=m!==0?r/Math.abs(m):Number.POSITIVE_INFINITY,s=i!==0?n/Math.abs(i):Number.POSITIVE_INFINITY,l=Math.min(c,s);return{x:a.x+m*l,y:a.y+i*l}}function ye(a,e,r){return{x:.25*a.x+.5*e.x+.25*r.x,y:.25*a.y+.5*e.y+.25*r.y}}function xe(a,e,r){const n=r.nodeWidth/2,m=r.nodeHeight/2,i=new Map;for(const s of a){if(!(s.from in e))throw new Error(`routeEdges: edge "${s.id}" references unknown node "${s.from}"`);if(!(s.to in e))throw new Error(`routeEdges: edge "${s.id}" references unknown node "${s.to}"`);const l=he(s.from,s.to),d=i.get(l);d?d.push(s):i.set(l,[s])}const c={};for(const s of i.values()){const l=fe(s,0),d=S(e,l.from),u=S(e,l.to),g=u.x-d.x,h=u.y-d.y,f=Math.hypot(g,h)||1,j=-h/f,t=g/f,p=(d.x+u.x)/2,b=(d.y+u.y)/2;s.forEach((k,w)=>{const E=s.length>1,M=w%2===0?1:-1,ne=Math.floor(w/2)+1,C=E?M*ne*ge:0,N={x:p+j*C,y:b+t*C},se=S(e,k.from),oe=S(e,k.to),y=q(se,N,n,m),x=q(oe,N,n,m),ie=E?`M ${y.x} ${y.y} Q ${N.x} ${N.y} ${x.x} ${x.y}`:`M ${y.x} ${y.y} L ${x.x} ${x.y}`,W=E?ye(y,N,x):{x:(y.x+x.x)/2,y:(y.y+x.y)/2};c[k.id]={path:ie,labelX:W.x,labelY:W.y}})}return c}const De=168,be=60,A={neutral:"text-muted-foreground",success:"text-emerald-600 dark:text-emerald-400",danger:"text-red-600 dark:text-red-400",warning:"text-amber-600 dark:text-amber-400",info:"text-sky-600 dark:text-sky-400"},Ee={neutral:"border-border bg-card text-foreground",success:"border-emerald-500/50 bg-emerald-500/10 text-foreground",danger:"border-red-500/50 bg-red-500/10 text-foreground",warning:"border-amber-500/50 bg-amber-500/10 text-foreground",info:"border-sky-500/50 bg-sky-500/10 text-foreground"};function ke(a,e){const r=new Set(a.map(n=>n.id));for(const n of e){if(!r.has(n.from))throw new Error(`GraphDiagram: edge "${n.id}" references unknown node "${n.from}"`);if(!r.has(n.to))throw new Error(`GraphDiagram: edge "${n.id}" references unknown node "${n.to}"`)}}function Ne(a,e,r,n){switch(a){case"ring":return pe(e,{nodeWidth:r,nodeHeight:n});default:throw new Error(`GraphDiagram: unknown layout "${a}"`)}}function _(a,e){return`${a/e*100}%`}function H(a,e){const r=a[e];if(!r)throw new Error(`GraphDiagram: no route computed for edge "${e}"`);return r}function Ge(a,e){const r=a[e];if(!r)throw new Error(`GraphDiagram: no layout position computed for node "${e}"`);return r}function we(a,e){(a.key==="Enter"||a.key===" ")&&(a.preventDefault(),e())}function D({nodes:a,edges:e,layout:r="ring",selectedId:n,onNodeSelect:m,nodeWidth:i=De,nodeHeight:c=be,maxHeight:s,ariaLabel:l,className:d}){ke(a,e);const{width:u,height:g,positions:h}=T.useMemo(()=>Ne(r,a,i,c),[r,a,i,c]),f=T.useMemo(()=>xe(e,h,{nodeWidth:i,nodeHeight:c}),[e,h,i,c]),j=T.useMemo(()=>Array.from(new Set(e.map(t=>t.tone??"neutral"))),[e]);return o.jsx("div",{className:v("w-full overflow-auto",d),style:s!=null?{maxHeight:s}:void 0,children:o.jsxs("div",{className:"relative w-full",style:{aspectRatio:`${u} / ${g}`},children:[o.jsxs("svg",{viewBox:`0 0 ${u} ${g}`,preserveAspectRatio:"xMidYMid meet",role:"img","aria-label":l,className:"absolute inset-0 h-full w-full",children:[o.jsx("defs",{children:j.map(t=>o.jsx("marker",{id:`graph-diagram-arrow-${t}`,viewBox:"0 0 10 10",refX:8,refY:5,markerWidth:7,markerHeight:7,orient:"auto-start-reverse",children:o.jsx("path",{d:"M0,0 L10,5 L0,10 z",className:v(A[t],"fill-current")})},t))}),e.map(t=>{const p=t.tone??"neutral";return o.jsx("path",{d:H(f,t.id).path,fill:"none",stroke:"currentColor",strokeWidth:1.5,strokeDasharray:t.dashed?"5 4":void 0,markerEnd:`url(#graph-diagram-arrow-${p})`,className:A[p]},t.id)})]}),o.jsxs("div",{className:"absolute inset-0",children:[e.map(t=>{if(!t.label)return null;const p=H(f,t.id),b=t.tone??"neutral";return o.jsx("span",{className:v("absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium shadow-sm",A[b]),style:{left:_(p.labelX,u),top:_(p.labelY,g)},children:t.label},`label-${t.id}`)}),a.map(t=>{const p=Ge(h,t.id),b=n!=null&&t.id===n,k=t.tone??"neutral",w=t.shape==="pill"?"rounded-full":"rounded-lg",E=m!=null;return o.jsxs("div",{className:v("absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0.5 border px-3 py-1.5 text-center text-xs shadow-sm",w,Ee[k],b&&"ring-2 ring-primary ring-offset-2 ring-offset-background",E&&"cursor-pointer"),style:{left:_(p.x,u),top:_(p.y,g),width:i,height:c},...E?{role:"button",tabIndex:0,"aria-pressed":b,onClick:()=>m(t.id),onKeyDown:M=>we(M,()=>m(t.id))}:{},"aria-label":t.ariaLabel,children:[o.jsx("span",{className:"line-clamp-2 font-medium leading-tight",children:t.label}),t.detail!=null&&o.jsx("span",{className:"line-clamp-1 text-[10px] leading-tight text-muted-foreground",children:t.detail}),t.badge!=null&&o.jsx("span",{className:"mt-0.5",children:t.badge})]},t.id)})]})]})})}try{D.displayName="GraphDiagram",D.__docgenInfo={description:"",displayName:"GraphDiagram",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/GraphDiagram.tsx",methods:[],props:{nodes:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/GraphDiagram.tsx",name:"GraphDiagramProps"}],description:"",name:"nodes",parent:{fileName:"clicky-ui/packages/ui/src/data/GraphDiagram.tsx",name:"GraphDiagramProps"},required:!0,tags:{},type:{name:"GraphDiagramNode[]"}},edges:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/GraphDiagram.tsx",name:"GraphDiagramProps"}],description:"",name:"edges",parent:{fileName:"clicky-ui/packages/ui/src/data/GraphDiagram.tsx",name:"GraphDiagramProps"},required:!0,tags:{},type:{name:"GraphDiagramEdge[]"}},layout:{defaultValue:{value:"ring"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/GraphDiagram.tsx",name:"GraphDiagramProps"}],description:'Only "ring" today; a "columns" layout is planned.',name:"layout",parent:{fileName:"clicky-ui/packages/ui/src/data/GraphDiagram.tsx",name:"GraphDiagramProps"},required:!1,tags:{},type:{name:'"ring"'}},selectedId:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/GraphDiagram.tsx",name:"GraphDiagramProps"}],description:"",name:"selectedId",parent:{fileName:"clicky-ui/packages/ui/src/data/GraphDiagram.tsx",name:"GraphDiagramProps"},required:!1,tags:{},type:{name:"string"}},onNodeSelect:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/GraphDiagram.tsx",name:"GraphDiagramProps"}],description:"",name:"onNodeSelect",parent:{fileName:"clicky-ui/packages/ui/src/data/GraphDiagram.tsx",name:"GraphDiagramProps"},required:!1,tags:{},type:{name:"(id: string) => void"}},nodeWidth:{defaultValue:{value:"168"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/GraphDiagram.tsx",name:"GraphDiagramProps"}],description:"",name:"nodeWidth",parent:{fileName:"clicky-ui/packages/ui/src/data/GraphDiagram.tsx",name:"GraphDiagramProps"},required:!1,tags:{},type:{name:"number"}},nodeHeight:{defaultValue:{value:"60"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/GraphDiagram.tsx",name:"GraphDiagramProps"}],description:"",name:"nodeHeight",parent:{fileName:"clicky-ui/packages/ui/src/data/GraphDiagram.tsx",name:"GraphDiagramProps"},required:!1,tags:{},type:{name:"number"}},maxHeight:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/GraphDiagram.tsx",name:"GraphDiagramProps"}],description:"",name:"maxHeight",parent:{fileName:"clicky-ui/packages/ui/src/data/GraphDiagram.tsx",name:"GraphDiagramProps"},required:!1,tags:{},type:{name:"string | number"}},ariaLabel:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/GraphDiagram.tsx",name:"GraphDiagramProps"}],description:"",name:"ariaLabel",parent:{fileName:"clicky-ui/packages/ui/src/data/GraphDiagram.tsx",name:"GraphDiagramProps"},required:!0,tags:{},type:{name:"string"}},className:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/GraphDiagram.tsx",name:"GraphDiagramProps"}],description:"",name:"className",parent:{fileName:"clicky-ui/packages/ui/src/data/GraphDiagram.tsx",name:"GraphDiagramProps"},required:!1,tags:{},type:{name:"string"}}},tags:{}}}catch{}const{expect:O,userEvent:ve,waitFor:Se,within:ae}=__STORYBOOK_MODULE_TEST__,Oe={title:"Data/GraphDiagram",component:D,tags:["autodocs"],parameters:{docs:{description:{component:"Generic, type-agnostic node/edge diagram. Ring layout places nodes on a circle so cycles and reciprocal edges — relationships a left-to-right column layout can't express — read clearly. The component carries no domain fields; a producer maps its own model onto `GraphDiagramNode`/`GraphDiagramEdge`."}}},args:{ariaLabel:"Example graph"}},re=[{id:"session-a",label:"Session 93 · victim",tone:"danger"},{id:"resource-r1",label:"Lock A",detail:"keylock",shape:"pill"},{id:"session-b",label:"Session 47 · survivor",tone:"success"},{id:"resource-r2",label:"Lock B",detail:"keylock",shape:"pill"}],te=[{id:"e1",from:"resource-r1",to:"session-a",label:"holds X",tone:"info"},{id:"e2",from:"session-a",to:"resource-r2",label:"wants S",tone:"warning",dashed:!0},{id:"e3",from:"resource-r2",to:"session-b",label:"holds S",tone:"info"},{id:"e4",from:"session-b",to:"resource-r1",label:"wants X",tone:"warning",dashed:!0},{id:"e5",from:"resource-r1",to:"session-b",label:"holds S",tone:"info"}],I={args:{nodes:re,edges:te,ariaLabel:"Four node deadlock cycle"},render:a=>o.jsx("div",{style:{maxWidth:640},children:o.jsx(D,{...a})})},$={args:{nodes:re,edges:te,ariaLabel:"Selectable deadlock cycle"},render:a=>{function e(){const[r,n]=T.useState("session-a");return o.jsx("div",{style:{maxWidth:640},children:o.jsx(D,{...a,selectedId:r,onNodeSelect:n})})}return o.jsx(e,{})},play:async({canvasElement:a,step:e})=>{const r=ae(a);await e("selected node is pressed",async()=>{const n=r.getByRole("button",{name:/victim/});await O(n).toHaveAttribute("aria-pressed","true")}),await e("clicking another node moves the selection",async()=>{const n=r.getByRole("button",{name:/survivor/});await ve.click(n),await Se(()=>O(n).toHaveAttribute("aria-pressed","true")),await O(r.getByRole("button",{name:/victim/})).toHaveAttribute("aria-pressed","false")})}},_e=[{id:"only",label:"Isolated resource",detail:"no contention"}],L={args:{nodes:_e,edges:[],ariaLabel:"Single isolated node"},render:a=>o.jsx("div",{style:{maxWidth:320},children:o.jsx(D,{...a})})},Ie=8,G=Array.from({length:Ie},(a,e)=>({id:`node-${e}`,label:`Session ${e+1}`,tone:e%2===0?"info":"neutral"})),$e=G.map((a,e)=>({id:`edge-${e}`,from:a.id,to:G[(e+1)%G.length].id,label:"waits on"})),P={args:{nodes:G,edges:$e,ariaLabel:"Eight node wait ring"},render:a=>o.jsx("div",{style:{maxWidth:720},children:o.jsx(D,{...a})}),play:async({canvasElement:a,step:e})=>{const r=ae(a);await e("every node label is rendered",async()=>{for(const n of G)await O(r.getByText(String(n.label))).toBeInTheDocument()})}};var Y,B,F;I.parameters={...I.parameters,docs:{...(Y=I.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  args: {
    nodes: CYCLE_NODES,
    edges: CYCLE_EDGES,
    ariaLabel: "Four node deadlock cycle"
  },
  render: args => <div style={{
    maxWidth: 640
  }}>
      <GraphDiagram {...args} />
    </div>
}`,...(F=(B=I.parameters)==null?void 0:B.docs)==null?void 0:F.source}}};var V,U,X;$.parameters={...$.parameters,docs:{...(V=$.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    nodes: CYCLE_NODES,
    edges: CYCLE_EDGES,
    ariaLabel: "Selectable deadlock cycle"
  },
  render: args => {
    function SelectableGraph() {
      const [selectedId, setSelectedId] = useState<string | undefined>("session-a");
      return <div style={{
        maxWidth: 640
      }}>
          <GraphDiagram {...args} selectedId={selectedId} onNodeSelect={setSelectedId} />
        </div>;
    }
    return <SelectableGraph />;
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("selected node is pressed", async () => {
      const button = canvas.getByRole("button", {
        name: /victim/
      });
      await expect(button).toHaveAttribute("aria-pressed", "true");
    });
    await step("clicking another node moves the selection", async () => {
      const survivor = canvas.getByRole("button", {
        name: /survivor/
      });
      await userEvent.click(survivor);
      await waitFor(() => expect(survivor).toHaveAttribute("aria-pressed", "true"));
      await expect(canvas.getByRole("button", {
        name: /victim/
      })).toHaveAttribute("aria-pressed", "false");
    });
  }
}`,...(X=(U=$.parameters)==null?void 0:U.docs)==null?void 0:X.source}}};var K,z,Q;L.parameters={...L.parameters,docs:{...(K=L.parameters)==null?void 0:K.docs,source:{originalSource:`{
  args: {
    nodes: SINGLE_NODE,
    edges: [],
    ariaLabel: "Single isolated node"
  },
  render: args => <div style={{
    maxWidth: 320
  }}>
      <GraphDiagram {...args} />
    </div>
}`,...(Q=(z=L.parameters)==null?void 0:z.docs)==null?void 0:Q.source}}};var J,Z,ee;P.parameters={...P.parameters,docs:{...(J=P.parameters)==null?void 0:J.docs,source:{originalSource:`{
  args: {
    nodes: WIDE_RING_NODES,
    edges: WIDE_RING_EDGES,
    ariaLabel: "Eight node wait ring"
  },
  render: args => <div style={{
    maxWidth: 720
  }}>
      <GraphDiagram {...args} />
    </div>,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("every node label is rendered", async () => {
      for (const node of WIDE_RING_NODES) {
        await expect(canvas.getByText(String(node.label))).toBeInTheDocument();
      }
    });
  }
}`,...(ee=(Z=P.parameters)==null?void 0:Z.docs)==null?void 0:ee.source}}};const je=["Default","Selectable","SingleNode","EightNodeRing"];export{I as Default,P as EightNodeRing,$ as Selectable,L as SingleNode,je as __namedExportsOrder,Oe as default};
