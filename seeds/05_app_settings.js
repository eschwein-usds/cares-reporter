require("dotenv").config();

exports.seed = async function(knex) {
  await knex("reporting_periods").del();
  const ids = await knex("reporting_periods")
    .insert([
      {
        name: "June 30, 2020",
        start_date: "2020-03-01",
        end_date: "2020-06-30"
      }
    ])
    .returning("id");
  await knex("application_settings").del();
  await knex("application_settings").insert([
    { title: "Rhode Island", current_reporting_period_id: ids[0] }
  ]);
};