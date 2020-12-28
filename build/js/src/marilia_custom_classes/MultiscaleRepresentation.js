import Shape from "../geometry/shape";
import Representation from "../representation/representation";
import { defaults } from '../utils';
class MultiscaleRepresentation extends Representation {
    constructor(structure, viewer, params) {
        const p = params || {};
        super(structure, viewer, p);
        this.type = "multiscale";
        this.parameters = Object.assign({
            desiredScale: {
                type: 'integer', rebuild: true
            }
        }, this.parameters);
        this.structure = structure;
        this.init(p);
    }
    init(params) {
        super.init(params);
        this.currentScale = defaults(params.desiredScale, 0);
        this.build();
    }
    create() {
        console.log("MultiRepr CREATE: ", this.currentScale, this.structure.elementsPosition, this.parameters);
        // Multi-scale idea is implemented here
        switch (this.currentScale) {
            case 0:
                this.currentShape = new Shape("Scale level 0", { disableImpostor: true });
                console.log("LEVEL0");
                for (let i = 0; i < this.structure.elementsPosition.length; ++i) {
                    this.currentShape.addSphere(this.structure.elementsPosition[i], [1, .1, 0], 2.5, "Sphere_" + i.toString());
                }
                break;
            case 1:
                this.currentShape = new Shape("Scale level 1");
                for (let i = 1; i < this.structure.elementsPosition.length; ++i) {
                    this.currentShape.addCylinder(this.structure.elementsPosition[i - 1], this.structure.elementsPosition[i], [1, .1, 0], 2.5, "Cylinder_" + i.toString());
                }
                break;
            default:
                this.currentShape = new Shape("Scale level 2");
                for (let i = 1; i < this.structure.elementsPosition.length; ++i) {
                    this.currentShape.addArrow(this.structure.elementsPosition[i - 1], this.structure.elementsPosition[i], [1, .1, 0], 2.5, "Arrow_" + i.toString());
                }
                break;
        }
        this.bufferList.push.apply(this.bufferList, this.currentShape.getBufferList());
    }
    build(updateWhat) {
        super.build(updateWhat);
        console.log("MultiRepr BUILD: ", updateWhat);
    }
    clear() {
        var _a;
        console.log("MultiRepr CLEAR");
        (_a = this.currentShape) === null || _a === void 0 ? void 0 : _a.dispose();
        super.clear();
    }
    dispose() {
        var _a;
        console.log("MultiRepr DISPOSE");
        (_a = this.currentShape) === null || _a === void 0 ? void 0 : _a.dispose();
        super.dispose();
    }
    setParameters(params, what = {}, rebuild = false) {
        if (params.desiredScale !== undefined) {
            this.currentScale = params.desiredScale;
        }
        super.setParameters(params, what, rebuild);
        console.log("MultiRepr SET_PARAMETERS", params, what, rebuild);
        return this;
    }
    attach(callback) {
        this.bufferList.forEach(buffer => {
            this.viewer.add(buffer);
            buffer.setParameters(this.getBufferParams());
        });
        this.setVisibility(this.visible);
        callback();
    }
}
export default MultiscaleRepresentation;
//# sourceMappingURL=MultiscaleRepresentation.js.map