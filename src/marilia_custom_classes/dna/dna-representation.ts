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

    private static getNucleotidePosition(yPos: number, nucleotideRadius: number, offsetAngleInRad: number = 0): Vector3 {
        const xPos: number = Math.sin(yPos * 2 * Math.PI / AbstractDnaStrand.HELIX_PITCH) * AbstractDnaStrand.HELIX_RADIUS - nucleotideRadius;
        const zPos: number = Math.cos(yPos * 2 * Math.PI / AbstractDnaStrand.HELIX_PITCH) * AbstractDnaStrand.HELIX_RADIUS - nucleotideRadius;
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
        let colorArray = new Float32Array(n * 3);
        let radiusArray = new Float32Array(n);
        let pickerArray = new Uint32Array(n);

        const nucleotides = this.dna.nucleotides;
        for (let i = 0, j = 0; i < n; ++i, j += 3) {
            const color = DnaRepresentation.getNucleotideColor(nucleotides[i]);

            position1Array[j  ] = curPos.x;
            position1Array[j+1] = curPos.y;
            position1Array[j+2] = curPos.z;
            position2Array[j  ] = nextPos.x;
            position2Array[j+1] = nextPos.y;
            position2Array[j+2] = nextPos.z;
            colorArray[j  ] = color.r;
            colorArray[j+1] = color.g;
            colorArray[j+2] = color.b;
            radiusArray[i] = AbstractDnaStrand.HELIX_RADIUS;
            pickerArray[i] = i;

            curPos = nextPos.clone();
            nextPos.add(increment);
        }

        let picker: NucleotidePicker = new NucleotidePicker(pickerArray, this.dna);

        buffers[0] = BufferCreator.createCylinderStripBufferFromArrays(position1Array, position2Array,
            colorArray, colorArray, radiusArray, picker);

        return buffers;
    }

    private createBallsAndSticks() {
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

        let cylinders = {
            position1: new Float32Array((n - 1) * 3),
            position2: new Float32Array((n - 1) * 3),
            color1: new Float32Array((n - 1) * 3),
            color2: new Float32Array((n - 1) * 3),
            radius: new Float32Array(n - 1),
            //picker: new Uint32Array(n - 1),
        }

        let spheres = {
            position: new Float32Array(n * 3),
            color: new Float32Array(n * 3),
            radius: new Float32Array(n),
            picking: new Uint32Array(n),
        }

        const nucleotides = this.dna.nucleotides;
        const colorWhite = new Color(1, 1, 1);
        const ballRadius = AbstractDnaStrand.HEIGHT_DISTANCE_BETWEEN_NUCLEOTIDES / 3 * 2;
        const stickRadius = ballRadius / 3;
        let curPos: Vector3 = DnaRepresentation.getNucleotidePosition(0, ballRadius).applyMatrix4(mat);
        for (let i = 0, j = 0; i < n; ++i, j += 3) {
            const y = (i + 1) * AbstractDnaStrand.HEIGHT_DISTANCE_BETWEEN_NUCLEOTIDES;
            let nextPos = DnaRepresentation.getNucleotidePosition(y, ballRadius).applyMatrix4(mat);
            let color: Color = DnaRepresentation.getNucleotideColor(nucleotides[i]);

            spheres.position[j  ] = curPos.x;
            spheres.position[j+1] = curPos.y;
            spheres.position[j+2] = curPos.z;
            spheres.color[j  ] = color.r;
            spheres.color[j+1] = color.g;
            spheres.color[j+2] = color.b;
            spheres.radius[i] = ballRadius;
            spheres.picking[i] = i;

            //cylinders.position1 is the same as spheres.position
            cylinders.position2[j  ] = nextPos.x;
            cylinders.position2[j+1] = nextPos.y;
            cylinders.position2[j+2] = nextPos.z;
            cylinders.color1[j  ] = colorWhite.r;
            cylinders.color1[j+1] = colorWhite.g;
            cylinders.color1[j+2] = colorWhite.b;
            // cylinders.color2 is the same as cylinders.color1
            cylinders.radius[i] = stickRadius;

            curPos = nextPos;
        }
        cylinders.position1 = spheres.position;
        cylinders.color2 = cylinders.color1;

        let ballPicker: NucleotidePicker = new NucleotidePicker(spheres.picking, this.dna);

        buffers[0] = BufferCreator.createCylinderStripBufferFromArrays(
            cylinders.position1, cylinders.position2, cylinders.color1, cylinders.color2, cylinders.radius);
        buffers[1] = BufferCreator.createSphereBufferFromArrays(
            spheres.position, spheres.color, spheres.radius, ballPicker);

        return buffers;
    }
}

export default DnaRepresentation;