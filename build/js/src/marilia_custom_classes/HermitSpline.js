import { Vector3 } from "three";
/**
* Uses cubic Hermit spline / Catmull–Rom spline to interpolate given set of points
*/
class HermitSpline {
    /**
    * @param pointsToInterpolate points to be interpolated
    * @param interpolationSubdivisions how many additional interpolated points will be added to each line segment
    */
    constructor(pointsToInterpolate, interpolationSubdivisions) {
        this.interpolatePoints(pointsToInterpolate, interpolationSubdivisions);
    }
    get points() {
        return this.resultingPoints;
    }
    get normals() {
        return this.resultingNormals;
    }
    get tangents() {
        return this.resultingTangents;
    }
    interpolatePoints(pointsToInterpolate, interpolationSubdivisions) {
        this.resultingPoints = [];
        this.resultingNormals = [];
        this.resultingTangents = [];
        const pointsPerSegment = interpolationSubdivisions + 2;
        for (let i = 0; i < pointsToInterpolate.length - 1; ++i) {
            const p0 = pointsToInterpolate[i];
            const p1 = pointsToInterpolate[i + 1];
            const t0 = i == 0 ?
                this.getEndpointTangent(p0, p1) :
                this.getInteriorTangent(pointsToInterpolate[i - 1], p1);
            const t1 = i == pointsToInterpolate.length - 2 ?
                this.getEndpointTangent(p0, p1) :
                this.getInteriorTangent(p0, pointsToInterpolate[i + 2]);
            for (let j = 0; j < pointsPerSegment; ++j) {
                const t = j / (pointsPerSegment - 1);
                this.resultingPoints.push(this.interpolatePositionCubic(p0, t0, p1, t1, t));
                const tangent = this.interpolateTangentCubic(p0, t0, p1, t1, t).normalize();
                this.resultingTangents.push(tangent);
                this.resultingNormals.push(this.getNormalForTangent(tangent));
            }
        }
    }
    interpolatePositionCubic(p0, t0, p1, t1, t) {
        const t2 = t * t;
        const t3 = t2 * t;
        return p0.clone().multiplyScalar(2 * t3 - 3 * t2 + 1).add(t0.clone().multiplyScalar(t3 - 2 * t2 + t).add(p1.clone().multiplyScalar(-2 * t3 + 3 * t2)).add(t1.clone().multiplyScalar(t3 - t2)));
    }
    interpolateTangentCubic(p0, t0, p1, t1, t) {
        const t2 = t * t;
        // First derivative of the interpolatePositionCubic function
        return p0.clone().multiplyScalar(6 * t2 - 6 * t).add(t0.clone().multiplyScalar(3 * t2 - 4 * t + 1).add(p1.clone().multiplyScalar(6 * t - 6 * t2)).add(t1.clone().multiplyScalar(3 * t2 - 2 * t)));
    }
    getNormalForTangent(tang) {
        if (Math.abs(tang.x) > 0.0) {
            return new Vector3((-tang.y - tang.z) / tang.x, 1, 1).normalize();
        }
        else if (Math.abs(tang.y) > 0.0) {
            return new Vector3(1, (-tang.x - tang.z) / tang.y, 1).normalize();
        }
        return new Vector3(1, 1, (-tang.x - tang.y) / tang.z).normalize();
    }
    getInteriorTangent(prevPoint, nextPoint) {
        return nextPoint.clone().sub(prevPoint).multiplyScalar(0.5);
    }
    getEndpointTangent(pk, pkPlusOne) {
        return pkPlusOne.clone().sub(pk);
    }
}
export default HermitSpline;
//# sourceMappingURL=HermitSpline.js.map