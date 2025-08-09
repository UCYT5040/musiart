/**
 * Checks if point q lies on the segment pr, assuming p, q, and r are collinear.
 * @param {{x: number, y: number}} p - The first endpoint of the segment.
 * @param {{x: number, y: number}} q - The point to check.
 * @param {{x: number, y: number}} r - The second endpoint of the segment.
 * @returns {boolean} True if q is on segment pr.
 */
function onSegment(p, q, r) {
  return (
    q.x <= Math.max(p.x, r.x) &&
    q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) &&
    q.y >= Math.min(p.y, r.y)
  );
}

/**
 * Finds the orientation of the ordered triplet (p, q, r).
 * @param {{x: number, y: number}} p
 * @param {{x: number, y: number}} q
 * @param {{x: number, y: number}} r
 * @returns {number} 0 if collinear, 1 if clockwise, 2 if counter-clockwise.
 */
function orientation(p, q, r) {
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (val === 0) return 0; // Collinear
  return val > 0 ? 1 : 2; // Clockwise or Counter-clockwise
}

/**
 * The main function to check if line segment 'p1q1' and 'p2q2' intersect.
 * @param {{x: number, y: number}} p1 - Start point of segment 1.
 * @param {{x: number, y: number}} q1 - End point of segment 1.
 * @param {{x: number, y: number}} p2 - Start point of segment 2.
 * @param {{x: number, y: number}} q2 - End point of segment 2.
 * @returns {boolean} True if the segments intersect.
 */
export function doSegmentsIntersect(p1, q1, p2, q2) {
  // Find the four orientations needed for general and special cases
  const o1 = orientation(p1, q1, p2);
  const o2 = orientation(p1, q1, q2);
  const o3 = orientation(p2, q2, p1);
  const o4 = orientation(p2, q2, q1);

  // General case: If the endpoints of each line are on opposite sides of the other.
  if (o1 !== o2 && o3 !== o4) {
    return true;
  }

  // Special Cases for collinear points
  // p1, q1, p2 are collinear and p2 lies on segment p1q1
  if (o1 === 0 && onSegment(p1, p2, q1)) return true;
  // p1, q1, q2 are collinear and q2 lies on segment p1q1
  if (o2 === 0 && onSegment(p1, q2, q1)) return true;
  // p2, q2, p1 are collinear and p1 lies on segment p2q2
  if (o3 === 0 && onSegment(p2, p1, q2)) return true;
  // p2, q2, q1 are collinear and q1 lies on segment p2q2
  if (o4 === 0 && onSegment(p2, q1, q2)) return true;

  return false; // Doesn't fall into any of the above cases
}
