import { Structure } from "../ngl";
class DnaOrigamiNanostructure extends Structure {
    constructor(name, elementsPosition, path = "") {
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
//# sourceMappingURL=DnaOrigamiNanostructure.js.map