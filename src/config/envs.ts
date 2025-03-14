
import 'dotenv/config'
import * as joi from 'joi';

interface EnvVars{
    PORT: number;
    NATS_SERVERS: string[];
}

 const envsSchema = joi.object({
    PORT: joi.number().required(),
    //NATS_SERVERS: joi.array().items( joi.string() ).required
 })
 .unknown(true);

 const { error, value  } = envsSchema.validate(
 {
    ...process.env,
    NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
 }
);

   console.log("orderms");
   console.log(process.env.NATS_SERVERS)
 if(error){
    throw new Error(`Config validation error: ${error.message}`)
 }

 const envVars: EnvVars = value;


 export const envs = {
    port: envVars.PORT,
    nats_server: envVars.NATS_SERVERS
 }