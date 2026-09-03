import{j as s,ak as ke,aa as ye,a7 as ve,r as u}from"./iframe-CiA63uuc.js";import{c as R}from"./utils-DW-IJACk.js";import{I as Ne}from"./Icon-ChAy_Zq6.js";import{J as _e}from"./JsonView-CuM0h6Lr.js";import{a as we}from"./TestFailureDetail-CyZC1c1A.js";import{c as je}from"./adapter-C00kvcUQ.js";import{e as Te,h as Ve}from"./status-Diydho_V.js";import{T as Re}from"./TestRunner-CCBXVrFc.js";import"./preload-helper-DqldIB3Q.js";import"./LogViewer-sr0rIGh7.js";import"./SplitPane-DDH1XhF2.js";import"./TestTree-D9bmnNHq.js";import"./Tree-b58f5oGs.js";import"./TreeNode-Bssf1cx2.js";import"./TestTreeNode-BSVfBPCs.js";import"./Badge-C7FdoOOR.js";import"./index-CPURVhFy.js";import"./IconButton-CHbaJLVA.js";import"./frameworkIcon-C3Nbq_Di.js";import"./TestDetailPanel-CjSZ3CiJ.js";import"./button-ppGJePHl.js";import"./loading-X8NYIprp.js";import"./TabButton-vlnMqy6g.js";import"./TestRunSummary-Bp2yjO7E.js";import"./ProgressBar-EoJxPYRK.js";import"./TestFilterBar-vYrA0h2N.js";function be(e){return e.failed?"failed":e.passed?"passed":"pending"}const Ce={passed:{icon:ve,tone:"text-emerald-600"},failed:{icon:ye,tone:"text-red-600"},pending:{icon:ke,tone:"text-muted-foreground"}};function Se({item:e}){const{icon:t,tone:i}=Ce[be(e)];return s.jsxs("li",{className:"flex items-start gap-1.5 text-xs",children:[s.jsx(Ne,{icon:t,className:R("mt-0.5 shrink-0 text-sm",i)}),s.jsxs("span",{className:"min-w-0",children:[e.name,e.message?s.jsx("span",{className:"block text-[11px] text-muted-foreground",children:e.message}):null]})]})}function b({node:e}){const t=e.children&&e.children.length>0?e.children:[e];return s.jsx("div",{className:"space-y-2 p-density-4",children:s.jsx("ul",{className:"space-y-1",children:t.map((i,a)=>s.jsx(Se,{item:i},i.task_id??a))})})}function Ae(e){if(e&&typeof e=="object"&&!Array.isArray(e)){const t=e.cel_trace;if(typeof t=="string"&&t.length>0)return t}}function E(e,t){if(t!==void 0){if(e)return t;if(!(t!==null&&typeof t=="object"&&!Array.isArray(t)))return t}}function V(e){if(typeof e=="string")return e;try{return JSON.stringify(e)}catch{return String(e)}}function C({node:e}){if(e.passed)return null;const t=e.context,i=Object.entries((t==null?void 0:t.cel_vars)??{}),a=Ae(e.detail)||(t==null?void 0:t.cel_expression),r=!!a,c=E(r,t==null?void 0:t.expected),o=E(r,t==null?void 0:t.actual),m=c!==void 0||o!==void 0;return!a&&i.length===0&&!m?null:s.jsxs("div",{className:"space-y-1 rounded border border-border bg-muted/30 px-2 py-1.5",children:[a&&s.jsxs("div",{children:[s.jsx("span",{className:"text-[10px] uppercase text-muted-foreground",children:"expression"}),s.jsx("code",{className:"block overflow-x-auto whitespace-pre text-[11px]",children:a})]}),i.length>0&&s.jsx("table",{className:"w-full table-fixed text-[11px]",children:s.jsx("tbody",{children:i.map(([f,h])=>s.jsxs("tr",{className:"align-top",children:[s.jsx("td",{className:"w-1/3 truncate pr-2 font-medium text-muted-foreground",children:f}),s.jsx("td",{className:"break-words font-mono",children:V(h)})]},f))})}),c!==void 0&&s.jsxs("div",{className:"text-[11px]",children:[s.jsx("span",{className:"text-muted-foreground",children:"expected "}),s.jsx("span",{className:"font-mono",children:V(c)})]}),o!==void 0&&s.jsxs("div",{className:"text-[11px]",children:[s.jsx("span",{className:"text-muted-foreground",children:"actual "}),s.jsx("span",{className:"font-mono",children:V(o)})]})]})}function S({node:e}){const t=e.context,i=(t==null?void 0:t.command)??e.command,a=(t==null?void 0:t.cwd)??e.work_dir;return s.jsxs("div",{className:"space-y-4 p-density-4",children:[e.message&&s.jsx("p",{className:"whitespace-pre-wrap break-words text-sm",children:e.message}),i&&s.jsxs("div",{className:"min-w-0 space-y-1",children:[s.jsx("div",{className:"text-[10px] uppercase tracking-wide text-muted-foreground",children:"Command"}),s.jsx("code",{className:"block overflow-x-auto whitespace-pre rounded bg-muted px-2 py-1.5 text-xs",children:i}),s.jsxs("div",{className:"flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground",children:[a&&s.jsxs("span",{children:["in ",a]}),typeof(t==null?void 0:t.exit_code)=="number"&&s.jsxs("span",{className:t.exit_code===0?void 0:"text-red-600",children:["exit ",t.exit_code]})]})]}),s.jsx(we,{node:e}),s.jsx(C,{node:e}),e.detail!=null&&s.jsxs("div",{className:"space-y-1",children:[s.jsx("div",{className:"text-[10px] uppercase tracking-wide text-muted-foreground",children:"Detail"}),s.jsx(_e,{data:e.detail})]})]})}try{b.displayName="ChecklistDetail",b.__docgenInfo={description:`Renders every checklist item for the "Acceptance criteria" parent, or the
single item itself when a leaf criterion is selected directly.`,displayName:"ChecklistDetail",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/verification/adapterViews.tsx",methods:[],props:{node:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/verification/adapterViews.tsx",name:"TypeLiteral"}],description:"",name:"node",required:!0,tags:{},type:{name:"Test"}}},tags:{}}}catch{}try{C.displayName="CelDetails",C.__docgenInfo={description:"",displayName:"CelDetails",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/verification/adapterViews.tsx",methods:[],props:{node:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/verification/adapterViews.tsx",name:"TypeLiteral"}],description:"",name:"node",required:!0,tags:{},type:{name:"Test"}}},tags:{}}}catch{}try{S.displayName="FixtureDetail",S.__docgenInfo={description:"",displayName:"FixtureDetail",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/verification/adapterViews.tsx",methods:[],props:{node:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/verification/adapterViews.tsx",name:"TypeLiteral"}],description:"",name:"node",required:!0,tags:{},type:{name:"Test"}}},tags:{}}}catch{}function De(e){return e.framework==="checklist"}const Fe={id:"verification-checklist",match:De,renderDetail:({node:e})=>s.jsx(b,{node:e})};function Ie(e){return e.context!==void 0}const Le={id:"verification-fixture",match:Ie,renderDetail:({node:e})=>s.jsx(S,{node:e})};function A(){return je([Fe,Le])}try{A.displayName="verificationAdapters",A.__docgenInfo={description:"Default node adapters for VerificationResults: checklist items and\nfixture/CEL steps. Registration order matters only when a node could match\nboth — a checklist node never carries a `context`, so the two never race.",displayName:"verificationAdapters",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/verification/adapters.tsx",methods:[],props:{},tags:{}}}catch{}const ae="acceptance-criteria";function Ee(e){return typeof e=="number"&&Number.isFinite(e)?e:void 0}function Pe(e){return{Total:e.total,Passed:e.passed,Failed:e.failed,Warned:e.warned,Skipped:e.skipped,Pending:e.pending,Running:e.running,Duration:0}}function re(e){const t={name:e.name};e.framework!==void 0&&(t.framework=e.framework),e.task_id!==void 0&&(t.task_id=e.task_id),e.file!==void 0&&(t.file=e.file),e.line!==void 0&&(t.line=e.line),e.message!==void 0&&(t.message=e.message),e.command!==void 0&&(t.command=e.command),e.work_dir!==void 0&&(t.work_dir=e.work_dir),e.stdout!==void 0&&(t.stdout=e.stdout),e.stderr!==void 0&&(t.stderr=e.stderr);const i=Ee(e.duration);return i!==void 0&&(t.duration=i),e.passed!==void 0&&(t.passed=e.passed),e.failed!==void 0&&(t.failed=e.failed),e.warned!==void 0&&(t.warned=e.warned),e.skipped!==void 0&&(t.skipped=e.skipped),e.pending!==void 0&&(t.pending=e.pending),e.running!==void 0&&(t.running=e.running),e.timed_out!==void 0&&(t.timed_out=e.timed_out),e.progress!==void 0&&(t.progress=e.progress),e.context!==void 0&&(t.context=e.context),e.detail!==void 0&&(t.detail=e.detail),e.summary!==void 0?t.summary=Pe(e.summary):e.children!==void 0&&(t.children=e.children.map(re)),t}function qe(e,t){const i={name:e.item||`Criterion ${t+1}`,framework:"checklist",task_id:`${ae}:${t}`,passed:e.passed===!0,failed:e.passed===!1,pending:e.passed!==!0&&e.passed!==!1,detail:e};return e.message!==void 0&&(i.message=e.message),i}function We(e){if(e.length===0)return null;const t=e.map(qe);return{name:"Acceptance criteria",framework:"checklist",task_id:ae,children:t}}function Ke(e){const t=(e.tests??[]).map(re),i=We(e.checklist??[]);return i?[...t,i]:t}const Ue=A();function ne(e){return e.task_id??e.name}function ce(e,t){for(const i of e){if(ne(i)===t)return i;if(i.children){const a=ce(i.children,t);if(a)return a}}return null}function n({report:e,done:t,title:i=null,className:a,adapters:r=Ue,emptyText:c="No verification has run yet",selected:o,onSelect:m,filters:f,onFiltersChange:h}){const d=u.useMemo(()=>e?Ke(e):[],[e]),[j,oe]=u.useState(null),[de,le]=u.useState(()=>Te()),[ue,pe]=u.useState(null),D=f!==void 0,x=D?f:de,me=l=>{D?h==null||h(l):le(l)},F=o!==void 0,fe=u.useMemo(()=>j?ce(d,j):null,[d,j]),he=F?o:fe,xe=l=>{F?m==null||m(l):oe(l?ne(l):null)},ge=u.useMemo(()=>Ve(d,x.status,x.framework),[d,x]),I=e!=null&&e.started_at?Date.parse(e.started_at):void 0,L=e!=null&&e.finished_at?Date.parse(e.finished_at):void 0,T=e&&(e.reason||e.feedback)?s.jsxs("div",{className:"shrink-0 space-y-2 border-b border-border px-3 py-2",children:[e.reason&&s.jsx("p",{className:"text-xs text-foreground",children:e.reason}),e.feedback&&s.jsx("pre",{className:"max-h-40 overflow-auto whitespace-pre-wrap rounded bg-muted p-2 font-mono text-[11px]",children:e.feedback})]}):null;return!e||d.length===0?s.jsxs("div",{className:R("flex flex-col",a),children:[T,!T&&s.jsx("p",{className:"px-3 py-4 text-xs text-muted-foreground",children:c})]}):s.jsxs("div",{className:R("flex h-[30rem] min-h-80 flex-col",a),children:[T,s.jsx(Re,{className:"min-h-0 flex-1",tests:ge,allTests:d,selected:he,filters:x,expandAll:ue,done:t??e.state!=="running",status:{running:e.state==="running"},...e.state==="running"?{statusText:"Running verification…"}:{},...I!==void 0?{startTime:I}:{},...L!==void 0?{endTime:L}:{},title:i,adapters:r,onSelect:xe,onFiltersChange:me,onExpandAllChange:pe})]})}try{n.displayName="VerificationResults",n.__docgenInfo={description:"",displayName:"VerificationResults",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/verification/VerificationResults.tsx",methods:[],props:{report:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/verification/VerificationResults.tsx",name:"TypeLiteral"}],description:"",name:"report",required:!0,tags:{},type:{name:"VerifyReport | null"}},done:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/verification/VerificationResults.tsx",name:"TypeLiteral"}],description:'Overrides the run-complete state. Defaults to `report.state !== "running"`.',name:"done",required:!1,tags:{},type:{name:"boolean"}},title:{defaultValue:{value:"null"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/verification/VerificationResults.tsx",name:"TypeLiteral"}],description:"Header title, passed through to TestRunner. Defaults to no title.",name:"title",required:!1,tags:{},type:{name:"ReactNode"}},className:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/verification/VerificationResults.tsx",name:"TypeLiteral"}],description:"",name:"className",required:!1,tags:{},type:{name:"string"}},adapters:{defaultValue:{value:"verificationAdapters()"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/verification/VerificationResults.tsx",name:"TypeLiteral"}],description:"",name:"adapters",required:!1,tags:{},type:{name:"TestNodeAdapterRegistry"}},emptyText:{defaultValue:{value:"No verification has run yet"},declarations:[{fileName:"clicky-ui/packages/ui/src/data/verification/VerificationResults.tsx",name:"TypeLiteral"}],description:"",name:"emptyText",required:!1,tags:{},type:{name:"string"}},selected:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/verification/VerificationResults.tsx",name:"TypeLiteral"}],description:`Controlled selection — omit to let the component own selection state
(keyed by a stable task_id/name so the same row stays selected across a
re-created report of the same shape, e.g. after a live-update refresh).
Pass both this and \`onSelect\` for a host that persists selection at the
route level.`,name:"selected",required:!1,tags:{},type:{name:"Test | null"}},onSelect:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/verification/VerificationResults.tsx",name:"TypeLiteral"}],description:"",name:"onSelect",required:!1,tags:{},type:{name:"(node: Test | null) => void"}},filters:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/verification/VerificationResults.tsx",name:"TypeLiteral"}],description:"Controlled status/framework filters — omit to let the component own filter state.",name:"filters",required:!1,tags:{},type:{name:"TestFilters"}},onFiltersChange:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/data/verification/VerificationResults.tsx",name:"TypeLiteral"}],description:"",name:"onFiltersChange",required:!1,tags:{},type:{name:"(next: TestFilters) => void"}}},tags:{}}}catch{}function Je(){return{total:0,passed:0,failed:0,warned:0,skipped:0,pending:0,running:0,timedout:0}}function Me(e){return e.failed?"failed":e.timed_out?"timedout":e.warned?"warned":e.skipped?"skipped":e.running?"running":e.pending?"pending":e.passed?"passed":null}function $e(e,t){e.total+=t.total,e.passed+=t.passed,e.failed+=t.failed,e.warned+=t.warned,e.skipped+=t.skipped,e.pending+=t.pending,e.running+=t.running,e.timedout+=t.timedout}function Be(e){const t=Je(),i=a=>{for(const r of a){if(r.summary){$e(t,r.summary);continue}if(r.children&&r.children.length>0){i(r.children);continue}const c=Me(r);c!==null&&(t[c]+=1,t.total+=1)}};return i(e),t}const kt={title:"Data/Verification",component:n,parameters:{layout:"fullscreen",docs:{description:{component:"Renders a captain VerifyReport through the shared TestRunner, so the captain webapp and gavel pr/ui can drop it in without forking. Props-only — no data fetching or routing."}}}};function p(e){const t=e.state??"passed",i=e.tests??[];return{kind:"fixture",ran:!0,passed:t==="passed",summary:Be(i),state:t,...e}}const g={render:()=>s.jsx("div",{className:"h-screen",children:s.jsx(n,{report:p({tests:[{name:"lint the repo",framework:"fixture",passed:!0,duration:82e7},{name:"run unit tests",framework:"fixture",passed:!0,duration:41e8}],checklist:[{item:"docs updated",passed:!0}]})})})},k={render:()=>s.jsx("div",{className:"h-screen",children:s.jsx(n,{report:p({passed:!1,state:"failed",reason:"1 of 2 checks failed",tests:[{name:"lint the repo",framework:"fixture",passed:!0,duration:82e7},{name:"assert no regressions",framework:"fixture",failed:!0,duration:125e7,context:{cel_expression:"results.failed == 0",cel_vars:{failed:2,suite:"todos"},expected:0,actual:2}}]})})})},y={render:()=>s.jsx("div",{className:"h-screen",children:s.jsx(n,{report:p({state:"running",tests:[{name:"compile the fixture",framework:"fixture",running:!0,progress:{phase:"build",done:3,total:10}}]})})})},v={render:()=>s.jsx("div",{className:"h-screen",children:s.jsx(n,{report:p({passed:!1,state:"failed",checklist:[{item:"readme updated",passed:!0},{item:"changelog entry added",passed:!1,message:"missing entry for this change"},{item:"reviewed by a teammate",passed:null}]})})})},N={render:()=>s.jsx("div",{className:"h-screen",children:s.jsx(n,{report:p({kind:"cmd",state:"failed",reason:"1 of 2 checks failed",feedback:`checking config...
FAIL: missing field 'name'`})})})},_={render:()=>s.jsx("div",{className:"h-screen",children:s.jsx(n,{report:p({kind:"cmd",state:"errored",reason:"verifier crashed: exit status 1"})})})},w={render:()=>s.jsx("div",{className:"h-screen",children:s.jsx(n,{report:null})})};var P,q,W;g.parameters={...g.parameters,docs:{...(P=g.parameters)==null?void 0:P.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <VerificationResults report={report({
      tests: [{
        name: "lint the repo",
        framework: "fixture",
        passed: true,
        duration: 820_000_000
      }, {
        name: "run unit tests",
        framework: "fixture",
        passed: true,
        duration: 4_100_000_000
      }],
      checklist: [{
        item: "docs updated",
        passed: true
      }]
    })} />
    </div>
}`,...(W=(q=g.parameters)==null?void 0:q.docs)==null?void 0:W.source}}};var K,U,J;k.parameters={...k.parameters,docs:{...(K=k.parameters)==null?void 0:K.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <VerificationResults report={report({
      passed: false,
      state: "failed",
      reason: "1 of 2 checks failed",
      tests: [{
        name: "lint the repo",
        framework: "fixture",
        passed: true,
        duration: 820_000_000
      }, {
        name: "assert no regressions",
        framework: "fixture",
        failed: true,
        duration: 1_250_000_000,
        context: {
          cel_expression: "results.failed == 0",
          cel_vars: {
            failed: 2,
            suite: "todos"
          },
          expected: 0,
          actual: 2
        }
      }]
    })} />
    </div>
}`,...(J=(U=k.parameters)==null?void 0:U.docs)==null?void 0:J.source}}};var M,$,B;y.parameters={...y.parameters,docs:{...(M=y.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <VerificationResults report={report({
      state: "running",
      tests: [{
        name: "compile the fixture",
        framework: "fixture",
        running: true,
        progress: {
          phase: "build",
          done: 3,
          total: 10
        }
      }]
    })} />
    </div>
}`,...(B=($=y.parameters)==null?void 0:$.docs)==null?void 0:B.source}}};var H,z,G;v.parameters={...v.parameters,docs:{...(H=v.parameters)==null?void 0:H.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <VerificationResults report={report({
      passed: false,
      state: "failed",
      checklist: [{
        item: "readme updated",
        passed: true
      }, {
        item: "changelog entry added",
        passed: false,
        message: "missing entry for this change"
      }, {
        item: "reviewed by a teammate",
        passed: null
      }]
    })} />
    </div>
}`,...(G=(z=v.parameters)==null?void 0:z.docs)==null?void 0:G.source}}};var O,Q,X;N.parameters={...N.parameters,docs:{...(O=N.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <VerificationResults report={report({
      kind: "cmd",
      state: "failed",
      reason: "1 of 2 checks failed",
      feedback: "checking config...\\nFAIL: missing field 'name'"
    })} />
    </div>
}`,...(X=(Q=N.parameters)==null?void 0:Q.docs)==null?void 0:X.source}}};var Y,Z,ee;_.parameters={..._.parameters,docs:{...(Y=_.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <VerificationResults report={report({
      kind: "cmd",
      state: "errored",
      reason: "verifier crashed: exit status 1"
    })} />
    </div>
}`,...(ee=(Z=_.parameters)==null?void 0:Z.docs)==null?void 0:ee.source}}};var te,se,ie;w.parameters={...w.parameters,docs:{...(te=w.parameters)==null?void 0:te.docs,source:{originalSource:`{
  render: () => <div className="h-screen">
      <VerificationResults report={null} />
    </div>
}`,...(ie=(se=w.parameters)==null?void 0:se.docs)==null?void 0:ie.source}}};const yt=["Passing","FailingWithCel","RunningWithProgress","ChecklistOnly","CmdFeedback","ErroredWithNoTests","Empty"];export{v as ChecklistOnly,N as CmdFeedback,w as Empty,_ as ErroredWithNoTests,k as FailingWithCel,g as Passing,y as RunningWithProgress,yt as __namedExportsOrder,kt as default};
