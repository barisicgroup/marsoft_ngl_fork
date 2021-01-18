import { Structure } from "../ngl";
class DnaOrigamiNanostructure extends Structure {
    constructor(name, bottomLeftCornerPos, blcToBrcVec, brcToTrcVec, depthInElements = 32, elementDiameter = 2, path = "") {
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
    getIndividualRowPositions() {
        let result = [];
        const xDir = this.blcToBrcVec.clone().normalize();
        const yDir = this.brcToTrcVec.clone().normalize();
        const blcToBrcLen = this.blcToBrcVec.length();
        const brcToTrcLen = this.brcToTrcVec.length();
        for (let x = 0; x < blcToBrcLen; x += this.elementDiameter) {
            for (let y = 0; y < brcToTrcLen; y += this.elementDiameter) {
                result.push(this.bottomLeftCornerPos.clone()
                    .add(xDir.clone().multiplyScalar(x).add(yDir.clone().multiplyScalar(y))));
            }
        }
        return result;
    }
    getIndividualElementsByRowPositions() {
        let result = [];
        const rowPositions = this.getIndividualRowPositions();
        const xDir = this.blcToBrcVec.clone().normalize();
        const yDir = this.brcToTrcVec.clone().normalize();
        for (let i = 0; i < rowPositions.length; ++i) {
            let thisRow = [];
            for (let z = 0; z < this.depthInElements; ++z) {
                const xyOffset = xDir.clone().multiplyScalar(Math.cos(30 * z / this.depthInElements))
                    .add(yDir.clone().multiplyScalar(Math.cos(30 * (1.0 - z / this.depthInElements)))).normalize().multiplyScalar(this.elementDiameter * 0.5);
                thisRow.push(rowPositions[i].clone().add(this.depthVector.clone().multiplyScalar(z * this.elementDiameter)).add(xyOffset));
            }
            result.push(thisRow);
        }
        return result;
    }
    getIndividualElementCenterPositions() {
        const elByRow = this.getIndividualElementsByRowPositions();
        return [].concat(...elByRow);
    }
}
export default DnaOrigamiNanostructure;
//# sourceMappingURL=DnaOrigamiNanostructure.js.map