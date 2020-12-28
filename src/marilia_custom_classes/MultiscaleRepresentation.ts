import Shape from "../geometry/shape";
import Representation, { RepresentationParameters } from "../representation/representation";
import { defaults } from '../utils'
import Viewer from "../viewer/viewer";
import DnaOrigamiNanostructure from "./DnaOrigamiNanostructure";

export interface MultiscaleRepresentationParameters extends RepresentationParameters {
    desiredScale: number
}

class MultiscaleRepresentation extends Representation {
    structure: DnaOrigamiNanostructure;
    currentScale: number;
    currentShape: Shape;

    constructor(structure: DnaOrigamiNanostructure, viewer: Viewer, params: Partial<MultiscaleRepresentationParameters>) {
        const p = params || {}

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

    init(params: Partial<MultiscaleRepresentationParameters>) {
        super.init(params)
        this.currentScale = defaults(params.desiredScale, 0);
        this.build()
    }

    create() {
        console.log("MultiRepr CREATE: ", this.currentScale, this.structure.elementsPosition, this.parameters);

        // Multi-scale idea is implemented here
        switch (this.currentScale) {
            case 0:
                this.currentShape = new Shape("Scale level 0", { disableImpostor: true });
                console.log("LEVEL0");
                for (let i: number = 0; i < this.structure.elementsPosition.length; ++i) {
                    this.currentShape.addSphere(this.structure.elementsPosition[i], [1, .1, 0], 2.5, "Sphere_" + i.toString());
                }
                break;
            case 1:
                this.currentShape = new Shape("Scale level 1");
                for (let i: number = 1; i < this.structure.elementsPosition.length; ++i) {
                    this.currentShape.addCylinder(this.structure.elementsPosition[i - 1], this.structure.elementsPosition[i],
                        [1, .1, 0], 2.5, "Cylinder_" + i.toString());
                }
                break;
            default:
                this.currentShape = new Shape("Scale level 2");
                for (let i: number = 1; i < this.structure.elementsPosition.length; ++i) {
                    this.currentShape.addArrow(this.structure.elementsPosition[i - 1], this.structure.elementsPosition[i],
                        [1, .1, 0], 2.5, "Arrow_" + i.toString());
                }
                break;
        }

        this.bufferList.push.apply(this.bufferList, this.currentShape.getBufferList());
    }

    build(updateWhat?: { [k: string]: boolean }) {
        super.build(updateWhat);

        console.log("MultiRepr BUILD: ", updateWhat);
    }

    clear() {
        console.log("MultiRepr CLEAR");
        this.currentShape?.dispose();
        super.clear();
    }

    dispose() {
        console.log("MultiRepr DISPOSE");
        this.currentShape?.dispose();
        super.dispose();
    }

    setParameters(params: Partial<MultiscaleRepresentationParameters>, what: { [propName: string]: any } = {}, rebuild = false) {
        if (params.desiredScale !== undefined) {
            this.currentScale = params.desiredScale;
        }

        super.setParameters(params, what, rebuild);

        console.log("MultiRepr SET_PARAMETERS", params, what, rebuild);

        return this;
    }

    attach(callback: () => void) {
        this.bufferList.forEach(buffer => {
            this.viewer.add(buffer)
            buffer.setParameters(this.getBufferParams())
        })
        this.setVisibility(this.visible)

        callback()
    }
}

export default MultiscaleRepresentation;