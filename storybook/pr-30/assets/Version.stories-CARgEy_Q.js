import{r as Y,j as e}from"./iframe-DIPFVygJ.js";import{c as q}from"./utils-BLSKlp9E.js";import{B as g}from"./Badge-DCBzBU8l.js";import"./preload-helper-D5l2DbWZ.js";import"./index-1evVQkiP.js";import"./Icon-GGxX1w_8.js";function i(a,n){try{return a()}catch{return n}}function K(){return i(()=>!0,!1)?"storybook":i(()=>!1,!1)?"dev":"production"}function P(){return{commit:i(()=>__CLICKY_COMMIT__,""),tag:i(()=>__CLICKY_TAG__,""),date:i(()=>__CLICKY_DATE__,""),dirty:i(()=>__CLICKY_DIRTY__,!1),mode:K()}}const z={dev:{label:"dev",tone:"info"},storybook:{label:"storybook",tone:"neutral"}};function G(a){if(!a)return"";const n=new Date(a);return Number.isNaN(n.getTime())?a:n.toISOString()}const r=Y.forwardRef(({commit:a=!0,tag:n=!0,date:B=!0,info:O,className:E,...M},R)=>{const t={...P(),...O},s=[];n&&t.tag&&s.push(t.tag),a&&t.commit&&s.push(t.commit),B&&t.date&&s.push(G(t.date));const p=t.mode!=="production"?z[t.mode]:null;return e.jsxs("span",{ref:R,className:q("inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground",E),...M,children:[s.length>0&&e.jsx("span",{children:s.join(" · ")}),t.dirty&&e.jsx(g,{tone:"warning",variant:"soft",size:"xs",children:"dirty"}),p&&e.jsx(g,{tone:p.tone,variant:"soft",size:"xs",children:p.label})]})});r.displayName="Version";try{r.displayName="Version",r.__docgenInfo={description:"Renders clicky-ui build metadata: git commit, tag, and build date, plus a\nstatus badge for a dirty working tree, Vite dev mode, or Storybook.\n\nCommit/tag/date/dirty are captured when the library is built (Vite `define`);\n`dev` and `storybook` are detected at runtime.",displayName:"Version",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/Version.tsx",methods:[],props:{commit:{defaultValue:{value:"true"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/Version.tsx",name:"TypeLiteral"}],description:"Show the short git commit hash.",name:"commit",required:!1,tags:{},type:{name:"boolean"}},tag:{defaultValue:{value:"true"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/Version.tsx",name:"TypeLiteral"}],description:"Show the git tag.",name:"tag",required:!1,tags:{},type:{name:"boolean"}},date:{defaultValue:{value:"true"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/Version.tsx",name:"TypeLiteral"}],description:"Show the build date.",name:"date",required:!1,tags:{},type:{name:"boolean"}},info:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/Version.tsx",name:"TypeLiteral"}],description:`Override the resolved build/runtime info. Primarily for stories and tests;
when omitted the values injected at build time are used.`,name:"info",required:!1,tags:{},type:{name:"Partial<VersionInfo>"}}},tags:{}}}catch{}const o={commit:"a1b2c3d",tag:"v1.2.3",date:"2026-06-09T07:30:00.000Z",dirty:!1,mode:"production"},W={title:"Data/Version",component:r,tags:["autodocs"],parameters:{docs:{description:{component:"Renders clicky-ui build metadata — git tag, commit, and build date — with a status badge for a dirty working tree, Vite dev mode, or Storybook. Commit/tag/date/dirty are captured at library build time via Vite `define`; dev/storybook are detected at runtime. Stories use the `info` prop to simulate each state."}}},argTypes:{commit:{control:"boolean",description:"Show the short git commit hash."},tag:{control:"boolean",description:"Show the git tag."},date:{control:"boolean",description:"Show the build date."}},args:{commit:!0,tag:!0,date:!0,info:o}},d={},c={name:"Build date only",args:{commit:!1,tag:!1}},m={name:"Dirty working tree",args:{info:{...o,dirty:!0}}},l={name:"Vite dev",args:{info:{...o,mode:"dev"}}},u={args:{info:{...o,mode:"storybook"}}},f={name:"All states",render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"0.5rem"},children:[e.jsx(r,{info:o}),e.jsx(r,{info:{...o,dirty:!0}}),e.jsx(r,{info:{...o,mode:"dev"}}),e.jsx(r,{info:{...o,mode:"storybook"}}),e.jsx(r,{info:{...o,dirty:!0,mode:"dev"}})]})};var y,h,b;d.parameters={...d.parameters,docs:{...(y=d.parameters)==null?void 0:y.docs,source:{originalSource:"{}",...(b=(h=d.parameters)==null?void 0:h.docs)==null?void 0:b.source}}};var k,v,_;c.parameters={...c.parameters,docs:{...(k=c.parameters)==null?void 0:k.docs,source:{originalSource:`{
  name: "Build date only",
  args: {
    commit: false,
    tag: false
  }
}`,...(_=(v=c.parameters)==null?void 0:v.docs)==null?void 0:_.source}}};var x,V,S;m.parameters={...m.parameters,docs:{...(x=m.parameters)==null?void 0:x.docs,source:{originalSource:`{
  name: "Dirty working tree",
  args: {
    info: {
      ...info,
      dirty: true
    }
  }
}`,...(S=(V=m.parameters)==null?void 0:V.docs)==null?void 0:S.source}}};var D,w,j;l.parameters={...l.parameters,docs:{...(D=l.parameters)==null?void 0:D.docs,source:{originalSource:`{
  name: "Vite dev",
  args: {
    info: {
      ...info,
      mode: "dev"
    }
  }
}`,...(j=(w=l.parameters)==null?void 0:w.docs)==null?void 0:j.source}}};var C,N,T;u.parameters={...u.parameters,docs:{...(C=u.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    info: {
      ...info,
      mode: "storybook"
    }
  }
}`,...(T=(N=u.parameters)==null?void 0:N.docs)==null?void 0:T.source}}};var I,L,A;f.parameters={...f.parameters,docs:{...(I=f.parameters)==null?void 0:I.docs,source:{originalSource:`{
  name: "All states",
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
  }}>
      <Version info={info} />
      <Version info={{
      ...info,
      dirty: true
    }} />
      <Version info={{
      ...info,
      mode: "dev"
    }} />
      <Version info={{
      ...info,
      mode: "storybook"
    }} />
      <Version info={{
      ...info,
      dirty: true,
      mode: "dev"
    }} />
    </div>
}`,...(A=(L=f.parameters)==null?void 0:L.docs)==null?void 0:A.source}}};const X=["Default","DateOnly","Dirty","DevMode","Storybook","AllStatuses"];export{f as AllStatuses,c as DateOnly,d as Default,l as DevMode,m as Dirty,u as Storybook,X as __namedExportsOrder,W as default};
