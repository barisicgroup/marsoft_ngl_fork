import Representation, {RepresentationParameters} from "../../representation/representation";
import Viewer from "../../viewer/viewer";
import DnaStrand, {
    AbstractDnaStrand,
    DummyDnaStrand,
    Nucleotide,
    NucleotideType,
    StrictNucleotideType
} from "./dna-strand";
import Buffer from "../../buffer/buffer"
import {defaults} from "../../utils";
import BufferCreator from "../geometry/BufferCreator";
import {Color, Matrix4, Quaternion, Vector3} from "three";
import NucleotidePicker from "./dna-picker";

interface DnaRepresentationParameters extends RepresentationParameters {
    representationScale: "cylinder";
}

class DnaRepresentation extends Representation {

    // Params
    protected representationScale: string;

    private dna: DnaStrand | DummyDnaStrand;

    constructor(dna: DnaStrand | DummyDnaStrand, viewer: Viewer, params: Partial<DnaRepresentationParameters>) {
        super(dna, viewer, params)

        this.dna = dna;

        this.parameters = Object.assign({
            representationScale: {
                type: "select",
                rebuild: true,
                options: {
                    "cylinder": "cylinder",
                    "cylinders": "cylinders",
                    "balls+sticks helix": "balls+sticks helix"
                }
            }
        }, this.parameters);

        this.init(params);
    }

    init(params: Partial<DnaRepresentationParameters>) {
        let p = params || {}; // TODO figure out what this does

        this.representationScale = defaults(p.representationScale, "balls+sticks helix");

        super.init(params);
        this.build();
    }

    create() {
        switch (this.representationScale) {
            case "cylinders":
                this.bufferList = this.createManyCylinders();
                break;
            case "balls+sticks helix":
                this.bufferList = this.createBallsAndSticks();
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

    private static getNucleotideTypeColor(t: NucleotideType): Color {
        switch (t) {
            // Colors taken from the Wikipedia images: https://en.wikipedia.org/wiki/Nucleobase
            case StrictNucleotideType.A: return new Color(0xe47a7a);
            case StrictNucleotideType.G: return new Color(0x8483d3);
            case StrictNucleotideType.C: return new Color(0xf8f49c);
            case StrictNucleotideType.T: return new Color(0xf8c39d);
        }
        return new Color(1, 1, 1);
    }

    private static getNucleotideColor(nucleotide?: Nucleotide): Color {
        return this.getNucleotideTypeColor(nucleotide?.type);
    }

    private static getNucleotidePosition(yPos: number, offsetAngleInRad: number = 0): Vector3 {
        const xPos: number = Math.sin(yPos * 2 * Math.PI / AbstractDnaStrand.HELIX_LEAD) * AbstractDnaStrand.HELIX_RADIUS;
        const zPos: number = Math.cos(yPos * 2 * Math.PI / AbstractDnaStrand.HELIX_LEAD) * AbstractDnaStrand.HELIX_RADIUS;
        return new Vector3(xPos, yPos, zPos);
    }

    // Must be unit vector (normalized)
    private static readonly DNA_DIRECTION: Vector3 = new Vector3(0, 1, 0);

    private createCylinder(): Buffer[] {
        let buffers: Array<Buffer> = new Array<Buffer>(1);

        const start = this.dna.startPos;
        const end = this.dna.endPos;

        buffers[0] = BufferCreator.createCylinderBuffer(start, end, new Vector3(1, 1, 1), new Vector3(1, 1, 1), AbstractDnaStrand.HELIX_RADIUS);

        return buffers;
    }

    private createManyCylinders(): Buffer[] {
        if (this.dna.lengthInNanometers == 0) return [];
        if (this.dna instanceof DummyDnaStrand) return this.createCylinder();

        const n = this.dna.numOfNucleotides;
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
        let pickerArray = new Uint32Array(n);

        const nucleotides = this.dna.nucleotides;
        for (let i = 0, j = 0; i < n; ++i, j += 3) {
            const color = DnaRepresentation.getNucleotideColor(nucleotides[i]);

            BufferCreator.insertVector3InFloat32Array(position1Array, curPos, j);
            BufferCreator.insertVector3InFloat32Array(position2Array, nextPos, j);
            BufferCreator.insertColorInFloat32Array(color1Array, color, j);
            BufferCreator.insertColorInFloat32Array(color2Array, color, j);
            radiusArray[i] = AbstractDnaStrand.HELIX_RADIUS;
            pickerArray[i] = i;

            curPos = nextPos.clone();
            nextPos.add(increment);
        }

        let picker: NucleotidePicker = new NucleotidePicker(pickerArray, this.dna);

        buffers[0] = BufferCreator.createCylinderStripBufferFromArrays(position1Array, position2Array,
            color1Array, color2Array, radiusArray, picker);

        return buffers;
    }

    private createBallsAndSticks(ballRadius: number = 0.25, stickRadius: number = 0.1) {
        //if (this.dna.lengthInNanometers == 0) return [];
        if (this.dna instanceof DummyDnaStrand) return this.createCylinder();

        const n = this.dna.numOfNucleotides;
        let buffers: Array<Buffer> = new Array<Buffer>(2);

        const start: Vector3 = this.dna.startPos;
        const dir: Vector3 = this.dna.direction;

        const rotationQuaternion: Quaternion = new Quaternion().setFromUnitVectors(DnaRepresentation.DNA_DIRECTION, dir);
        const rot: Matrix4 = new Matrix4().makeRotationFromQuaternion(rotationQuaternion);
        let mat = rot.clone().premultiply(new Matrix4().makeTranslation(start.x, start.y, start.z));
        // Name 'mat' is a bit too generic... TODO rename it to something more meaningful

        /*let cylinders = {
            position1: new Float32Array((n - 1) * 3),
            position2: new Float32Array((n - 1) * 3),
            color1: new Float32Array((n - 1) * 3),
            color2: new Float32Array((n - 1) * 3),
            radius: new Float32Array((n - 1)),
            //picker: new Uint32Array(n),
        }*/

        let spheres = {
            position: new Float32Array(n * 3),
            color: new Float32Array(n * 3),
            radius: new Float32Array(n),
            picking: new Uint32Array(n),
        }

        let y: number = 0;
        const yInc: number = AbstractDnaStrand.HEIGHT_DISTANCE_BETWEEN_NUCLEOTIDES;
        const nucleotides = this.dna.nucleotides;
        for (let i = 0, j = 0; i < n; ++i, j += 3) {
            let position: Vector3 = DnaRepresentation.getNucleotidePosition(y);
            position.applyMatrix4(mat);
            let color: Color = DnaRepresentation.getNucleotideColor(nucleotides[i]);

            BufferCreator.insertVector3InFloat32Array(spheres.position, position, j);
            BufferCreator.insertColorInFloat32Array(spheres.color, color, j);
            spheres.radius[i] = ballRadius;
            spheres.picking[i] = i;

            y+= yInc;
        }

        let picker: NucleotidePicker = new NucleotidePicker(spheres.picking, this.dna);

        //buffers[0] = BufferCreator.createCylinderStripBufferFromArrays(position1Array, position2Array,
        //    color1Array, color2Array, radiusArray, picker);

        buffers[1] = BufferCreator.createSphereBufferFromArrays(
            spheres.position, spheres.color, spheres.radius, picker);

        return buffers;
    }
}

export default DnaRepresentation;