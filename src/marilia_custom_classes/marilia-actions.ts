import Stage from "../stage/stage";
import PickingProxy from "../controls/picking-proxy";
import TestModification from "./TEST";
import {Vector3} from "three";
import DnaStrand, {DummyDnaStrand} from "./dna/dna-strand";
import {DnaStrandComponent} from "./dna/dna-component";

export enum MariliaActionsState {
    DEFAULT,

    // Creation states
    CREATE_DNA_STRAND,

    // Manipulation states
    BOND_FROM_ATOM,
    BOND_BETWEEN_ATOMS,
    REMOVE
}

class MariliaActions {
    // TODO remove TestModification class eventually
    private readonly testModification: TestModification = new TestModification();

    private data: {[id: string]: any} = {}; // Dictionary used for interactions

    private _state: MariliaActionsState = MariliaActionsState.DEFAULT;

    get state() {
        return this._state;
    }

    set state(s: MariliaActionsState) {
        this._state = s;
        this.data = {};

        // TODO remove TestModification class eventually
        switch (s) {
            case MariliaActionsState.DEFAULT:
                this.testModification.setModeToNone();
                break;
            case MariliaActionsState.BOND_FROM_ATOM:
                this.testModification.setModeToBondFromAtom();
                break;
            case MariliaActionsState.BOND_BETWEEN_ATOMS:
                this.testModification.setModeToBondBetweenAtoms();
                break;
            case MariliaActionsState.REMOVE:
                this.testModification.setModeToRemove();
                break;
            default:
                return;
        }
    }

    /**
     * Returns true if further actions should be blocked
     * Returns false otherwise (action propagates)
     */
    public clickPick_left(stage: Stage, pickingProxy: PickingProxy): boolean {
        if (this.state === MariliaActionsState.DEFAULT) {
            return false;
        }

        if (this.state === MariliaActionsState.CREATE_DNA_STRAND) {

            let pos: Vector3 = stage.mouseObserver.getWorldPosition();

            if (!this.data.dnaStrand) {
                this.data.dnaStrand = new DummyDnaStrand(pos, pos);
                this.data.component = new DnaStrandComponent(stage, this.data.dnaStrand);
                this.data.component.setName("DNA strand (dummy)");
                stage.addComponent(this.data.component);
                this.data.component.addRepresentation("TODO", undefined); //TODO
                return true;
            }

            this.data.dnaStrand.endPos = pos;
            console.log(this.data.dnaStrand.startPos);
            console.log(pos);

            let dnaStrand: DnaStrand = this.data.dnaStrand.toDNAStrand();
            for (let i = 0; i < dnaStrand.nucleotides.length; ++i) {
                dnaStrand.nucleotides[i].type = Math.floor(Math.random() * 4);
            }
            let component: DnaStrandComponent = new DnaStrandComponent(stage, dnaStrand);
            component.setName("DNA strand");
            stage.removeComponent(this.data.component);
            stage.addComponent(component);
            component.addRepresentation("TODO", undefined); // TODO

            this.data = {};
            return true;
        }

        // TODO remove TestModification class eventually
        this.testModification.clickPick_left(stage, pickingProxy);

        return true;
    }

    /**
     * Returns true if further actions should be blocked
     * Returns false otherwise (action propagates)
     */
    public hover(stage: Stage, pickingProxy: PickingProxy): boolean {
        if (this.state === MariliaActionsState.DEFAULT) {
            return false;
        }

        if (this.state === MariliaActionsState.CREATE_DNA_STRAND) {
            if (this.data.dnaStrand) {
                let pos: Vector3 = stage.mouseObserver.getWorldPosition();
                this.data.dnaStrand.endPos = pos;
                this.data.component.updateRepresentations();
            }
            return true;
        }

        // TODO remove TestModification class eventually
        this.testModification.hover(stage, pickingProxy);
        return false;
    }

    /**
     * Returns true if further actions should be blocked
     * Returns false otherwise (action propagates)
     */
    public drag_left(stage: Stage, dx: number, dy: number): boolean {
        return false;
    }
}

export default MariliaActions;
