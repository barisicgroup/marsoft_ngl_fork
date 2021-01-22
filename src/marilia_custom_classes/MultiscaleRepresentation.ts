import { Vector3 } from "three";
import Shape from "../geometry/shape";
import Representation, { RepresentationParameters } from "../representation/representation";
import { defaults } from '../utils'
import Viewer from "../viewer/viewer";
import BufferCreator from "./geometry/BufferCreator";
import DnaOrigamiNanostructure from "./DnaOrigamiNanostructure";
import NucleotidePicker, { TestPickingStructure, TestPickingNucleotide } from "./geometry/NucleotidePicker";

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
        const elementByRowPositions = this.structure.getIndividualElementsByRowPositions();
        const elementRowPositions = this.structure.getIndividualRowPositions();

        // Multi-scale idea is implemented here
        switch (this.currentScale) {
            case 0:
                this.currentShape = new Shape("Scale level 0");
                for (let i = 0; i < elementCenterPositions.length; ++i) {
                    this.currentShape.addSphere(elementCenterPositions[i], [1, i / elementCenterPositions.length, 0], this.structure.elementDiameter * 0.25, "Element_" + i.toString());
                }
                break;
            case 1:
                this.currentShape = new Shape("Scale level 1"); // Not necessary, left just to not have it undefined

                for (let rowIdx = 0; rowIdx < elementByRowPositions.length; ++rowIdx) {
                    const currentRowPositions = elementByRowPositions[rowIdx];

                    const sizes: number[] = [];
                    const colors: Vector3[] = [];
                    const testPickNucleotides = [];
                    const pickingIds = [];
                    const nbTypes: Array<"A" | "T" | "C" | "G"> = ["A", "T", "C", "G"];

                    for (let i = 0; i < currentRowPositions.length; ++i) {
                        sizes.push(this.structure.elementDiameter * 0.25 + (Math.random() - 0.5) * 0.1);
                        colors.push(new Vector3(Math.random(), Math.random(), Math.random()));
                        testPickNucleotides.push(new TestPickingNucleotide(nbTypes[i % 4], currentRowPositions[i]));
                        pickingIds.push(i);
                    }

                    //this.bufferList.push(BufferCreator.createWideLinePairsBuffer(currentRowPositions, colors, 3));

                    const radiuses = new Array<number>(currentRowPositions.length - 1);
                    radiuses.fill(this.structure.elementDiameter * 0.5);

                    const testPickStructure = new TestPickingStructure(testPickNucleotides);

                    /*this.bufferList.push(BufferCreator.createCylinderStripBuffer(currentRowPositions, colors, radiuses, pickingIds, 
                        (idsArr) => {
                            return new NucleotidePicker(idsArr, testPickStructure);
                        }));*/

                    this.bufferList.push(BufferCreator.createWideLineStripBuffer(currentRowPositions, colors, 2, pickingIds,
                        (idsArr) => {
                            return new NucleotidePicker(idsArr, testPickStructure);
                        }));

                    //this.bufferList.push(BufferCreator.createCylinderBuffer(new Vector3(0, 0, 0), new Vector3(1, 1, 0), new Vector3(1, 0, 0), new Vector3(0, 1, 0), 2));
                    //this.bufferList.push(BufferCreator.createCylinderBuffer(new Vector3(0, 0, 0), new Vector3(-1, 1, 0), new Vector3(1, 0, 0), new Vector3(0, 1, 0), 4, true));
                    //this.bufferList.push(BufferCreator.createCylinderBuffer(new Vector3(0, 0, 0), new Vector3(1, -1, 0), new Vector3(1, 0, 0), new Vector3(0, 1, 0), 3, false, true));
                    //this.bufferList.push(BufferCreator.createCylinderBuffer(new Vector3(0, 0, 0), new Vector3(-1, -1, 0), new Vector3(1, 0, 0), new Vector3(0, 1, 0), 1, true, true));
                    //this.bufferList.push(BufferCreator.createTubeMeshBuffer(currentRowPositions, sizes, colors, 4));

                    /*this.bufferList.push(BufferCreator.createRibbonBufferUniformParams(currentRowPositions,
                        this.structure.elementDiamater * 0.25,
                        new Vector3(1, 0.2, 0), undefined, 4));*/

                    /*
                    // Normals, binormals, .. are not really correct values now but someting which
                    // works in a way that it allows for some visualization
                    const posArray = new Float32Array(currentRowPositions.length * 3);
                    const normArray = new Float32Array(currentRowPositions.length * 3);
                    const binormArray = new Float32Array(currentRowPositions.length * 3);
                    const tangArray = new Float32Array(currentRowPositions.length * 3);
                    const colArray = new Float32Array(currentRowPositions.length * 3);
                    const sizeArray = new Float32Array(currentRowPositions.length);

                    for (let i = 0; i < currentRowPositions.length; ++i) {
                        posArray[3 * i] = currentRowPositions[i].x;
                        posArray[3 * i + 1] = currentRowPositions[i].y;
                        posArray[3 * i + 2] = currentRowPositions[i].z;

                        const dir = i === currentRowPositions.length - 1 ? new Vector3(1, 0, 0) : currentRowPositions[i + 1].clone().sub(currentRowPositions[i]).normalize();

                        tangArray[3 * i] = dir.x;
                        tangArray[3 * i + 1] = dir.y;
                        tangArray[3 * i + 2] = dir.z;

                        let norm: Vector3;

                        if (dir.x > 0.0) {
                            norm = new Vector3((-dir.y - dir.z) / dir.x, 1, 1).normalize();
                        }
                        else if (dir.y > 0.0) {
                            norm = new Vector3(1, (-dir.x - dir.z) / dir.y, 1).normalize();
                        }
                        else {
                            norm = new Vector3(1, 1, (-dir.x - dir.y) / dir.z).normalize();
                        }

                        normArray[3 * i] = norm.x;
                        normArray[3 * i + 1] = norm.y;
                        normArray[3 * i + 2] = norm.z;

                        const bn = dir.clone().cross(norm).normalize();

                        binormArray[3 * i] = bn.x;
                        binormArray[3 * i + 1] = bn.y;
                        binormArray[3 * i + 2] = bn.z;

                        colArray[3 * i] = 1;
                        colArray[3 * i + 1] = (i / currentRowPositions.length + rowIdx / elementByRowPositions.length) * 0.5;
                        colArray[3 * i + 2] = 0;
                    }

                    sizeArray.fill(this.structure.elementDiamater * 0.25);

                    this.bufferList.push(new TubeMeshBuffer(
                        Object.assign({}, { 'position': posArray, 'size': sizeArray, 'normal': normArray, 'binormal': binormArray, 'tangent': tangArray, 'color': colArray }),
                        this.getBufferParams({
                            radialSegments: 12,
                            aspectRatio: 1,
                            capped: true
                        })
                    ));*/
                }
                break;
            default:
                this.currentShape = new Shape("Scale level 2");

                for (let i = 0; i < elementRowPositions.length; ++i) {
                    this.currentShape.addCylinder(elementRowPositions[i],
                        elementRowPositions[i].clone()
                            .add(this.structure.depthVector.clone()
                                .multiplyScalar(this.structure.elementDiameter * this.structure.depthInElements)),
                        [1, i / elementRowPositions.length, 0], this.structure.elementDiameter * 0.5, "Element_row_" + i.toString());
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