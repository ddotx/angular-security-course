import { User } from "../src/app/model/user";
import { Session } from "./session";

/**
 * Store Session in Server's Memory
 */
class SessionStore {
  // * Store
  private sessions: {[key: string]: Session} = {}// Map

  // * Create new session and add to Store
  createSession(sessionId: string, user: User) {
    this.sessions[sessionId] = new Session(sessionId, user)
  }

  // * Check current user session on req
  findUserBySessionId(sessionId: string): User | undefined {
    const session = this.sessions[sessionId]

    return this.isSessionValid(sessionId) ? session.user : undefined
  }

  // * Secure REST Endpoint
  isSessionValid(sessionId: string): boolean {

    const session = this.sessions[sessionId]

    return session && session.isValid()
  }


}

// * Make a singleton store instance
export const sessionStore = new SessionStore()
