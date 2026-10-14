/**
 * Location verification engine for Gym Attendance.
 * Calculates exact geographical distance using the Haversine formula on the backend.
 * Never trusts a client-supplied boolean or claims GPS completely eliminates spoofing.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationVerificationResult {
  isInside: boolean;
  distanceMeters: number;
  allowedRadiusMeters: number;
  reason?: string;
}

const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates great-circle distance between two points in meters using Haversine formula.
 */
export function calculateHaversineDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  if (
    typeof coord1.latitude !== 'number' ||
    typeof coord1.longitude !== 'number' ||
    typeof coord2.latitude !== 'number' ||
    typeof coord2.longitude !== 'number' ||
    isNaN(coord1.latitude) ||
    isNaN(coord1.longitude) ||
    isNaN(coord2.latitude) ||
    isNaN(coord2.longitude)
  ) {
    throw new Error('Invalid coordinates provided for distance calculation');
  }

  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const lat1 = toRadians(coord1.latitude);
  const lat2 = toRadians(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS_METERS * c * 10) / 10; // Round to 0.1 meter
}

/**
 * Verifies whether reported coordinates are within the gym's allowed perimeter.
 */
export function verifyGymLocation(
  memberCoords: Coordinates | undefined | null,
  gymCoords: Coordinates,
  allowedRadiusMeters: number = 75
): LocationVerificationResult {
  if (
    !memberCoords ||
    typeof memberCoords.latitude !== 'number' ||
    typeof memberCoords.longitude !== 'number' ||
    isNaN(memberCoords.latitude) ||
    isNaN(memberCoords.longitude)
  ) {
    return {
      isInside: false,
      distanceMeters: -1,
      allowedRadiusMeters,
      reason: 'Device coordinates unavailable or invalid.',
    };
  }

  // Basic sanity check on latitude (-90 to 90) and longitude (-180 to 180)
  if (
    memberCoords.latitude < -90 ||
    memberCoords.latitude > 90 ||
    memberCoords.longitude < -180 ||
    memberCoords.longitude > 180
  ) {
    return {
      isInside: false,
      distanceMeters: -1,
      allowedRadiusMeters,
      reason: 'Reported coordinates are outside valid geographical bounds.',
    };
  }

  const distance = calculateHaversineDistance(memberCoords, gymCoords);
  const isInside = distance <= allowedRadiusMeters;

  return {
    isInside,
    distanceMeters: distance,
    allowedRadiusMeters,
    reason: isInside
      ? undefined
      : `Reported location is ${distance}m away from the gym (maximum permitted: ${allowedRadiusMeters}m).`,
  };
}
