import session from "express-session";
import passport from "passport";
import { Issuer, Strategy } from "openid-client";

export const initSession = (app) => {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 3600000 },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, oic) => {
    oic(null, user);
  });
  passport.deserializeUser((user, oic) => {
    oic(null, user);
  });

  Issuer.discover(
    `https://preprod.login.w3.ibm.com/oidc/endpoint/default/.well-known/openid-configuration`
  ).then(function (oidcIssuer) {
    var client = new oidcIssuer.Client({
      client_id: process.env.CLIENT_ID, 
      client_secret: process.env.CLIENT_SECRET, 
      redirect_uri: `http://localhost:3001/callback`,
      response_types: ["code"], 
    });
    passport.use(
      "oidc",
      new Strategy(
        { client, passReqToCallback: true },
        (req, tokenSet, userinfo, oic) => {
          const claims = tokenSet.claims();
          const user = {
            id: claims.sub,
            id_token: tokenSet.id_token,
            userinfo,
            claims,
          };
          return oic(null, user);
        }
      )
    );
  });
  //end
};
