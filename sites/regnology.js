const {
  Scraper,
  postApiPeViitor,
  generateJob,
  getParams,
} = require("peviitor_jsscraper");

const getJobs = async () => {
  let url = "https://www.regnology.net/en/careers/#jobs";
  const jobs = [];
  const scraper = new Scraper(url);

  let res = await scraper.get_soup("HTML");
  let items = res.find("ul", { class: "link-list" }).findAll("li");

  items.forEach((item) => {
    const link = item.find("a");
    const job_title = link.find("h3").text.trim();
    const job_link = "https://www.regnology.net" + link.attrs.href;
    const city = link.find("p").text.trim();

    jobs.push(generateJob(job_title, job_link, "Romania", city, "Romania"));
  });
  return jobs;
};

const run = async () => {
  const company = "Regnology";
  const logo =
    "https://www.regnology.net/project/frontend/build/logo-regnology.7537d456.svg";
  const jobs = await getJobs();
  const params = getParams(company, logo);
  postApiPeViitor(jobs, params);
};

if (require.main === module) {
  run();
}

module.exports = { run, getJobs, getParams }; // this is needed for our unit test job
