
import {Request, Response} from "express";
import {db} from "./database";
import {USERS} from "./database-data";
import * as argon2 from 'argon2';
import {validatePassword} from "./password-validation";
import { randomBytes } from "./security.util";
import { sessionStore } from "./session-store";



export function createUser(req: Request, res:Response) {

    const credentials = req.body;

    const errors = validatePassword(credentials.password);

    if (errors.length > 0) {
        res.status(400).json({errors});
    }
    else {
        /* argon2.hash(credentials.password)
            .then(passwordDigest => {

                const user = db.createUser(credentials.email, passwordDigest);

                console.log(USERS);

                res.status(200).json({id:user.id, email:user.email});

            }); */
      createUserAndSession(res, credentials)
    }

}

async function createUserAndSession(res: Response, credentials) {
  const passwordDigest = await argon2.hash(credentials.password)
  const user = db.createUser(credentials.email, passwordDigest)
  const sessionId = await randomBytes(32).then(bytes => bytes.toString('hex'))

  // TODO: Create Session in memory that linked into a User
  sessionStore.createSession(sessionId, user)

  res.cookie("SESSIONID", sessionId, {
    httpOnly: true, // prevent document.cookie
    secure: true // prevent at NETWORK Level (Man-in-the-middle Attack)
  })

  res.status(200).json({
    id: user.id,
    email: user.email
  })
}
