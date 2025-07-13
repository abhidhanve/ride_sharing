import * as user from "./user";
import * as rideSchema from "./ride";
import * as driverAvailability from "./driverAvailability";
import * as feedback from "./feedback";

export const schema = {
  ...user,
  ...rideSchema,
  ...driverAvailability,
  ...feedback,
};



export type DBSchema = typeof schema;
export type DB = {
  [K in keyof DBSchema as K extends `${infer Base}s` ? Base : K]: DBSchema[K]["$inferSelect"];
};
