const { translate_city } = require("../utils.js");
const {
  Scraper,
  postApiPeViitor,
  generateJob,
  getParams,
} = require("peviitor_jsscraper");
const { Counties } = require("../getTownAndCounty.js");

const _counties = new Counties();

const getJobs = async () => {
  let url =
    "https://bolt.eu/en/careers/positions/?location=Romania-Bucharest&_rsc=yl102";
  const jobs = [];
  const scraper = new Scraper(url);
  scraper.config.headers["User-Agent"] = "Mozilla/5.0";
  const type = "HTML";
  const res = await scraper.get_soup(type);
  const text = res.text;

  const startPattern = String.fromCharCode(
    112,
    97,
    114,
    115,
    101,
    100,
    74,
    111,
    98,
    115,
    92,
    34,
    58,
    91,
    123,
  );
  const endPattern = String.fromCharCode(
    125,
    93,
    44,
    92,
    34,
    117,
    110,
    105,
    113,
    117,
    101,
    76,
    111,
    99,
    97,
    116,
    105,
    111,
    110,
    115,
    92,
    34,
    58,
  );

  const startIdx = text.indexOf(startPattern);
  const endIdx = text.indexOf(endPattern, startIdx);

  if (startIdx < 0 || endIdx <= startIdx) {
    return jobs;
  }

  let jobsText = text.substring(startIdx + startPattern.length - 2, endIdx + 1);

  let noBS = jobsText.split(String.fromCharCode(92)).join("");
  noBS = noBS.replace(/\$undefined/g, "null");
  noBS = noBS.replace(/\$D/g, "");

  const jobStrings = noBS.split(/\},\s*\{/);

  for (const jobStr of jobStrings) {
    try {
      const item = JSON.parse("{" + jobStr + "}");

      if (!item || !item.header) continue;

      let country = null;
      let loc = null;

      for (const location of item.header.locations || []) {
        if (location.country === "Romania") {
          country = location.country;
          loc = location.city;
        }
      }

      if (country !== "Romania") continue;

      let cities = [];
      let counties = [];
      const job_title = item.header.roleTitle;
      const job_link = "https://bolt.eu/" + item.body.applyLinkProps.href;

      const city = translate_city(loc);
      const { city: c, county: co } = await _counties.getCounties(city);
      if (c) {
        cities.push(c);
        counties = [...new Set([...counties, ...co])];
      }
      const job = generateJob(job_title, job_link, country, cities, counties);

      jobs.push(job);
    } catch (e) {
      // Skip invalid jobs
    }
  }
  return jobs;
};

const run = async () => {
  const company = "Bolt";
  const logo =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Bolt_logo.png/1200px-Bolt_logo.png";
  const jobs = await getJobs();
  const params = getParams(company, logo);
  postApiPeViitor(jobs, params);
};

if (require.main === module) {
  run();
}

module.exports = { run, getJobs, getParams };
