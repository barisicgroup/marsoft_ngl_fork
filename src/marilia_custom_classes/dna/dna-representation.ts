import Representation, {RepresentationParameters} from "../../representation/representation";
import Viewer from "../../viewer/viewer";
import DNAStrand, {DummyDNAStrand, Nucleobase, NucleobaseType, StrictNucleobaseType} from "./dna-strand";
import Buffer from "../../buffer/buffer"
import {defaults} from "../../utils";
import BufferCreator from "../geometry/BufferCreator";
import {Color, Vector3} from "three";

interface DNARepresentationParameters extends RepresentationParameters {
    representationScale: "cylinder";
}

class DNARepresentation extends Representation {

    // Params
    protected representationScale: string;

    private dna: DNAStrand | DummyDNAStrand;

    constructor(dna: DNAStrand | DummyDNAStrand, viewer: Viewer, params: Partial<DNARepresentationParameters>) {
        super(dna, viewer, params)

        this.dna = dna;

        this.parameters = Object.assign({
            representationScale: {
                type: "select",
                rebuild: true,
                options: {
                    "cylinder": "cylinder",
                    "cylinders": "cylinders"
                }
            }
        }, this.parameters);

        this.init(params);
    }

    init(params: Partial<DNARepresentationParameters>) {
        let p = params || {}; // TODO figure out what this does

        this.representationScale = defaults(p.representationScale, "cylinders");

        super.init(params);
        this.build();
    }

    create() {
        switch (this.representationScale) {
            case "cylinders":
                this.bufferList = this.createManyCylinders();
                break;
            case "cylinder":
            default:
                //this.buffers = this.createCylinder();
                this.bufferList = this.createCylinder();
        }
    }

    update(what?: any) {
        // TODO tailor the 'what' parameter
        super.update(what);
    }

    attach(callback: () => void) {
        this.bufferList.forEach(buffer => {
            this.viewer.add(buffer);
        });

        super.attach(callback);
    }

    clear() {
        super.clear();
    }

    dispose() {
        delete this.dna;
        super.dispose();
    }

    // Multiscale representations --------------------------------------------------------------------------------------

    private static getNucleobaseTypeColor(t: NucleobaseType): Color {
        switch (t) {
            // Colors taken from the Wikipedia images: https://en.wikipedia.org/wiki/Nucleobase
            case StrictNucleobaseType.A: return new Color(0xe47a7a);
            case StrictNucleobaseType.G: return new Color(0x8483d3);
            case StrictNucleobaseType.C: return new Color(0xf8f49c);
            case StrictNucleobaseType.T: return new Color(0xf8c39d);
        }
        return new Color(1, 1, 1);
    }

    private static getNucleobaseColor(nucleobase: Nucleobase): Color {
        return this.getNucleobaseTypeColor(nucleobase.type);
    }

    private createCylinder(radius: number = 1): Buffer[] {
        let buffers: Array<Buffer> = new Array<Buffer>(1);

        const start = this.dna.startPos;
        const end = this.dna.endPos;

        buffers[0] = BufferCreator.createCylinderBuffer(start, end, new Vector3(1, 1, 1), new Vector3(1, 1, 1), radius);

        return buffers;
    }

    private createManyCylinders(radius: number = 1): Buffer[] {
        if (this.dna.lengthInNanometers == 0) return [];
        if (this.dna instanceof DummyDNAStrand) return this.createCylinder(radius);

        const n = this.dna.numOfNucleobases;
        let buffers: Array<Buffer> = new Array<Buffer>(1);

        const start: Vector3 = this.dna.startPos;
        const end: Vector3 = this.dna.endPos;

        let curPos: Vector3 = start;
        const increment: Vector3 = end.clone().sub(start).divideScalar(n);
        let nextPos: Vector3 = start.clone().add(increment);

        let position1Array = new Float32Array(n * 3);
        let position2Array = new Float32Array(n * 3);
        let color1Array = new Float32Array(n * 3);
        let color2Array = new Float32Array(n * 3);
        let radiusArray = new Float32Array(n);

        const nucleobases = this.dna.nucleobases;
        for (let i = 0, j = 0; i < n; ++i, j += 3) {
            const color = DNARepresentation.getNucleobaseColor(nucleobases[i]);

            BufferCreator.insertVector3InFloat32Array(position1Array, curPos, j);
            BufferCreator.insertVector3InFloat32Array(position2Array, nextPos, j);
            BufferCreator.insertColorInFloat32Array(color1Array, color, j);
            BufferCreator.insertColorInFloat32Array(color2Array, color, j);
            radiusArray[i] = radius;

            curPos = nextPos.clone();
            nextPos.add(increment);
        }

        buffers[0] = BufferCreator.createCylinderStripBufferFromArrays(position1Array, position2Array,
            color1Array, color2Array, radiusArray);

        return buffers;
    }
}

export default DNARepresentation;