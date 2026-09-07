export class ReviewExceptionConflictError extends Error {
  constructor(exceptionId: string, status: "approved" | "rejected") {
    super(`Exception ${exceptionId} has already been ${status} and cannot be reviewed again.`);
    this.name = "ReviewExceptionConflictError";
  }
}
