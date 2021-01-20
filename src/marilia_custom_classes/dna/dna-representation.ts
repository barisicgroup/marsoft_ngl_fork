import Representation, {RepresentationParameters} from "../../representation/representation";
import Viewer from "../../viewer/viewer";
import {DNAStrand} from "./dna-strand";
import Buffer from "../../buffer/buffer"
import {defaults} from "../../utils";
import CylinderImpostorBuffer, {CylinderImpostorBufferParameters} from "../../buffer/cylinderimpostor-buffer";
import {CylinderBufferData} from "../../buffer/cylinder-buffer";

interface DNARepresentationParameters extends RepresentationParameters {
    representationScale: "cylinder";
}

class DNARepresentation extends Representation {

    // Params
    protected representationScale: string;

    private dna: DNAStrand;

    constructor(dna: DNAStrand, viewer: Viewer, params: Partial<DNARepresentationParameters>) {
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
        // TODO
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
        const end = start.add(this.dna.direction.multiplyScalar(this.dna.lengthInNanometers));
        let data: CylinderBufferData = {
            position1: new Float32Array(3),
            position2: new Float32Array(3),
            color2: new Float32Array(3),
            radius: new Float32Array(1),
        };
        data.position1[0] = start.x;
        data.position1[1] = start.y;
        data.position1[2] = start.z;
        data.position2[0] = end.x;
        data.position2[1] = end.y;
        data.position2[2] = end.z;
        data.color2[0] = 1;
        data.color2[1] = 1;
        data.color2[2] = 1;
        data.radius[0] = 1;

        let params: Partial<CylinderImpostorBufferParameters> = {
          openEnded: false,
        };

        buffers[0] = new CylinderImpostorBuffer(data, params);

        return buffers;
    }
}

export default DNARepresentation;