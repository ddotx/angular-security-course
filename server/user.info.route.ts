import {Request, Response} from 'express'
import {db} from './database'

export function userInfo(req: Request, res: Response) {
  const userInfo = req.user

  let user = db.findUserByEmail(userInfo.email)

  if(!user) {
    user = db.createUser(userInfo.email, userInfo.sub)
  }

  res.status(200).json({
    email: user.email,
    // preferences: xxx
  })


}

