import cassandra from 'cassandra-driver';
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { EnviromentVariables, JwtPayload } from './contacts';
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

function isImage(url: string) {
    return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  }

type Data = {};

const cassandraClient = new cassandra.Client({
    cloud: {
      secureConnectBundle: "utilities/secure-connect-markdown-messenger.zip",
    },
    credentials: {
      username: process.env.DATASTAXCLIENTID as string,
      password: process.env.DATASTAXCLIENTSECRET as string,
    }
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
    try{
        await cassandraClient.connect();
        const jwtPayload = jwt.verify(req.cookies.JSON_WEB_TOKEN, (process.env as EnviromentVariables).JWTSECRET) as JwtPayload;
        
        switch(req.method){
            case 'GET':

                res.status(200).json((await cassandraClient.execute(`SELECT * FROM markdown_messenger.settings_by_user WHERE email='${req.query.user}';`)).rows[0]);
                
                break;
            
            case 'POST':
                if(isImage(req.body.avatar_url)){
                    if(req.body.name.length < 33){
                        await cassandraClient.execute(`INSERT INTO markdown_messenger.settings_by_user
                        (email, avatar_url, name, status)
                        VALUES ('${jwtPayload.user}', '${req.body.avatar_url.replaceAll("'", "''")}', '${req.body.name.replaceAll("'", "''")}', true);`);
                    
                        res.status(200).json(`🎉 Your Settings Were Updated!`);
                    }else{
                        res.status(400).json(`${req.body.name} is too long. (max. 32 characters)`);
                    }
                    
                }else{
                    res.status(400).json(`${req.body.avatar_url} is not a valid image URL.`);
                }

                break;
            
            default:
                res.status(405).json(`Method ${req.method} Not Allowed`);
        }
    }catch(error: any){
        switch(error.message){

            case 'jwt expired':
                res.status(400).json(`Oops! Looks like your token expired. Please Log in.`);
                break;

            case 'jwt must be provided':
                res.status(400).json(`Oops! Looks like you don't have a token. Please Log in.`);
                break;

            default:
                console.log(`Error whilst getting a users settings: ${error}`);
                res.status(400).json(`Bad Request`);
        }
    }
}
