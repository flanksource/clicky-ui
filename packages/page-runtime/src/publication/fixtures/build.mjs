if (process.argv[2] === "interrupt") process.kill(process.pid, "SIGTERM");
else process.exitCode = 17;
