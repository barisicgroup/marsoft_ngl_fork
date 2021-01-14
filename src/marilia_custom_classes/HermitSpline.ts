import { Vector3 } from "three";

/*
* Uses cubic Hermit spline / Catmull–Rom spline to interpolate given set of points
*/
class HermitSpline {
    resultingPoints: Vector3[];
    resultingNormals: Vector3[];
    resultingTangents: Vector3[];

    constructor(pointsToInterpolate: Vector3[], interpolationSubdivisions: number) {
        this.interpolatePoints(pointsToInterpolate, interpolationSubdivisions);
    }

    get points(): Vector3[] {
        return this.resultingPoints;
    }

    get normals(): Vector3[] {
        return this.resultingNormals;
    }

    get tangents(): Vector3[] {
        return this.resultingTangents;
    }

    private interpolatePoints(pointsToInterpolate: Vector3[], interpolationSubdivisions: number): void {
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
                this.resultingTangents.push(t0.clone().lerp(t1, t).normalize());
                this.resultingNormals.push(this.interpolateNormalCubic(p0, t0, p1, t1, t));
            }
        }
    }

    private interpolatePositionCubic(p0: Vector3, t0: Vector3, p1: Vector3, t1: Vector3, t: number): Vector3 {
        const t2 = t * t;
        const t3 = t2 * t;

        return p0.clone().multiplyScalar(2 * t3 - 3 * t2 + 1).add(
            t0.clone().multiplyScalar(t3 - 2 * t2 + t).add(
                p1.clone().multiplyScalar(-2 * t3 + 3 * t2)).add(
                    t1.clone().multiplyScalar(t3 - t2)));
    }

    private getInteriorTangent(prevPoint: Vector3, nextPoint: Vector3): Vector3 {
        return nextPoint.clone().sub(prevPoint).multiplyScalar(0.5);
    }

    private getEndpointTangent(pk: Vector3, pkPlusOne: Vector3): Vector3 {
        return pkPlusOne.clone().sub(pk);
    }

    private interpolateNormalCubic(p0: Vector3, t0: Vector3, p1: Vector3, t1: Vector3, t: number): Vector3 {
        return p0.clone().multiplyScalar(12 * t - 6).add(
            t0.clone().normalize().multiplyScalar(6 - 12 * t).add(
                p1.clone().multiplyScalar(6 * t - 4)).add(
                    t1.clone().normalize().multiplyScalar(6 * t - 2)))
            .normalize();
    }
}

export default HermitSpline;