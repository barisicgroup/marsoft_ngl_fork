import Stage from "../stage/stage";
import PickingProxy from "../controls/picking-proxy";
import TestModification from "./TEST";

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


    private _state: MariliaActionsState = MariliaActionsState.DEFAULT;

    get state() {
        return this._state;
    }

    set state(s: MariliaActionsState) {
        this._state = s;

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
        // TODO remove TestModification class eventually
        this.testModification.clickPick_left(stage, pickingProxy);
        return true;
    }

    /**
     * Returns true if further actions should be blocked
     * Returns false otherwise (action propagates)
     */
    public hover(stage: Stage, pickingProxy: PickingProxy): boolean {
        // TODO remove TestModification class eventually
        this.testModification.hover(stage, pickingProxy);
        return false;
    }

    /**
     * Returns true if further actions should be blocked
     * Returns false otherwise (action propagates)
     */
    public drag_left(stage: Stage, dx: number, dy: number): boolean {
        if (this.state === MariliaActionsState.CREATE_DNA_STRAND) {
            // TODO
            return true;
        }
        return false;
    }
}

export default MariliaActions;