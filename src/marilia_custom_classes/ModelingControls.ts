import { Vector3 } from "three";
import PickingProxy from "../controls/picking-proxy";
import { Stage } from "../ngl";
import DnaOrigamiNanostructure from "./DnaOrigamiNanostructure"
import CustomComponent from "./CustomComponent"

class ModelingControls {
    private _isEnabled: boolean;
    private newComponentPositions: Vector3[]
    private lastMouseClick: Date
    private doubleClickDelay: number = 0.4

    public stage: Stage;

    constructor(stage: Stage) {
        this.stage = stage;
        this._isEnabled = false;
        this.newComponentPositions = [];
        this.lastMouseClick = new Date();

        // .bind(this) call is necessary to have correct "this" reference in the event listeners
        this.stage.signals.clicked.add(this.onMouseClick.bind(this));
    }

    get isEnabled(): boolean {
        return this._isEnabled;
    }

    set isEnabled(value: boolean) {
        this._isEnabled = value;
        if (!value) {
            this.resetControls();
        }
    }

    resetControls(): void {
        this.newComponentPositions = [];
    }

    onMouseClick(pickingProxy: PickingProxy): void {
        if (!this.isEnabled || pickingProxy !== undefined) { return; }

        const currTime = new Date();
        if ((currTime.getTime() - this.lastMouseClick.getTime()) / 1000.0 <= this.doubleClickDelay) {
            this.processDoubleClick();
        }
        else {
            this.processSingleClick();
        }

        this.lastMouseClick = currTime;
    }

    processSingleClick(): void {
        this.newComponentPositions.push(
            this.stage.mouseObserver.getWorldPosition());
    }

    processDoubleClick(): void {
        if (this.newComponentPositions.length < 2) { return; }

        let newStructure = new DnaOrigamiNanostructure("DNA Origami Nanostructure", this.newComponentPositions);
        let newComp = new CustomComponent(this.stage, newStructure);

        newComp.setName("From Scratch");
        this.stage.addComponent(newComp);

        newComp.addRepresentation("multiscale", undefined);

        this.resetControls();
    }
}

export default ModelingControls;