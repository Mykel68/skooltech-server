import { NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import Session from "../models/session.model";
import { Term } from "../models/term.model";

export async function attachCurrentSessionTerm(
  req: AuthRequest, res: Response, next: NextFunction
) {
  const school_id = req.user?.school_id;
  if (!school_id) return next(); // or error

  const session = await Session.findOne({
    where: { school_id, is_active: true }
  });
  if (session) req.session_id = session.session_id;

  const term = await Term.findOne({
    where: { session_id: session?.session_id, is_active: true }
  });
  if (term) req.term_id = term.term_id;

  return next();
}
