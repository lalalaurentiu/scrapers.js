const { translate_city } = require("../utils.js");
const {
  postApiPeViitor,
  generateJob,
  getParams,
} = require("peviitor_jsscraper");
const { Counties } = require("../getTownAndCounty.js");
const Jssoup = require("jssoup").default;
const axios = require("axios");

const _counties = new Counties();

const getHtml = async (url) => {
  const res = await axios.get(url);
  const soup = new Jssoup(res.data);
  return soup;
};

const getJobs = async () => {
  const url = "https://ness-usa.ttcportals.com/search/jobs/in/country/romania";
  let res = await getHtml(url);
  let page = 1;
  const jobs = [];

  var items = res.findAll("div", { class: "jobs-section__item" });

  while (items.length > 0) {
    for (const item of items) {
      const job_title = item.find("a").text.trim();
      const job_link = item.find("a").attrs.href;
      const city = item
        .find("div", { class: "large-4" })
        .text.split(",")[0]
        .replace("Location: ", "")
        .trim();

      const { city: c, county: co } = await _counties.getCounties(
        translate_city(city),
      );

      let counties = [];
      if (c) {
        counties = [...new Set([...counties, ...co])];
      }

      const job = generateJob(job_title, job_link, "Romania", c, counties);
      jobs.push(job);
    }
    page += 1;
    res = await getHtml(url + "?page=" + page + "#");
    items = res.findAll("div", { class: "jobs-section__item" });
  }
  return jobs;
};

const run = async () => {
  const company = "Ness";
  const logo = "https://ness.com/wp-content/uploads/2020/10/ness-logo.png";
  const jobs = await getJobs();
  const params = getParams(company, logo);
  postApiPeViitor(jobs, params);
};

if (require.main === module) {
  run();
}

module.exports = { run, getJobs, getParams }; // this is needed for our unit test job
