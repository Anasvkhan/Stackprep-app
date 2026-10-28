module.exports = {
  slug: 'linux',
  title: 'Linux & Shell',
  subtitle: 'Commands, processes, permissions',
  description: 'Linux interview questions for developers and DevOps: file system, permissions, processes, networking commands, logs, shell scripting and troubleshooting.',
  category: 'devops',
  roles: ['backend', 'devops', 'software-engineer', 'fullstack'],
  icon: 'terminal',
  color: '#FCC624',
  order: 51,
  topics: [
    {
      slug: 'files-permissions',
      title: 'Files & Permissions',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'Explain Linux file permissions and chmod 755.',
          e: `
Each file has permissions for **user (owner)**, **group** and **others**: read (r=4), write (w=2), execute (x=1).

\`-rwxr-xr-x\` = **755**
- owner: rwx = 4+2+1 = 7
- group: r-x = 4+1 = 5
- others: r-x = 5

~~~bash
chmod 644 config.yml     # rw-r--r--
chmod +x deploy.sh       # add execute
chown appuser:appgroup file
~~~
For directories, \`x\` means you can enter (cd) the directory.`,
        },
        {
          t: 'mcq', l: 1,
          q: 'Which command finds all .log files larger than 100 MB under /var?',
          o: ['find /var -name "*.log" -size +100M', 'ls -R /var | grep log | sort -h', 'grep -r "*.log" /var --size +100M', 'locate --big --min 100M .log'],
          a: 0,
          e: 'find supports name, size, mtime, type filters and -exec for actions.',
        },
        {
          t: 'mcq', l: 1,
          q: 'Which command shows disk usage of filesystems in human-readable form?',
          o: ['free -h', 'du -sh', 'df -h', 'top'],
          a: 2,
          e: 'df -h = free space per filesystem; du -sh dir = size of a directory; free -h = memory.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is the difference between a hard link and a symbolic (soft) link?',
          o: ['Hard links work across filesystems, while symlinks only work on one disk', 'A symlink copies the file\'s data to a new inode, while a hard link only stores the target path', 'There is no difference; both are just aliases for the same file path', 'A hard link points to the same inode; a symlink points to a path and can break'],
          a: 3,
          e: 'ln file hardlink; ln -s target symlink. Hard links cannot span filesystems or link directories.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Disk is full but du shows little usage. What is a common cause?',
          o: ['Faulty RAM that makes the filesystem report the wrong free space', 'Too many empty directories and small files that each reserve a full block of disk space', 'A deleted file still held open by a process; check with lsof | grep deleted', 'Wrong permissions on some folders, so du cannot count them'],
          a: 2,
          e: 'Space is freed only when the process closes the file. Restart the process or truncate via /proc/<pid>/fd.',
        },
      ],
    },
    {
      slug: 'processes',
      title: 'Processes & System',
      questions: [
        {
          t: 'qa', l: 1,
          q: 'How do you find and kill a process using port 3000?',
          e: `
~~~bash
sudo lsof -i :3000          # or: ss -ltnp | grep 3000
kill <PID>                  # SIGTERM – graceful
kill -9 <PID>               # SIGKILL – force, last resort
pkill -f "node server.js"
~~~
SIGTERM lets the app clean up (close connections); SIGKILL cannot be caught.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What does the load average in top/uptime represent?',
          o: ['Average number of processes running or waiting over 1, 5 and 15 minutes', 'The CPU temperature averaged over the last 1, 5 and 15 minutes', 'The percentage of memory in use averaged over the last 15 minutes', 'The average network traffic per second in the last 1, 5 and 15 minutes'],
          a: 0,
          e: 'Compare it to the number of CPU cores: load of 8 on a 4-core machine means work is queuing.',
        },
        {
          t: 'mcq', l: 2,
          q: 'What is a zombie process?',
          o: ['A hidden malware process that restarts itself after being killed by the user', 'A process that exited but whose parent has not yet read its exit status', 'A process stuck using 100% of a CPU core that cannot be killed', 'A process in sleep state waiting for disk I/O to complete'],
          a: 1,
          e: 'Zombies use no resources except a PID entry. Fix the parent or kill it so init adopts and reaps the children. In containers, use a proper init (tini, --init).',
        },
        {
          t: 'qa', l: 2,
          q: 'How do you manage a service with systemd?',
          e: `
~~~bash
sudo systemctl start|stop|restart myapp
sudo systemctl enable myapp       # start at boot
systemctl status myapp
journalctl -u myapp -f            # follow logs
~~~
Unit file \`/etc/systemd/system/myapp.service\`:
~~~ini
[Unit]
Description=My Node API
After=network.target

[Service]
User=app
WorkingDirectory=/opt/myapp
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
~~~`,
        },
      ],
    },
    {
      slug: 'networking-troubleshooting',
      title: 'Networking, Logs & Troubleshooting',
      questions: [
        {
          t: 'mcq', l: 1,
          q: 'Which command follows a log file in real time?',
          o: ['tail -f app.log', 'less app.log', 'cat -f app.log', 'head -f app.log'],
          a: 0,
          e: 'tail -n 100 -f shows the last 100 lines and keeps streaming new ones.',
        },
        {
          t: 'mcq', l: 2,
          q: 'Which command counts the top 10 IPs in an nginx access log?',
          o: ['grep -oE \'[0-9.]+\' access.log | wc -l | sort -rn | uniq | head', 'cat access.log | top -n 10 | uniq -c', 'ls access.log | uniq -c | head -10', 'awk \'{print $1}\' access.log | sort | uniq -c | sort -rn | head'],
          a: 3,
          e: 'awk extracts the first column (IP), sort + uniq -c counts, sort -rn orders by count, head shows the top 10.',
        },
        {
          t: 'qa', l: 2,
          q: 'Which commands do you use to troubleshoot network connectivity to a service?',
          e: `
- \`ping host\` – basic reachability (ICMP may be blocked)
- \`dig / nslookup host\` – DNS resolution
- \`curl -v https://host/health\` – HTTP request with TLS/headers details
- \`telnet host 5432\` / \`nc -zv host 5432\` – is the TCP port open?
- \`traceroute / mtr host\` – path and where packets drop
- \`ss -tulpn\` / \`netstat\` – listening ports and connections
- \`ip addr\`, \`ip route\` – interfaces and routes
- \`tcpdump -i eth0 port 443\` – capture packets
- Check firewalls/security groups (\`iptables\`, \`ufw\`, cloud SGs).`,
        },
        {
          t: 'scenario', l: 3,
          q: 'Scenario: A production server is very slow. Walk through how you investigate.',
          e: `
1. **uptime / top / htop:** load average vs cores, CPU hogs, %wa (I/O wait), steal time (VM).
2. **Memory:** \`free -h\`, \`vmstat 1\` – swapping? OOM killer messages in \`dmesg\`.
3. **Disk:** \`df -h\` (full?), \`iostat -x 1\` (high util/await), \`iotop\`.
4. **Network:** \`ss -s\` (connection counts), \`iftop\`, errors with \`ip -s link\`.
5. **Processes:** identify the offending process; \`strace -p\` / \`perf top\` for what it is doing.
6. **Logs:** \`journalctl\`, application logs, \`/var/log/syslog\`.
7. **Recent changes:** deploys, cron jobs, traffic spikes.
Then mitigate (restart, scale out, kill runaway job) and fix the root cause.`,
        },
        {
          t: 'mcq', l: 2,
          q: 'What does "set -euo pipefail" do at the top of a bash script?',
          o: ['Makes the script executable and sets the default interpreter', 'Exit on errors, error on unset variables, and fail pipelines if any command fails', 'Runs the script in the background and ignores hangup signals', 'Enables colored output, verbose logging for every command, and aliases from your profile'],
          a: 1,
          e: 'It makes scripts fail fast instead of continuing silently after an error – important in CI/CD scripts.',
        },
      ],
    },
  ],
};
