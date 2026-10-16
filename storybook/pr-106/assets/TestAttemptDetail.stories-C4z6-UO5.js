import{j as t,r as M}from"./iframe-BUpmsD4_.js";import{a as L,P as R,T as G}from"./TestDetailPanel-CM5yh9cS.js";import{T as I,c as H}from"./context-CbxsXGk1.js";import{j as K}from"./MarkIcons-CfCn3kEp.js";import"./preload-helper-PGaPgbNH.js";import"./Icon-DTAROQQs.js";import"./utils-DW-IJACk.js";import"./button-C45Fp5VT.js";import"./index-CPURVhFy.js";import"./loading-BVCwDMQn.js";import"./select-CBErET8H.js";import"./SplitButton-z2Xctce4.js";import"./DropdownMenu-LyJi-wEU.js";import"./floating-ui.react-Ct-n3Sdx.js";import"./index-D9pyqf52.js";import"./index-CsPwRm8U.js";import"./DropdownMenuSubmenu-06pkj9qc.js";import"./modalStack-Gk9S97tn.js";import"./zIndex-BGbNBNA8.js";import"./clipboard-CryKTeQj.js";import"./JsonView-B4Nw9Fl0.js";import"./AccordionList-BTEWzV6y.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-CU99F48u.js";import"./badge-variants-BNgEarpT.js";import"./TabButton-DQklQpgZ.js";import"./TestFailureDetail-BrvB66d8.js";import"./LogViewer-CEwue8JF.js";import"./AnsiHtml-D5usPwhf.js";import"./StackDumpView-Bt2PqYit.js";import"./frame-heuristics-D62qKi0n.js";import"./JvmStackTrace-B8te7UN1.js";import"./StackFrameRow-C5aLaa6B.js";import"./FrameSourceWindow-CS1fR05x.js";import"./code-highlight-B84SNtUw.js";import"./HighlightedTokens-wwLksTd_.js";import"./format-2niohfpq.js";import"./MetricTile-Ci2m0b6I.js";import"./metric-tone-UjdEBFmO.js";const{expect:W,within:U}=__STORYBOOK_MODULE_TEST__,F=`goroutine 7 [chan receive, 30 minutes]:
billing.(*Gateway).await(0xc0001b2000)
	/app/billing/gateway.go:118 +0xa5
created by billing.NewGateway
	/app/billing/gateway.go:58 +0xe0

goroutine 12 [select]:
net/http.(*persistConn).readLoop(0xc000200000)
	/usr/local/go1.22/src/net/http/transport.go:2200 +0x1d1
`,N={sequence:1,passed:!0,pid:4242,cpu_percent:37.5,rss:150*1024*1024,duration:125e7,exit_code:0},De={title:"Data/TestRunner/TestAttemptDetail",component:L,tags:["autodocs"],parameters:{docs:{description:{component:"What one attempt of a test measured: pid, CPU, RSS, open files, duration, exit code and goroutine count as metric tiles, polled live every two seconds while the attempt runs (`fetchProcessMetrics`, stopping when it finishes or the process is gone), and the timeout stack trace as goroutine cards. A pid shared by a `go test` batch is labelled."}}},decorators:[e=>t.jsx("div",{className:"max-w-2xl",children:t.jsx(e,{})})],args:{attempt:N}},s={play:async({canvasElement:e})=>{await W(U(e).getByText("4242")).toBeInTheDocument()}},o={args:{attempt:{...N,shared_process:!0}}},n={args:{attempt:{sequence:1,passed:!0}}},a={args:{attempt:{sequence:1,timed_out:!0,pid:4300,cpu_percent:.2,rss:64*1024*1024,goroutine_count:2,exit_code:2,duration:3e10,stack_trace:F}}};let c=10;const i={args:{attempt:{sequence:2,pid:4400,cpu_percent:1,rss:8*1024*1024},fetchProcessMetrics:async e=>(c=(c+17)%100,{pid:e,cpu_percent:c,rss:(8+c)*1024*1024,open_files:12})}},p={args:{attempt:{sequence:2,pid:4400,cpu_percent:1,rss:8*1024*1024},fetchProcessMetrics:async e=>{throw new R(e)}}},d={name:"charges a card on checkout",framework:"ginkgo",route_path:"billing/charge",failed:!0,message:"gateway timed out",attempts:[{sequence:1,failed:!0,message:"card declined",pid:4201,cpu_percent:12,rss:40*1024*1024,duration:11e8,exit_code:1},{sequence:2,run_kind:"rerun",timed_out:!0,message:"gateway timed out",pid:4202,cpu_percent:.3,rss:64*1024*1024,goroutine_count:2,duration:3e10,stack_trace:F}]};function Y(){const[e,O]=M.useState(d);return t.jsx(I,{value:{tests:[d],selected:e,done:!0,filters:K(),expandAll:null,busy:{},adapters:H(),onSelect:O,onFiltersChange:()=>{},onExpandAllChange:()=>{}},children:t.jsx("div",{className:"h-[560px] w-[760px] overflow-hidden rounded-md border border-border",children:t.jsx(G,{})})})}const r={render:()=>t.jsx(Y,{}),decorators:[]};var m,u,l;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("4242")).toBeInTheDocument();
  }
}`,...(l=(u=s.parameters)==null?void 0:u.docs)==null?void 0:l.source}}};var g,h,_;o.parameters={...o.parameters,docs:{...(g=o.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    attempt: {
      ...FINISHED,
      shared_process: true
    }
  }
}`,...(_=(h=o.parameters)==null?void 0:h.docs)==null?void 0:_.source}}};var x,y,w;n.parameters={...n.parameters,docs:{...(x=n.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    attempt: {
      sequence: 1,
      passed: true
    }
  }
}`,...(w=(y=n.parameters)==null?void 0:y.docs)==null?void 0:w.source}}};var f,S,T;a.parameters={...a.parameters,docs:{...(f=a.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    attempt: {
      sequence: 1,
      timed_out: true,
      pid: 4300,
      cpu_percent: 0.2,
      rss: 64 * 1024 * 1024,
      goroutine_count: 2,
      exit_code: 2,
      duration: 30e9,
      stack_trace: GO_STACK
    }
  }
}`,...(T=(S=a.parameters)==null?void 0:S.docs)==null?void 0:T.source}}};var b,P,v;i.parameters={...i.parameters,docs:{...(b=i.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    attempt: {
      sequence: 2,
      pid: 4400,
      cpu_percent: 1,
      rss: 8 * 1024 * 1024
    },
    fetchProcessMetrics: async pid => {
      reading = (reading + 17) % 100;
      return {
        pid,
        cpu_percent: reading,
        rss: (8 + reading) * 1024 * 1024,
        open_files: 12
      };
    }
  }
}`,...(v=(P=i.parameters)==null?void 0:P.docs)==null?void 0:v.source}}};var E,q,A;p.parameters={...p.parameters,docs:{...(E=p.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    attempt: {
      sequence: 2,
      pid: 4400,
      cpu_percent: 1,
      rss: 8 * 1024 * 1024
    },
    fetchProcessMetrics: async pid => {
      throw new ProcessNotFoundError(pid);
    }
  }
}`,...(A=(q=p.parameters)==null?void 0:q.docs)==null?void 0:A.source}}};var C,j,k,B,D;r.parameters={...r.parameters,docs:{...(C=r.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => <ChooserHarness />,
  decorators: []
}`,...(k=(j=r.parameters)==null?void 0:j.docs)==null?void 0:k.source},description:{story:"A test that ran twice: the header chooser picks the attempt and the body follows it.",...(D=(B=r.parameters)==null?void 0:B.docs)==null?void 0:D.description}}};const Fe=["Finished","SharedByBatch","NoMetrics","TimedOutWithGoroutines","LivePolling","LiveProcessExited","AttemptChooser"];export{r as AttemptChooser,s as Finished,i as LivePolling,p as LiveProcessExited,n as NoMetrics,o as SharedByBatch,a as TimedOutWithGoroutines,Fe as __namedExportsOrder,De as default};
