import { Vector3 } from "three";
import PickingProxy from "../controls/picking-proxy";
import { Stage } from "../ngl";
import DnaOrigamiNanostructure from "./DnaOrigamiNanostructure"
import CustomComponent from "./CustomComponent"
import Shape from "../geometry/shape";

class ModelingControls {
    private _isEnabled: boolean;
    private newComponentPositions: Vector3[]
    private pointVisTempShapeComponent : any = undefined
    private lastNumOfPoints: number = 0

    public stage: Stage;

    constructor(stage: Stage) {
        this.stage = stage;
        this._isEnabled = false;
        this.newComponentPositions = [];

        // .bind(this) call is necessary to have correct "this" reference in the event listeners
        this.stage.signals.clicked.add(this.onMouseClick.bind(this));

        this.update = this.update.bind(this);
        this.update();
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

    update(): void {
        if (this.newComponentPositions.length !== this.lastNumOfPoints) {
            if (this.pointVisTempShapeComponent !== undefined) {
                this.pointVisTempShapeComponent.dispose();
            }

            var shape = new Shape("Temporary shape");
            for (let i = 0; i < this.newComponentPositions.length; ++i) {
                shape.addSphere(this.newComponentPositions[i], [0, 0, 1], 1, "Selected position");
            }
            this.pointVisTempShapeComponent = this.stage.addComponentFromObject(shape);
            this.pointVisTempShapeComponent.addRepresentation("buffer");

            this.lastNumOfPoints = this.newComponentPositions.length;
        }

        window.requestAnimationFrame(this.update);
    }

    resetControls(): void {
        this.newComponentPositions = [];
    }

    onMouseClick(pickingProxy: PickingProxy): void {
        if (!this.isEnabled || pickingProxy !== undefined) { return; }

        if (this.newComponentPositions.length < 3) {
            this.newComponentPositions.push(
                this.stage.mouseObserver.getWorldPosition());
        }

        if (this.newComponentPositions.length == 3) {
            const bottomLeftCornerPos: Vector3 = this.newComponentPositions[0];
            const blcToBrcVec: Vector3 = this.newComponentPositions[1].clone().sub(this.newComponentPositions[0]);
            const brcToTrcVec: Vector3 = this.newComponentPositions[2].clone().sub(this.newComponentPositions[1]);

            let newStructure = new DnaOrigamiNanostructure("DNA Origami Nanostructure", bottomLeftCornerPos, blcToBrcVec, brcToTrcVec);
            let newComp = new CustomComponent(this.stage, newStructure);

            newComp.setName("From Scratch");
            this.stage.addComponent(newComp);

            newComp.addRepresentation("multiscale", undefined);

            this.resetControls();
        }
    }
}

export default ModelingControls;