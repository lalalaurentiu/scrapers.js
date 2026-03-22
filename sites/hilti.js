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
  const jobs = [];

  const apiUrl = "https://careers.hilti.group/en/jobs/?country=20000441&page=1";

  const scraper = new Scraper(apiUrl);
  scraper.config.headers = {
    ...scraper.config.headers,
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Cache-Control": "max-age=0",
  };

  const res = await scraper.get_soup("HTML");

  const items = res.findAll("div", { class: "card-job" });

  for (const job of items) {
    const job_title = job.find("a").text.trim();
    const job_link = `https://careers.hilti.group${job.find("a").attrs.href}`;
    let city = translate_city(
      job.find("li", { class: "list-inline-item" }).text.split(",")[0].trim(),
    );

    const { city: c, county: co } = await _counties.getCounties(city);

    const job_element = generateJob(job_title, job_link, "Romania", c, co);

    jobs.push(job_element);
  }

  return jobs;
};

const run = async () => {
  const company = "Hilti";
  const logo = "https://careers.hilti.group/images/logo.svg";
  const jobs = await getJobs();
  const params = getParams(company, logo);
  await postApiPeViitor(jobs, params);
};

if (require.main === module) {
  run();
}

module.exports = { run, getJobs, getParams }; // this is needed for our unit test job
