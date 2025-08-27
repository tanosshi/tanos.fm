/** @file ipBlocker.js
 * @description Block dangerous IPs
 */

const fs = require("fs");
const https = require("https");
const ipRangeCheck = require("ip-range-check");

const IP_LIST_URL = process.env.BLACKLISTED_IPS;
const IP_LIST_PATH = "./ip-list.txt";

let blockedIPs = [];
const ipCache = new Map();

function downloadIPList(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(
            new Error(`Failed to download file: Status ${res.statusCode}`)
          );
          return;
        }
        res.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", (err) => {
        fs.unlink(dest, () => reject(err));
      });
  });
}

var x = 0;
async function loadBlockedIPs() {
  if (x > 0) return;
  x++;

  console.log(
    "First time loading after restart will take a couple seconds, please wait"
  );
  if (!fs.existsSync(IP_LIST_PATH)) {
    try {
      await downloadIPList(IP_LIST_URL, IP_LIST_PATH);
    } catch (err) {
      return;
    }
  }

  const data = fs.readFileSync(IP_LIST_PATH, "utf-8");
  blockedIPs = data
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  console.log(`Loaded ${blockedIPs.length} blocked IPs/ranges`);
}

async function ipBlocker(req, res, next) {
  if (blockedIPs.length === 0) {
    await loadBlockedIPs();
  }

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  if (ipCache.has(ip)) {
    if (ipCache.get(ip)) {
      return res.status(403).send("access blocked");
    } else {
      return next();
    }
  }

  const blocked = ipRangeCheck(ip, blockedIPs);

  ipCache.set(ip, blocked);

  if (blocked) {
    return res.status(403).send("access blocked");
  }

  next();
}

module.exports = ipBlocker;
