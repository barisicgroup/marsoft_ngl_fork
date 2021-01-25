import Representation, {RepresentationParameters} from "../../representation/representation";
import Viewer from "../../viewer/viewer";
import DNAStrand, {DummyDNAStrand} from "./dna-strand";
import Buffer from "../../buffer/buffer"
import {defaults} from "../../utils";
import BufferCreator from "../geometry/BufferCreator";
import {Vector3} from "three";

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
                    "cylinder": "cylinder"
                }
            }
        }, this.parameters);

        this.init(params);
    }

    init(params: Partial<DNARepresentationParameters>) {
        let p = params || {}; // TODO figure out what this does

        this.representationScale = defaults(p.representationScale, "cylinder");

        super.init(params);
        this.build();
    }

    create() {
        switch (this.representationScale) {
            case "cylinder":
            default:
                //this.buffers = this.createCylinder();
                this.bufferList = this.createCylinder();
        }
    }

    update(what?: any) {
        // TODO?
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

    private createCylinder(): Buffer[] {
        let buffers: Array<Buffer> = new Array<Buffer>(1);

        const start = this.dna.startPos;
        const end = this.dna.endPos;
        //const start = new Vector3(0, 0, 0);
        //const end = new Vector3(0, 10, 0);

        buffers[0] = BufferCreator.createCylinderBuffer(start, end, new Vector3(1, 1, 1), new Vector3(1, 1, 1), 1);

        return buffers;
    }
}

export default DNARepresentation;