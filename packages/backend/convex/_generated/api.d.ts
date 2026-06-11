/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as crimeReports from "../crimeReports.js";
import type * as dangerZones from "../dangerZones.js";
import type * as emergencyAlerts from "../emergencyAlerts.js";
import type * as emergencyContacts from "../emergencyContacts.js";
import type * as emergencyServices from "../emergencyServices.js";
import type * as health from "../health.js";
import type * as missingReports from "../missingReports.js";
import type * as notificationHelpers from "../notificationHelpers.js";
import type * as notifications from "../notifications.js";
import type * as proximityAlerts from "../proximityAlerts.js";
import type * as regions from "../regions.js";
import type * as safetyAlerts from "../safetyAlerts.js";
import type * as storage from "../storage.js";
import type * as stolenItems from "../stolenItems.js";
import type * as userLocations from "../userLocations.js";
import type * as users from "../users.js";
import type * as wantedPersons from "../wantedPersons.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  crimeReports: typeof crimeReports;
  dangerZones: typeof dangerZones;
  emergencyAlerts: typeof emergencyAlerts;
  emergencyContacts: typeof emergencyContacts;
  emergencyServices: typeof emergencyServices;
  health: typeof health;
  missingReports: typeof missingReports;
  notificationHelpers: typeof notificationHelpers;
  notifications: typeof notifications;
  proximityAlerts: typeof proximityAlerts;
  regions: typeof regions;
  safetyAlerts: typeof safetyAlerts;
  storage: typeof storage;
  stolenItems: typeof stolenItems;
  userLocations: typeof userLocations;
  users: typeof users;
  wantedPersons: typeof wantedPersons;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
