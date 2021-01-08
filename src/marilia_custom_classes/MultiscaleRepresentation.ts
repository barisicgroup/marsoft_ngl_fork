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
    readonly numOfScales: number;

    constructor(structure: DnaOrigamiNanostructure, viewer: Viewer, params: Partial<MultiscaleRepresentationParameters>) {
        const p = params || {}
        super(structure, viewer, p);

        this.type = "multiscale";
        this.structure = structure;
        this.numOfScales = 3;

        this.parameters = Object.assign({
            desiredScale: {
                type: 'range', step: 1, max: this.numOfScales - 1, min: 0, rebuild: true
            }
        }, this.parameters);

        this.init(p);
    }

    init(params: Partial<MultiscaleRepresentationParameters>) {
        super.init(params)
        this.currentScale = defaults(params.desiredScale, 0);
        this.build()
    }

    create() {
        //console.log("MultiRepr CREATE: ", this.currentScale, this.structure.elementsPosition, this.parameters);

        const elementCenterPositions = this.structure.getIndividualElementCenterPositions();
        const elementRowPositions = this.structure.getIndividualRowPositions();

        // Multi-scale idea is implemented here
        switch (this.currentScale) {
            case 0:
                this.currentShape = new Shape("Scale level 0");
                for (let i = 0; i < elementCenterPositions.length; ++i) {
                    this.currentShape.addPoint(elementCenterPositions[i], [1, .1, 0], "Element_" + i.toString());
                }
                break;
            case 1:
                this.currentShape = new Shape("Scale level 1");
                for (let i = 0; i < elementCenterPositions.length; ++i) {
                    this.currentShape.addSphere(elementCenterPositions[i], [1, .1, 0], this.structure.elementDiamater * 0.5, "Element_" + i.toString());
                }
                break;
            default:
                this.currentShape = new Shape("Scale level 2");

                for (let i = 0; i < elementRowPositions.length; ++i) {
                    this.currentShape.addCylinder(elementRowPositions[i],
                        elementRowPositions[i].clone()
                            .add(this.structure.depthVector.clone()
                                .multiplyScalar(this.structure.elementDiamater * this.structure.depthInElements)),
                        [1, .1, 0], this.structure.elementDiamater * 0.5, "Element_row_" + i.toString());
                }
                break;
        }

        this.bufferList.push.apply(this.bufferList, this.currentShape.getBufferList());
    }

    build(updateWhat?: { [k: string]: boolean }) {
        super.build(updateWhat);

        //console.log("MultiRepr BUILD: ", updateWhat);
    }

    clear() {
        //console.log("MultiRepr CLEAR");
        this.currentShape?.dispose();
        super.clear();
    }

    dispose() {
        //console.log("MultiRepr DISPOSE");
        this.currentShape?.dispose();
        super.dispose();
    }

    getParameters() {
        const params = Object.assign(
            super.getParameters(),
            {
                desiredScale: this.currentScale
            }
        )

        return params
    }

    setParameters(params: Partial<MultiscaleRepresentationParameters>, what: { [propName: string]: any } = {}, rebuild = false) {
        if (params.desiredScale !== undefined) {
            this.currentScale = params.desiredScale;
        }

        super.setParameters(params, what, rebuild);
        //console.log("MultiRepr SET_PARAMETERS", params, what, rebuild);

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