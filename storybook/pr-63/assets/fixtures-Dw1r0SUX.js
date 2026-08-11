const e=`goroutine 1 [running]:
main.main()
	/home/user/go/src/app/main.go:42 +0x1a2
runtime.main()
	runtime/proc.go:250 +0x204

goroutine 17 [chan receive, 2 minutes]:
app/server.(*Server).serve(0xc0001b2000)
	/home/user/go/src/app/server/server.go:118 +0xa5
created by app/server.New
	/home/user/go/src/app/server/server.go:58 +0xe0

goroutine 22 [select]:
database/sql.(*DB).connectionOpener(0xc000110000, {0xabcd, 0xc0000aa0c0})
	database/sql/sql.go:1196 +0x88
created by database/sql.OpenDB
	database/sql/sql.go:791 +0x158

goroutine 100 [syscall]:
syscall.Syscall(0x7, 0x0, 0x0, 0x0)
	syscall/asm_linux_amd64.s:20 +0x4
`,s={pid:1,name:"clicky-api",command:"/usr/local/bin/clicky-api --config /etc/clicky/config.yaml",status:"running",cpu_percent:12.4,rss:256901120,vms:566231040,open_files:34,is_root:!0,stack_capture:{status:"ready",text:e,collected_at:new Date().toISOString()},children:[{pid:42,ppid:1,name:"worker",command:"worker --queue default",status:"sleeping",cpu_percent:3.1,rss:92274688,vms:188743680,open_files:12,children:[{pid:123,ppid:42,name:"child",command:"child --id 1",status:"running",cpu_percent:.5,rss:14680064}]},{pid:88,ppid:1,name:"zombie-pid",status:"zombie",cpu_percent:0,rss:0}]};export{s};
