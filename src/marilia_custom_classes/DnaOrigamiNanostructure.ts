import { Vector3 } from "three";
import { Structure } from "../ngl";

class DnaOrigamiNanostructure extends Structure {
    private _elementsPosition: Vector3[]; // temporary structure for storing some test data

    constructor(name: string, elementsPosition: Vector3[], path: string = "") {
        super(name, path);

        this._elementsPosition = elementsPosition;
    }

    get type() {
        return "DnaOrigamiNanostructure";
    }

    get elementsPosition() {
        return this._elementsPosition;
    }
}

export default DnaOrigamiNanostructure;