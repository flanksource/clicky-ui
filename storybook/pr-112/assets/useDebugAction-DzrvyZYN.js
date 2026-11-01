import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{Es as n,n as r}from"./icons-Dd_HwYAK.js";import{a as i,i as a,n as o,o as s}from"./debugConsoleSignal-C4KHYoUZ.js";function c(){let e=(0,l.useSyncExternalStore)(s,o,()=>!1);return(0,l.useMemo)(()=>e?{id:`show-query`,label:`Debug`,icon:n,section:``,onSelect:()=>i({tab:`queries`})}:void 0,[e])}var l;function u(){return(u=e((()=>{l=t(),r(),a();try{c.displayName=`useDebugAction`,c.__docgenInfo={description:`Puts "Debug" in a result table's overflow menu.

It reveals the console rather than opening a dialog. The dialog it replaces
had to *re-run the query* to say what it ran, so what you inspected was never
the execution you were looking at — and it closed the moment you changed a
filter, which is precisely when you wanted to compare two runs. The console
already holds the record for the run that happened.

The action is absent when no console is mounted. A menu item that silently
does nothing reads as broken; an absent one reads as a feature this app does
not have, which is the truth.`,displayName:`useDebugAction`,filePath:`/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/useDebugAction.tsx`,methods:[],props:{},tags:{}}}catch{}})))()}export{c as n,u as t};