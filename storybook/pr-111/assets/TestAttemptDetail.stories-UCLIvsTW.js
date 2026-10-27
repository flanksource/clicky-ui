import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{T as r}from"./MarkIcons-Bgbp8W1d.js";import{a as i,n as a,o,t as s}from"./context-mgpTUgnY.js";import{a as c,i as l,n as u,o as d,r as f,t as p}from"./TestDetailPanel-BC0uEUba.js";function m(){let[e,t]=(0,h.useState)(k);return(0,g.jsx)(s,{value:{tests:[k],selected:e,done:!0,filters:r(),expandAll:null,busy:{},adapters:i(),onSelect:t,onFiltersChange:()=>{},onExpandAllChange:()=>{}},children:(0,g.jsx)(`div`,{className:`h-[560px] w-[760px] overflow-hidden rounded-md border border-border`,children:(0,g.jsx)(p,{})})})}var h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{h=t(),l(),u(),a(),o(),d(),g=n(),{expect:_,within:v}=__STORYBOOK_MODULE_TEST__,y=`goroutine 7 [chan receive, 30 minutes]:
billing.(*Gateway).await(0xc0001b2000)
	/app/billing/gateway.go:118 +0xa5
created by billing.NewGateway
	/app/billing/gateway.go:58 +0xe0

goroutine 12 [select]:
net/http.(*persistConn).readLoop(0xc000200000)
	/usr/local/go1.22/src/net/http/transport.go:2200 +0x1d1
`,b={sequence:1,passed:!0,pid:4242,cpu_percent:37.5,rss:157286400,duration:125e7,exit_code:0},x={title:`Data/TestRunner/TestAttemptDetail`,component:f,tags:[`autodocs`],parameters:{docs:{description:{component:"What one attempt of a test measured: pid, CPU, RSS, open files, duration, exit code and goroutine count as metric tiles, polled live every two seconds while the attempt runs (`fetchProcessMetrics`, stopping when it finishes or the process is gone), and the timeout stack trace as goroutine cards. A pid shared by a `go test` batch is labelled."}}},decorators:[e=>(0,g.jsx)(`div`,{className:`max-w-2xl`,children:(0,g.jsx)(e,{})})],args:{attempt:b}},S={play:async({canvasElement:e})=>{await _(v(e).getByText(`4242`)).toBeInTheDocument()}},C={args:{attempt:{...b,shared_process:!0}}},w={args:{attempt:{sequence:1,passed:!0}}},T={args:{attempt:{sequence:1,timed_out:!0,pid:4300,cpu_percent:.2,rss:67108864,goroutine_count:2,exit_code:2,duration:3e10,stack_trace:y}}},E=10,D={args:{attempt:{sequence:2,pid:4400,cpu_percent:1,rss:8388608},fetchProcessMetrics:async e=>(E=(E+17)%100,{pid:e,cpu_percent:E,rss:(8+E)*1024*1024,open_files:12})}},O={args:{attempt:{sequence:2,pid:4400,cpu_percent:1,rss:8388608},fetchProcessMetrics:async e=>{throw new c(e)}}},k={name:`charges a card on checkout`,framework:`ginkgo`,route_path:`billing/charge`,failed:!0,message:`gateway timed out`,attempts:[{sequence:1,failed:!0,message:`card declined`,pid:4201,cpu_percent:12,rss:41943040,duration:11e8,exit_code:1},{sequence:2,run_kind:`rerun`,timed_out:!0,message:`gateway timed out`,pid:4202,cpu_percent:.3,rss:67108864,goroutine_count:2,duration:3e10,stack_trace:y}]},A={render:()=>(0,g.jsx)(m,{}),decorators:[]},j=[`Finished`,`SharedByBatch`,`NoMetrics`,`TimedOutWithGoroutines`,`LivePolling`,`LiveProcessExited`,`AttemptChooser`],S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("4242")).toBeInTheDocument();
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    attempt: {
      ...FINISHED,
      shared_process: true
    }
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    attempt: {
      sequence: 1,
      passed: true
    }
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => <ChooserHarness />,
  decorators: []
}`,...A.parameters?.docs?.source},description:{story:`A test that ran twice: the header chooser picks the attempt and the body follows it.`,...A.parameters?.docs?.description}}}})))()}M();export{A as AttemptChooser,S as Finished,D as LivePolling,O as LiveProcessExited,w as NoMetrics,C as SharedByBatch,T as TimedOutWithGoroutines,j as __namedExportsOrder,x as default};