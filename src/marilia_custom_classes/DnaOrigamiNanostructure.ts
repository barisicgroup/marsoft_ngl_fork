import { Vector3 } from "three";
import { Structure } from "../ngl";

class DnaOrigamiNanostructure extends Structure {
    public readonly bottomLeftCornerPos: Vector3;
    public readonly blcToBrcVec: Vector3;
    public readonly brcToTrcVec: Vector3;
    public readonly depthVector: Vector3;
    public readonly depthInElements: number;
    public readonly elementDiameter: number;

    constructor(name: string, bottomLeftCornerPos: Vector3, blcToBrcVec: Vector3,
        brcToTrcVec: Vector3, depthInElements: number = 32, elementDiameter: number = 2, path: string = "") {
        super(name, path);

        this.bottomLeftCornerPos = bottomLeftCornerPos;
        this.blcToBrcVec = blcToBrcVec;
        this.brcToTrcVec = brcToTrcVec;
        this.depthVector = brcToTrcVec.clone().cross(blcToBrcVec).normalize();
        this.depthInElements = depthInElements;
        this.elementDiameter = elementDiameter;
    }

    get type() {
        return "DnaOrigamiNanostructure";
    }

    getIndividualRowPositions(): Vector3[] {
        let result: Vector3[] = [];

        const xDir = this.blcToBrcVec.clone().normalize();
        const yDir = this.brcToTrcVec.clone().normalize();
        const blcToBrcLen = this.blcToBrcVec.length();
        const brcToTrcLen = this.brcToTrcVec.length();

        for (let x = 0; x < blcToBrcLen; x += this.elementDiameter) {
            for (let y = 0; y < brcToTrcLen; y += this.elementDiameter) {
                result.push(this.bottomLeftCornerPos.clone()
                    .add(xDir.clone().multiplyScalar(x).add(
                        yDir.clone().multiplyScalar(y))));
            }
        }

        return result;
    }

    getIndividualElementsByRowPositions(): Vector3[][] {
        let result: Vector3[][] = [];
        const rowPositions = this.getIndividualRowPositions();

        const xDir = this.blcToBrcVec.clone().normalize();
        const yDir = this.brcToTrcVec.clone().normalize();

        for (let i = 0; i < rowPositions.length; ++i) {
            let thisRow: Vector3[] = []
            for (let z = 0; z < this.depthInElements; ++z) {
                const xyOffset = xDir.clone().multiplyScalar(Math.cos(30 * z / this.depthInElements))
                    .add(yDir.clone().multiplyScalar(Math.cos(30 * (1.0 - z / this.depthInElements)))).normalize().multiplyScalar(this.elementDiameter * 0.5);

                thisRow.push(rowPositions[i].clone().add(
                    this.depthVector.clone().multiplyScalar(z * this.elementDiameter)).add(xyOffset));
            }
            result.push(thisRow);
        }

        return result;
    }

    getIndividualElementCenterPositions(): Vector3[] {
        const elByRow: Vector3[][] = this.getIndividualElementsByRowPositions();
        return ([] as Vector3[]).concat(...elByRow);
    }
}

export default DnaOrigamiNanostructure;