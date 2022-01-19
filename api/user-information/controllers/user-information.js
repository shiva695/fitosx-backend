'use strict';

const axios = require('axios')
let api = axios.create({ baseURL: "http://localhost:1337" })

module.exports = {
    async create(ctx){
        let {name, email, password, accesstoken, jwt} = ctx.request.body;
        let response  = {};

        try {
            // let avatarURL = 'https://share.getcloudapp.com/P8umKxg2/download/Avatar_icon.svg';

            if (accesstoken != null && name == null && jwt == null){

                let googleProfile = await api.get("https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=" + accesstoken)
                let initSignup = await api.get('auth/google/callback?access_token=' + accesstoken)
                
                response.accesstoken = initSignup.data.jwt;
                response.userid = initSignup.data.user.id;
                response.username = initSignup.data.user.username;
                response.email = initSignup.data.user.email;
                response.avatarurl = googleProfile.data.picture;

                let userInformation = await strapi.query('user-information').findOne({ UserID: response.userid})
                if (userInformation == null) {
                    let createUserInformationReqBody = {
                        UserID: initSignup.data.user.id,
                        Name: initSignup.data.user.username,
                        Email: initSignup.data.user.email,
                        Avatarurl: googleProfile.data.picture
                    };
                    console.log(createUserInformationReqBody)
                    await strapi
                        .query("user-information")
                        .create(createUserInformationReqBody);
                }
             
            }


            if (accesstoken == null && name != null && jwt == null) {

                let userRegisterReqBody = {
                    username: name,
                    email: email,
                    password: password,
                };
                let initSignup = await api.post(
                    "/auth/local/register",
                    userRegisterReqBody
                );
                response.accesstoken = initSignup.data.jwt;
                response.userid = initSignup.data.user.id;
                response.username = initSignup.data.user.username;
                response.email = initSignup.data.user.email;
                //----------------------------------------------------------------

                let createUserInformationReqBody = {
                    UserID: initSignup.data.user.id,
                    Name: name,
                    Email: email,
                    AvatarURL: avatarURL
                };
                await strapi
                    .query("user-information")
                    .create(createUserInformationReqBody);
                //----------------------------------------------------------------
            }

            if (accesstoken == null && name == null && jwt == null) {
                let userLoginReqBody = {
                    identifier: email,
                    password,
                };
                let initLogin = await api.post("/auth/local", userLoginReqBody);
                response.accesstoken = initLogin.data.jwt;
                let UserID = initLogin.data.user.id;
                let userInformation = await strapi.query("user-information").findOne({ UserID });
                response.userid = userInformation.UserId;
                response.username = userInformation.Name;
                response.email = userInformation.Email;
                response.avatarurl = userInformation.AvatarURL;
                //----------------------------------------------------------------
            }

            if (accesstoken == null && name == null && jwt != null) {
                let data = {
                    headers: {
                        'Authorization': "Bearer " + jwt
                    }
                };
                let checkJWT = await api.get("/users/me", data);
                let UserID = checkJWT.data.id;
                let userInformation = await strapi.query("user-information").findOne({ UserID });
                response.userid = userInformation.UserId;
                response.username = userInformation.Name;
                response.email = userInformation.Email;
                response.avatarurl = userInformation.AvatarURL;

            }

        
            let dayResult = await strapi
                .query("score")
                .find({ UserID: response.userid });
            let today = new Date();
            const daybefore = new Date(today);
            let j = 0;
            response.activities = [];
            
            for (let i = 6; i >= 0; i--) {
                daybefore.setDate(daybefore.getDate() - (i - j));
                let isActive = dayResult.some((element) => {
                    return (
                        new Date(element.Day).toDateString() == daybefore.toDateString()
                    );
                });
                response.activities.push({
                    Day: daybefore.toDateString()[0],
                    isActive,
                });
                j = i;
            }

        } catch (error) {
            if (error.response) {
                
                let e = error.response.data.message[0].messages[0].id || error.response.data.message[0].messages[0].message
                
                response.message = e;

                if(e === "Auth.form.error.email.taken"){
                    response.statuscode = 409;
                    response.message = "Email id already taken";
                }else{
                    response.statuscode = 400;
                    response.message = error.response.data.message[0].messages[0].message
                }
               
           
            } else {
                response.message = error.message;
            }
            console.log(error)
        }
        return response
    }
};
