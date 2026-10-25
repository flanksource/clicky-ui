import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./utils-CEDXhWC6.js";import{n as a,t as o}from"./Badge-CRdwbp2r.js";function s(e,t){try{return e()}catch{return t}}function c(){return s(()=>!0,!1)?`storybook`:s(()=>!1,!1)?`dev`:`production`}function l(){return{commit:s(()=>__CLICKY_COMMIT__,``),tag:s(()=>__CLICKY_TAG__,``),date:s(()=>__CLICKY_DATE__,``),dirty:s(()=>__CLICKY_DIRTY__,!1),mode:c()}}function u(e){if(!e)return``;let t=new Date(e);return Number.isNaN(t.getTime())?e:t.toISOString()}var d,f,p,m;function h(){return(h=e((()=>{d=t(),r(),a(),f=n(),p={dev:{label:`dev`,tone:`info`},storybook:{label:`storybook`,tone:`neutral`}},m=(0,d.forwardRef)(({commit:e=!0,tag:t=!0,date:n=!0,info:r,className:a,...s},c)=>{let d={...l(),...r},m=[];t&&d.tag&&m.push(d.tag),e&&d.commit&&m.push(d.commit),n&&d.date&&m.push(u(d.date));let h=d.mode===`production`?null:p[d.mode];return(0,f.jsxs)(`span`,{ref:c,className:i(`inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground`,a),...s,children:[m.length>0&&(0,f.jsx)(`span`,{children:m.join(` · `)}),d.dirty&&(0,f.jsx)(o,{tone:`warning`,variant:`soft`,size:`xs`,children:`dirty`}),h&&(0,f.jsx)(o,{tone:h.tone,variant:`soft`,size:`xs`,children:h.label})]})}),m.displayName=`Version`;try{m.displayName=`Version`,m.__docgenInfo={description:"Renders clicky-ui build metadata: git commit, tag, and build date, plus a\nstatus badge for a dirty working tree, Vite dev mode, or Storybook.\n\nCommit/tag/date/dirty are captured when the library is built (Vite `define`);\n`dev` and `storybook` are detected at runtime.",displayName:`Version`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/Version.tsx`,methods:[],props:{commit:{defaultValue:{value:`true`},declarations:[{fileName:`clicky-ui/packages/ui/src/data/Version.tsx`,name:`TypeLiteral`}],description:`Show the short git commit hash.`,name:`commit`,required:!1,tags:{},type:{name:`boolean`}},tag:{defaultValue:{value:`true`},declarations:[{fileName:`clicky-ui/packages/ui/src/data/Version.tsx`,name:`TypeLiteral`}],description:`Show the git tag.`,name:`tag`,required:!1,tags:{},type:{name:`boolean`}},date:{defaultValue:{value:`true`},declarations:[{fileName:`clicky-ui/packages/ui/src/data/Version.tsx`,name:`TypeLiteral`}],description:`Show the build date.`,name:`date`,required:!1,tags:{},type:{name:`boolean`}},info:{defaultValue:null,declarations:[{fileName:`clicky-ui/packages/ui/src/data/Version.tsx`,name:`TypeLiteral`}],description:`Override the resolved build/runtime info. Primarily for stories and tests;
when omitted the values injected at build time are used.`,name:`info`,required:!1,tags:{},type:{name:`Partial<VersionInfo>`}}},tags:{}}}catch{}})))()}var g,_,v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{h(),g=n(),_={commit:`a1b2c3d`,tag:`v1.2.3`,date:`2026-06-09T07:30:00.000Z`,dirty:!1,mode:`production`},v={title:`Data/Version`,component:m,tags:[`autodocs`],parameters:{docs:{description:{component:"Renders clicky-ui build metadata — git tag, commit, and build date — with a status badge for a dirty working tree, Vite dev mode, or Storybook. Commit/tag/date/dirty are captured at library build time via Vite `define`; dev/storybook are detected at runtime. Stories use the `info` prop to simulate each state."}}},argTypes:{commit:{control:`boolean`,description:`Show the short git commit hash.`},tag:{control:`boolean`,description:`Show the git tag.`},date:{control:`boolean`,description:`Show the build date.`}},args:{commit:!0,tag:!0,date:!0,info:_}},y={},b={name:`Build date only`,args:{commit:!1,tag:!1}},x={name:`Dirty working tree`,args:{info:{..._,dirty:!0}}},S={name:`Vite dev`,args:{info:{..._,mode:`dev`}}},C={args:{info:{..._,mode:`storybook`}}},w={name:`All states`,render:()=>(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`0.5rem`},children:[(0,g.jsx)(m,{info:_}),(0,g.jsx)(m,{info:{..._,dirty:!0}}),(0,g.jsx)(m,{info:{..._,mode:`dev`}}),(0,g.jsx)(m,{info:{..._,mode:`storybook`}}),(0,g.jsx)(m,{info:{..._,dirty:!0,mode:`dev`}})]})},T=[`Default`,`DateOnly`,`Dirty`,`DevMode`,`Storybook`,`AllStatuses`],y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: "Build date only",
  args: {
    commit: false,
    tag: false
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: "Dirty working tree",
  args: {
    info: {
      ...info,
      dirty: true
    }
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: "Vite dev",
  args: {
    info: {
      ...info,
      mode: "dev"
    }
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    info: {
      ...info,
      mode: "storybook"
    }
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}}})))()}E();export{w as AllStatuses,b as DateOnly,y as Default,S as DevMode,x as Dirty,C as Storybook,T as __namedExportsOrder,v as default};