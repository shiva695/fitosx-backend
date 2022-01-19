"use strict";

const axios = require('axios');
let api = axios.create({ baseURL: "http://localhost:1337" });

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async create(ctx) {

        let response = {};

        try {
            const { ActivityId, UserID, Score, TimeSpent } = ctx.request.body;

            let userInformation = await strapi.query("user-information").findOne({ UserID  });
            let Name = userInformation.Name;
            console.log(Name)


            const scoreBody = {
                ActivityId,
                UserID,
                Name,
                Score,
                TimeSpent,
                Day: new Date(),
            }

            await strapi.query("score").create(scoreBody);

            response.message = "Score updated successfully!";

        } catch (error) {
            console.log({ ERROR: error });
            response.message = error.message;
        }

        return response;

    },

    // async find(ctx) {

    //     let ActivityId = ctx.query.ActivityId;
    //     let UserId = ctx.query.UserId;
    //     let highScore = await strapi.query('score').find({ ActivityId, UserId, _limit: 1, _sort: "Score:DESC" });
    //     return { highscore : highScore[0] }
      
    // }
};
